import { NextResponse } from "next/server";
import User from "@/models/user";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ users: [] });
  }

  const regex = new RegExp(q, "i");

  // Search users whose certificates contain matching keywords or tags
  const users = await User.find({
    certificates: {
      $elemMatch: {
        $or: [
          { keywords: { $in: [regex] } },
          { tags: { $in: [regex] } },
        ],
      },
    },
  })
    .select("name profile certificates")
    .lean();

  return NextResponse.json({ users });
}
