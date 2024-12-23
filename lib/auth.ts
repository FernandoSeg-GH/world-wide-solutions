import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

interface RefreshedTokens {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpires: number;
  businessId?: number;
  role?: {
    id: number;
    name: string;
  };
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const refreshedTokens = await response.json();

    const decodedAccessToken = jwtDecode<{ exp: number }>(
      refreshedTokens.accessToken
    );

    if (!decodedAccessToken || !decodedAccessToken.exp) {
      throw new Error("Access token does not have an exp claim");
    }

    const newToken: JWT = {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: decodedAccessToken.exp * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
      business_id: refreshedTokens.user.business_id,
      role: refreshedTokens.user.role
        ? {
            id: refreshedTokens.user.role.id,
            name: refreshedTokens.user.role.name,
          }
        : token.role,
    };

    return newToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: {
    signIn: "/",
    signOut: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(credentials),
            }
          );

          if (!res.ok) {
            throw new Error("Failed to login");
          }

          const data = await res.json();

          if (data.access_token) {
            return {
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expires_in: data.expires_in,
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
              businessId: data.user.business_id,
              role: data.user.role,
            };
          }

          return null;
        } catch (error) {
          console.error("Error during login:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + user.expires_in * 1000;
        token.id = Number(user.id);
        token.email = user.email;
        token.username = user.username;
        token.business_id = user.businessId;

        if (user.role && user.role.id && user.role.name) {
          token.role = {
            id: Number(user.role.id),
            name: user.role.name,
          };
        } else {
          token.role = {
            id: 1,
            name: "Unknown",
          };
        }

        return token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.accessToken = token.accessToken;
      session.user = {
        id: Number(token.id),
        email: String(token.email),
        username: String(token.username),
        name: String(token.username),
        businessId: token.business_id,
        role: {
          id: Number(token.role?.id ?? 1),
          name: String(token.role?.name ?? "Unknown"),
        },
      };
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
