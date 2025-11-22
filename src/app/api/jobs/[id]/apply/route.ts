// /app/api/jobs/[id]/apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Job from "@/models/jobs";
import Application from "@/models/application";
import { getUserFromToken } from "@/lib/getUserFromToken";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid job id" }, { status: 400 });

    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const body = await req.json();
    const { resumeUrl, coverLetter, answers } = body;

    // Prevent duplicate application by user for same job
    const existing = await Application.findOne({ jobId: job._id, userId: user.id });
    if (existing) return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 });

    const application = await Application.create({
      jobId: job._id,
      userId: user.id,
      employerId: job.employerId,
      resumeUrl,
      coverLetter,
      answers: answers || {},
      status: "pending",
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs/[id]/apply error:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
