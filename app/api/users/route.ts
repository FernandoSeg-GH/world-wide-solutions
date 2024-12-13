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

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/users `,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error response from backend:", errorData);
      return NextResponse.json(
        { message: `Error fetching users: ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const users = data.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      businessId: user.business_id,
      businessName: user.business_name,
      lastLoginAt: user.last_login_at,
      isActive: user.is_active,
    }));
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
