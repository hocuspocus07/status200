// /app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Job from "@/models/jobs";
import { getUserFromToken } from "@/lib/getUserFromToken";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid job id" }, { status: 400 });

    const job = await Job.findById(id).lean();
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to get job" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isEmployee) return NextResponse.json({ error: "Forbidden: employers only" }, { status: 403 });

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid job id" }, { status: 400 });

    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (job.employerId.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: not job owner" }, { status: 403 });
    }

    const body = await req.json();
    const updatable = [
      "title",
      "company",
      "location",
      "jobType",
      "description",
      "requirements",
      "salaryMin",
      "salaryMax",
      "remote",
      "extras",
    ];

    updatable.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        if (key === "salaryMin" || key === "salaryMax") {
          job.salaryRange = job.salaryRange || {};
          if (key === "salaryMin") job.salaryRange.min = body[key];
          if (key === "salaryMax") job.salaryRange.max = body[key];
        } else {
          // @ts-ignore
          job[key] = body[key];
        }
      }
    });

    await job.save();
    return NextResponse.json({ job });
  } catch (error) {
    console.error("PUT /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isEmployee) return NextResponse.json({ error: "Forbidden: employers only" }, { status: 403 });

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid job id" }, { status: 400 });

    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (job.employerId.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: not job owner" }, { status: 403 });
    }

    await Job.deleteOne({ _id: id });
    // optionally: delete related applications
    return NextResponse.json({ message: "Job deleted" });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
