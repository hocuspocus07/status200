// /app/api/employer/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Job from "@/models/jobs";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isEmployee) return NextResponse.json({ error: "Forbidden: employers only" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 200);
    const skip = (page - 1) * limit;

    const filter = { employerId: user.id };

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    return NextResponse.json({ total, page, limit, jobs });
  } catch (error) {
    console.error("GET /api/employer/jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch employer jobs" }, { status: 500 });
  }
}
