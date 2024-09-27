import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Restrict middleware to specific paths that require authentication
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/forms")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      console.log("Token not found, redirecting to login.");
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
    console.log("Token:", token);
  }

  return NextResponse.next();
}

// Apply middleware to specific paths only
export const config = {
  matcher: ["/dashboard/:path*", "/forms/:path*"],
};
