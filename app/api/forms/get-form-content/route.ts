// app/api/forms/get-form-content.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust the import path as needed

export async function GET(request: Request) {
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

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/forms/content/${formUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch form content: ${errorText}` },
        { status: response.status }
      );
    }

    const formContent = await response.json();
    return NextResponse.json(formContent, { status: 200 });
  } catch (error) {
    console.error("Error fetching form content:", error);
    return NextResponse.json(
      { error: "Failed to fetch form content" },
      { status: 500 }
    );
  }
}
