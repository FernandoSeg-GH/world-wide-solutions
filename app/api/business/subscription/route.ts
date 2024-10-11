// pages/api/business/subscription/route.ts

import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth"; // Ensure correct path
import { getServerSession } from "next-auth/next";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/subscription`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching subscription plans:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch subscription plans." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
