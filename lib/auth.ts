import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const refreshedTokens = await response.json();

    const decodedAccessToken = jwt.decode(
      refreshedTokens.access_token
    ) as jwt.JwtPayload;

    if (!decodedAccessToken || !decodedAccessToken.exp) {
      throw new Error("Access token does not have an exp claim");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: decodedAccessToken.exp * 1000,
      refreshToken: refreshedTokens.refresh_token,
      businessId: refreshedTokens.user.business_id,
      role: refreshedTokens.user.role,
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
    signIn: "/auth/sign",
    signOut: "/auth/sign",
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

          const data = await res.json();
          if (res.ok && data.access_token) {
            return {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_in: data.expires_in,
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
              business_id: data.user.business_id,
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
        token.businessId = user.business_id;
        token.role = user.role;
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
        businessId: token.businessId,
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
