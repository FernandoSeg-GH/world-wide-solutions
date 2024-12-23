import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user: {
      id: number;
      username: string;
      email: string;
      businessId?: number | null;
      role: {
        id: number;
        name: string;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    accessToken?: string;
    refreshToken?: string;
    id: number;
    username: string;
    email: string;
    businessId?: number | null;
    expires_in?: number;
    role: {
      id: number;
      name: string;
    };
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
    business_id?: number | null;
    role?: {
      id: number;
      name: string;
    };
  }
}
