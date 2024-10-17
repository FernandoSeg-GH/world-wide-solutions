// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedPaths = [
  "/dashboard",
  "/forms",
  "/builder",
  // Add more protected routes as needed
];

// Helper function to check if the path is protected
const isProtectedPath = (pathname: string): boolean => {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`Middleware: Processing request for ${pathname}`);

  // Check if the requested path is protected
  // if (isProtectedPath(pathname)) {
  //   console.log("Middleware: Protected path, checking authentication.");

  //   // Retrieve the token using NextAuth's getToken
  //   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  //   if (token) {
  //     console.log("Middleware: Authentication token found.", token);
  //     // If token is valid, allow access
  //     return NextResponse.next();
  //   }

  //   // If no valid token, redirect to sign-in page with callbackUrl
  //   console.log("Middleware: No valid token found, redirecting to sign-in.");
  //   const signInUrl = new URL("/auth/sign-in", req.nextUrl.origin);
  //   signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  //   return NextResponse.redirect(signInUrl);
  // }

  // For all other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/forms/:path*",
    "/builder/:path*",
    // Add more patterns as needed
  ],
};
