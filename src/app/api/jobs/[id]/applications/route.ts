import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Job from "@/models/jobs";
import Application from "@/models/application";
import { getUserFromToken } from "@/lib/getUserFromToken";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // FIX 1: Type params as a Promise
) {
  await dbConnect();
  const user = await getUserFromToken(req);
  
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isEmployee) return NextResponse.json({ error: "Forbidden: employers only" }, { status: 403 });

  try {
    // FIX 2: Await params before destructuring
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
    }

    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (job.employerId.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: not job owner" }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 200);
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments({ jobId: job._id });
    
    const applications = await Application.find({ jobId: job._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email profile")
      .lean();

    return NextResponse.json({ total, page, limit, applications });
  } catch (error) {
    console.error("GET /api/jobs/[id]/applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}