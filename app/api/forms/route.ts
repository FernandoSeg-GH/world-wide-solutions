import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter((seg) => seg);

  let endpoint = "";
  if (pathSegments.length === 2 && pathSegments[1] === "all_forms") {
    endpoint = "all_forms";
  } else if (pathSegments.length === 2 && !isNaN(Number(pathSegments[1]))) {
    endpoint = pathSegments[1];
  } else {
    return NextResponse.json(
      { message: "Invalid API endpoint" },
      { status: 400 }
    );
  }

  try {
    const businessId = endpoint;
    const fetchUrl = `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/forms/all_forms`;

    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch forms" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
