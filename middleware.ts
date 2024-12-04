import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";

const TOKEN_EXPIRATION_THRESHOLD = 60 * 1000; // 1 minute

export async function refreshAccessToken(refreshToken: string): Promise<any> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to refresh token: ${response.status} - ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log("Token refreshed successfully:", data);
  return data;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.next();
  }

  const accessTokenExpires = token.accessTokenExpires as number;
  const timeUntilExpiration = accessTokenExpires - Date.now();

  if (timeUntilExpiration < TOKEN_EXPIRATION_THRESHOLD) {
    try {
      const refreshedTokens = await refreshAccessToken(
        String(token.refreshToken)
      );

      token.accessToken = refreshedTokens.access_token;
      token.refreshToken = refreshedTokens.refresh_token ?? token.refreshToken;
      token.accessTokenExpires = Date.now() + refreshedTokens.expires_in * 1000;

      return NextResponse.next();
    } catch (error) {
      console.error("Error refreshing token:", error);
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  return NextResponse.next();
}
