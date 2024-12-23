import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { accidentClaimId, messageId } = await req.json();

    if (!messageId || !accidentClaimId) {
      return NextResponse.json(
        { error: "Accident Claim ID and Message ID are required" },
        { status: 400 }
      );
    }

    const flaskBaseUrl = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.accessToken as string;

    const response = await fetch(
      `${flaskBaseUrl}/messages/conversations/${accidentClaimId}/messages/${messageId}/mark_read`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ accidentClaimId, messageId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to mark message as read" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Message marked as read successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in mark-read API route:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
