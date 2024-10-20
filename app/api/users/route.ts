import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const roleId = session.user.role.id;
  const businessId = session.user.businessId;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/users?role_id=${roleId}&business_id=${businessId}`,
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    const { username, email, password, roleId, businessId } = await req.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/users/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role_id: roleId,
          business_id: businessId,
        }),
      }
    );
    console.log(
      "first",
      JSON.stringify({
        username,
        email,
        password,
        role_id: roleId,
        business_id: businessId,
      })
    );
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Registration failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
