import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/business`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching businesses:", data);
      return NextResponse.json(
        { message: data.message || "Failed to fetch businesses." },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/business/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating business:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Failed to create business." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
