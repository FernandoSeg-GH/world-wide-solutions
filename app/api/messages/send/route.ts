// pages/api/messages/send.ts
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface SendMessageRequest {
  recipient_ids: number[];
  content: string;
  read_only?: boolean;
  accident_claim_id: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: SendMessageRequest = await req.json();
    const {
      recipient_ids,
      content,
      accident_claim_id,
      read_only = false,
    } = body;

    if (!recipient_ids?.length || !content || !accident_claim_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send the message directly via Flask's /messages/send
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/messages/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          recipient_ids,
          content,
          read_only,
          accident_claim_id,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
