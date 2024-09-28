import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { share_url: string } }
) {
  const { share_url } = params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/content/${share_url}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Submissions not found" },
        { status: response.status }
      );
    }

    const submissionsData = await response.json();
    return NextResponse.json(submissionsData, { status: 200 });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
