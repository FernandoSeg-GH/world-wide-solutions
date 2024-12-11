import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
