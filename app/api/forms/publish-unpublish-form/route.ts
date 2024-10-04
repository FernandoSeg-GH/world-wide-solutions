import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { form_id, action } = await req.json();

  if (!form_id) {
    return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
  }

  if (!["publish", "unpublish"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/forms/publish_unpublish_form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ form_id, action }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || `Failed to ${action} form`);
    }

    const result = JSON.parse(responseText);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`Error ${action}ing form:`, error);
    return NextResponse.json(
      { error: `Failed to ${action} form` },
      { status: 500 }
    );
  }
}
