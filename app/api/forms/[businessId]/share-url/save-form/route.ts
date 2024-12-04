import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.json();
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/save_form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from backend: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Error from backend: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /api/forms/save_form:", error.message);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving the form" },
      { status: 500 }
    );
  }
}
