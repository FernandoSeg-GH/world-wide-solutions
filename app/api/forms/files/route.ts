import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const businessId = formData.get("businessId") as string;
    const userId = formData.get("userId") as string;

    if (!file || !businessId || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    const formDataForBackend = new FormData();
    formDataForBackend.append("file", blob, file.name);
    formDataForBackend.append("businessId", businessId);
    formDataForBackend.append("userId", userId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SPACE_URL}/upload`,
      {
        method: "POST",
        body: formDataForBackend,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error uploading to backend:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { message: "Error uploading file" },
      { status: 500 }
    );
  }
}
