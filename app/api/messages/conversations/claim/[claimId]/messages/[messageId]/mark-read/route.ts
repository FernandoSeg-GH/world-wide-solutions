import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { accidentClaimId, messageId } = await req.json();
    const session = await getServerSession(authOptions);

    if (!accidentClaimId || !messageId) {
      return NextResponse.json(
        { error: "Both accidentClaimId and messageId are required" },
        { status: 400 }
      );
    }

    const flaskBaseUrl = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL;
    const response = await fetch(
      `${flaskBaseUrl}/messages/conversations/${accidentClaimId}/messages/${messageId}/mark_read`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    // Handle non-JSON responses gracefully
    if (!response.ok) {
      let errorMessage = "Failed to mark message as read";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const rawText = await response.text();
        console.error("Non-JSON backend response:", rawText);
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in mark-read API route:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
