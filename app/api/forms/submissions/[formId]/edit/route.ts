import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string; formId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { formId } = params;
  const submissionId = formId; // Adjust this if submission ID differs from form ID in your setup
  const editUrl = `${process.env.BACKEND_URL}/submission/${submissionId}/edit`;

  try {
    // Extract token if available from request headers for authorization
    const token = request.headers.get("Authorization") || "";

    // Prepare request payload
    const body = await request.json();

    // Forward the PUT request to the Flask backend
    const res = await fetch(editUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    // Handle the response from the backend
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.message },
        { status: res.status }
      );
    }

    const responseData = await res.json();
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error forwarding PUT request:", error);
    return NextResponse.json(
      { error: "Failed to edit the submission" },
      { status: 500 }
    );
  }
}
