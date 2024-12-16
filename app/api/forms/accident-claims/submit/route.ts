import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const roleId = session.user.role.id;
  const businessId = session.user.businessId;

  const formData = await req.formData();
  const submitData: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (key.includes("file")) {
      submitData[key] = value;
    } else {
      submitData[key] = value.toString();
    }
  });

  const endpoint = `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/accident-claim/submit`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: new URLSearchParams(submitData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.error || "Failed to submit accident claim." },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error submitting accident claim:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
