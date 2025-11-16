import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId)
      .select(
        "name email headline location about skills socials educations certificates isVerified profile.avatar uuid created_at"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile API Error:", error);

    if (error.kind === "ObjectId") {
      return NextResponse.json(
        { success: false, message: "Invalid User ID format." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
