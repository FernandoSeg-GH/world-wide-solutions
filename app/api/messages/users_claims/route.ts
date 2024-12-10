import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const fetchUrl = `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/messages/users_claims`;

    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // Double-check this value
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Fetch Error:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch users with claims" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Server Fetch Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
