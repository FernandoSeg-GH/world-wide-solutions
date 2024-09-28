import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Get session and check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body to extract form data
    const formData = await req.json();
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    // Call the Flask backend to save the form data
    const response = await fetch(`${API_URL}/forms/save_form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Pass access token for authentication
      },
      body: JSON.stringify(formData), // Pass the form data received from the frontend
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from backend: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Error from backend: ${errorText}` },
        { status: response.status }
      );
    }

    // Parse the successful response from the Flask API
    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    // Log the error for debugging and return a 500 status
    console.error("Error in POST /api/forms/save_form:", error.message);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving the form" },
      { status: 500 }
    );
  }
}
