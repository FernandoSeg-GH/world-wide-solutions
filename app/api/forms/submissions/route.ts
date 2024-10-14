import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const businessId = url.searchParams.get("businessId");
  const pageParam = url.searchParams.get("page") || "1";
  const page = parseInt(pageParam, 10);

  if (!businessId) {
    return NextResponse.json(
      { message: "Missing businessId" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/forms/submissions?businessId=${businessId}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      submissions: data.submissions,
      page: data.page,
      pages: data.pages,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
