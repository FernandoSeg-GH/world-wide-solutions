import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import camelcaseKeys from "camelcase-keys";

export async function GET(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { businessId } = params;
  if (!businessId) {
    return NextResponse.json(
      { message: "No business id provided." },
      { status: 400 }
    );
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/forms/${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching business forms:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch business forms." },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("data", data);

    // Transform data to camelCase
    const camelCaseData = camelcaseKeys(data, { deep: true });
    console.log("camelCaseData", camelCaseData);

    return NextResponse.json(camelCaseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching business forms:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
