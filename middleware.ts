import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/forms/submit") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/lab") ||
    pathname.startsWith("/forms") ||
    pathname.startsWith("/submit") ||
    pathname.startsWith("/builder")
  ) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      return NextResponse.next();
    }
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/forms/:path*",
    "/lab/:path*",
    "/builder/:path*",
    "/submit/:path*",
  ],
};
