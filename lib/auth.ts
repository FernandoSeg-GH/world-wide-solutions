import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken"; // Import jsonwebtoken

async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.refreshToken}`, // Use refresh token
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

    // Return updated token and reset expiration time
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: decodedAccessToken.exp * 1000, // Convert to ms
      refreshToken: token.refreshToken,
      businessId: refreshedTokens.user.business_id,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);

    // Return the token with an error flag
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  useSecureCookies: false,
  pages: {
    signIn: "/auth/sign",
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

          const data = await res.json();

          if (res.ok && data.access_token) {
            // Return token information to be used in jwt callback
            return {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_in: data.expires_in, // Access token expiration in seconds
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
              business_id: data.user.business_id,
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
      // Initialize token on login
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
        return token;
      }

      // Check if token is still valid
      if (Date.now() < token.accessTokenExpires!) {
        return token; // Token is still valid
      }

      // If access token expired, try to refresh it
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
      };
      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
