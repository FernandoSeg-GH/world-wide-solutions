import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const endpoint =
    session.user.role.id === 1
      ? `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/user_stats`
      : `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/business_stats`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch stats." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      usersCount: data.users_count || 0,
      claimsCount: data.claims_count || 0,
      messagesCount: data.messages_count || 0,
      newMessagesCount: data.new_messages_count || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
