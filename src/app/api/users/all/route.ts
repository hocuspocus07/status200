import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const users = await User.find({}, { password_hash: 0 }).lean();

    const networkUsers = users.map((u) => ({
      id: (u._id as any).toString(),
      name: u.name,
      title: u.profile?.username || "No title",
      location: u.profile?.location || "Unknown",
      skills: u.educations?.map((e:any) => e.field) || [], 
      verified: !!u.socials?.linkedin || false,
      bio: u.profile?.bio || "",
      lastActive: u.updated_at?.toISOString() || new Date().toISOString(),
      avatar: u.profile?.avatar || "/placeholder.svg",
    }));

    return NextResponse.json(networkUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching users" },
      { status: 500 }
    );
  }
}
