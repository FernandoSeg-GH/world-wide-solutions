import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const secret = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
