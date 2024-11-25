import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const roleId = session.user.role.id;
  const businessId = session.user.businessId;

  // Determine the appropriate endpoint based on the user's role
  let endpoint = "";
  if (roleId === 1) {
    endpoint = `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/user_accident_claims`;
  } else if ([2, 3, 4].includes(roleId)) {
    endpoint = `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/business_accident_claims`;
  } else {
    return NextResponse.json(
      { message: "Role not authorized for this action." },
      { status: 403 }
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.error || "Failed to fetch accident claims." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching accident claims:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
