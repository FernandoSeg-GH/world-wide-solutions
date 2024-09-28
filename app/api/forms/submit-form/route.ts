// app/api/forms/submit-form.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust the import path as needed

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formUrl = searchParams.get("formUrl");

  if (!formUrl) {
    return NextResponse.json(
      { error: "Form URL is required" },
      { status: 400 }
    );
  }

  const { content } = await request.json();

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/forms/submit/${formUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to submit form: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
