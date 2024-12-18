import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

const TOKEN_EXPIRATION_THRESHOLD = 5 * 60 * 1000; // 5 minutes

async function refreshAccessToken(refreshToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to refresh access token");

    const refreshedTokens = await response.json();
    const decodedAccessToken = jwt.decode(
      refreshedTokens.accessToken
    ) as jwt.JwtPayload;

    if (!decodedAccessToken || !decodedAccessToken.exp)
      throw new Error("Access token missing expiration claim");

    return {
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken || refreshToken,
      accessTokenExpires: decodedAccessToken.exp * 1000,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  if (req.method !== "POST") return NextResponse.next();
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 50 * 1024 * 1024) {
    return NextResponse.json({ message: "Payload too large" }, { status: 413 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.accessTokenExpires) {
    return NextResponse.next(); // Skip if token or expiration is undefined
  }

  const timeUntilExpiration = token.accessTokenExpires - Date.now();

  if (timeUntilExpiration < TOKEN_EXPIRATION_THRESHOLD) {
    const refreshedTokens = await refreshAccessToken(
      token.refreshToken as string
    );

    if (!refreshedTokens) {
      console.error("Failed to refresh tokens.");
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    req.cookies.set("next-auth.session-token", refreshedTokens.accessToken);
  }

  return NextResponse.next();
}
