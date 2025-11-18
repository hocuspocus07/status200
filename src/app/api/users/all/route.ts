import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import { getUserIdFromToken } from "../profile/route";

export async function GET(request: Request) {
  try {
    const loggedInUserId = getUserIdFromToken(request);
    if (!loggedInUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("name headline location about skills profile isVerified isPublic") 
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}