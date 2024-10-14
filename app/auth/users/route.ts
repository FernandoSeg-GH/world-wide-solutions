import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${backendUrl}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
