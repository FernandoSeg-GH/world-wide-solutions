import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.next();
  }

  const accessTokenExpires = token.accessTokenExpires as number;
  const timeUntilExpiration = accessTokenExpires - Date.now();

  if (timeUntilExpiration < 60 * 1000) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.refreshToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const refreshedTokens = await response.json();

      token.accessToken = refreshedTokens.access_token;
      token.refreshToken = refreshedTokens.refresh_token ?? token.refreshToken;

      const decodedAccessToken = jwtDecode<{ exp: number }>(
        refreshedTokens.access_token
      );
      token.accessTokenExpires = decodedAccessToken.exp * 1000;

      return NextResponse.next();
    } catch (error) {
      console.error("Error refreshing token:", error);
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  return NextResponse.next();
}
