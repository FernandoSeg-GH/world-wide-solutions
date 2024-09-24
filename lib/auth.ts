import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `${process.env.FLASK_BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
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
            `${process.env.FLASK_BACKEND_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(credentials),
            }
          );

          const data = await res.json();

          if (credentials && res.ok && data.access_token) {
            return {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              id: data.user.id,
              email: data.user.email,
              username: String(credentials.username),
            };
          } else {
            console.error(
              "Login failed: Invalid credentials or no access token"
            );
            return null;
          }
        } catch (error) {
          console.error("Login error:", error);
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
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
        token.id = Number(user.id);
        token.username = user.username;
        token.email = user.email;
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      session.user = {
        ...session.user,
        id: Number(token.id),
        username: String(token.username),
        email: String(token.email),
      };

      return session;
    },
  },

  secret: process.env.JWT_SECRET,
};
