import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";

export const getUserIdFromToken = (request: Request): string | null => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(userId).select("-password_hash").lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/users/profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { about, headline, location, website,skills,isPublic } = body;

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          about,
          headline,
          location,
          "socials.website": website,
          skills,
          isPublic
        },
      },
      { new: true, runValidators: true }
    ).select("-password_hash");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("PUT /api/users/profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}