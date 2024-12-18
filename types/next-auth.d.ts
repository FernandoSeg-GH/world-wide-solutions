import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    accessTokenExpires?: number; // Add this line
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
    expires_in?: number; // Correct type for expiration
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
    accessTokenExpires?: number; // Correct type
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

// import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
// import { JWT as NextAuthJWT } from "next-auth/jwt";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     accessToken?: string;
//     error?: string;
//     user: {
//       id: number;
//       username: string;
//       email: string;
//       businessId?: number | null;
//       role: {
//         id: number;
//         name: string;
//       };
//     } & DefaultSession["user"];
//   }

//   interface User extends DefaultUser {
//     access_token?: string;
//     refresh_token?: string;
//     id: number;
//     username: string;
//     email: string;
//     businessId?: number | null;
//     expires_in?: any;
//     role: {
//       id: number;
//       name: string;
//     };
//   }
// }
// export type User = NextAuthUser;
// declare module "next-auth/jwt" {
//   interface JWT extends NextAuthJWT {
//     accessToken?: string;
//     refreshToken?: string;
//     accessTokenExpires?: number;
//     error?: string;
//     id?: number;
//     username?: string;
//     email?: string;
//     business_id?: number | null;
//     role?: {
//       id: number;
//       name: string;
//     };
//   }
// }
