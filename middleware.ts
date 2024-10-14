import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/forms/submit") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/forms") ||
    pathname.startsWith("/submit") ||
    pathname.startsWith("/builder")
  ) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      const response = NextResponse.next();
      response.headers.set("x-access-token", token.accessToken as string);
      return response;
    }
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/forms/:path*",
    "/builder/:path*",
    "/submit/:path*",
  ],
};
