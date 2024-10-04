import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth"; // You should have your auth options defined here
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json(); // Parse the incoming JSON request body

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

    const data = await response.json();

    if (!response.ok) {
      const errorText = await response.text(); // Get the raw response text
      console.error("Error response:", errorText); // Log the error for debugging
      return NextResponse.json(
        { message: `Error creating business: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
