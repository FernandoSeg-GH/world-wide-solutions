import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: string;
    user: {
      id: number;
      username: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    access_token?: string;
    refresh_token?: string;
    id: number;
    username: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    id?: number;
    username?: string;
    email?: string;
  }
}
