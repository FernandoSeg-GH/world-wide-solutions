import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

const TOKEN_EXPIRATION_THRESHOLD = 60 * 1000; // 1 minute

export async function refreshAccessToken(token: JWT) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const refreshedTokens = await response.json();
    const decodedAccessToken = jwt.decode(
      refreshedTokens.access_token
    ) as jwt.JwtPayload;

    if (!decodedAccessToken || !decodedAccessToken.exp) {
      throw new Error("Access token missing exp claim");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: decodedAccessToken.exp * 1000, // ms
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
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
        token.refreshToken as unknown as JWT
      );

      token.accessToken = refreshedTokens.accessToken;
      token.refreshToken = refreshedTokens.refreshToken || token.refreshToken;
      token.accessTokenExpires =
        Date.now() + Number(refreshedTokens.accessTokenExpires) * 1000;

      return NextResponse.next();
    } catch (error) {
      console.error("Error refreshing token:", error);
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
  }

  return NextResponse.next();
}
