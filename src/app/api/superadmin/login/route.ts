import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Verify Email
    if (email !== process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 2. Verify Password Hash
    const isMatch = await bcrypt.compare(
      password,
      process.env.SUPER_ADMIN_PASSWORD_HASH!
    );

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Create JWT (30 mins)
    const token = jwt.sign(
      { role: "superadmin", email },
      process.env.JWT_SECRET!,
      { expiresIn: "30m" }
    );

    // 4. Set Cookie
    const response = NextResponse.json(
      { message: "Login successful", success: true },
      { status: 200 }
    );

    response.cookies.set("superadmin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1800, // 30 minutes in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}