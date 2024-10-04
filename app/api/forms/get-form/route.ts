import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareUrl = searchParams.get("shareUrl");

  if (!shareUrl) {
    return NextResponse.json(
      { message: "shareUrl is required" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";
  try {
    const response = await fetch(
      `${API_URL}/forms/share_url/${shareUrl}/public`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching form by share_url: ${response.status} ${response.statusText} ${errorText}`
      );
      return NextResponse.json(
        { message: `Failed to fetch form by share_url: ${errorText}` },
        { status: response.status }
      );
    }

    const form = await response.json();
    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    console.error("Error fetching form by share_url:", error);
    return NextResponse.json(
      { message: "Failed to fetch form by share_url" },
      { status: 500 }
    );
  }
}
