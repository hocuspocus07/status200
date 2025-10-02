import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await User.findById(decoded.id).select('-password_hash');
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        socials: user.socials
      }
    });

  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Invalid token or user not found" }, { status: 401 });
  }
}