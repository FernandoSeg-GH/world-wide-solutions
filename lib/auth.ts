import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

async function refreshAccessToken(token: JWT) {
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

    const decodedAccessToken = jwt.decode(
      refreshedTokens.accessToken
    ) as jwt.JwtPayload;

    if (!decodedAccessToken || !decodedAccessToken.exp) {
      throw new Error("Access token does not have an exp claim");
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: decodedAccessToken.exp * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
      businessId: refreshedTokens.user.business_id,
      role: {
        id: refreshedTokens.user.role.id,
        name: refreshedTokens.user.role.name,
      },
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-in",
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
              access_token: data.access_token,
              refresh_token: data.refresh_token,
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
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;

        const decodedAccessToken = jwt.decode(
          String(user.access_token)
        ) as jwt.JwtPayload;

        if (!decodedAccessToken || !decodedAccessToken.exp) {
          throw new Error("Access token does not have an exp claim");
        }

        token.accessTokenExpires = decodedAccessToken.exp * 1000;
        token.id = Number(user.id);
        token.email = user.email;
        token.username = user.username;
        token.name = user.username;
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

      const newToken = await refreshAccessToken(token);

      if (newToken.error) {
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }

      return newToken;
    },
    async session({ session, token }) {
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
