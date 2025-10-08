import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";

const getUserIdFromToken = (request: Request): string | null => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

export async function DELETE(
  request: Request,
  { params }: { params: { educationId: string } }
) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { educationId } = params;
    if (!educationId) {
      return NextResponse.json({ message: "Education ID is required" }, { status: 400 });
    }

    await dbConnect();
    const result = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { educations: { _id: educationId } },
      },
      { new: true } 
    );

    if (!result) {
      return NextResponse.json({ message: "User or education entry not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Education entry deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/profile/education Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}