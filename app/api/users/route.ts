// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

// Hardcode the token for now (later you can fetch it dynamically)
const TOKEN = "your_token_here";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000"; // Adjust as per your environment

  try {
    // Make the request to your Flask backend to get all users
    const response = await fetch(`${backendUrl}/users/users`, {
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
