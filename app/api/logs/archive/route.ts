import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role.id === 1) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { logId } = await req.json();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/messages/logs/${logId}/archive`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to archive log");
    }

    return NextResponse.json({ message: "Log archived successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to archive log" },
      { status: 500 }
    );
  }
}
