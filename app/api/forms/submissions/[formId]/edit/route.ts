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
  const submissionId = formId;
  const editUrl = `${process.env.BACKEND_URL}/submission/${submissionId}/edit`;

  try {
    const token = request.headers.get("Authorization") || "";

    const body = await request.json();

    const res = await fetch(editUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

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
