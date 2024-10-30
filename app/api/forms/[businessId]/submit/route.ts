import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formUrl = searchParams.get("formUrl");

  if (!formUrl) {
    return NextResponse.json(
      { error: "Form URL is required" },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SPACE_URL}/form-submissions/submit?formUrl=${formUrl}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
        ...({ duplex: "half" } as any),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to submit form: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
