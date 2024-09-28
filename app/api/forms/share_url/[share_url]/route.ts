import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { share_url: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { share_url } = params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/form/share_url/${share_url}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Form not found" },
        { status: response.status }
      );
    }

    const formData = await response.json();
    return NextResponse.json(formData, { status: 200 });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form details" },
      { status: 500 }
    );
  }
}
