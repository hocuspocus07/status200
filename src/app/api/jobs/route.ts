import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Job from "@/models/jobs";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: NextRequest) {
  // AL AYAAN ANSARI | Roll NO. 23BCS034
  await dbConnect();
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || ""; 
    const location = url.searchParams.get("location") || "";
    const jobType = url.searchParams.get("jobType") || "";
    const remote = url.searchParams.get("remote"); 
    let postedBy = url.searchParams.get("postedBy"); // We will modify this if it is 'me'
    
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 100);

    const filter: any = {};

    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { title: { $regex: re } },
        { company: { $regex: re } },
        { description: { $regex: re } },
      ];
    }

    if (location) filter.location = { $regex: new RegExp(location, "i") };
    if (jobType) filter.jobType = jobType;
    if (remote === "true") filter.remote = true;
    if (remote === "false") filter.remote = false;
    
    // --- FIX: HANDLE 'me' TO USE TOKEN ---
    if (postedBy === "me") {
      const user = await getUserFromToken(req);
      if (user) {
        postedBy = user.id; // Resolve 'me' to the actual User ID from token
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Validate and Apply Filter
    if (postedBy && postedBy !== "undefined") {
      if (mongoose.Types.ObjectId.isValid(postedBy)) {
        filter.employerId = postedBy; 
      } else {
        return NextResponse.json({ total: 0, page, limit, jobs: [] });
      }
    }

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ total, page, limit, jobs });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to list jobs" }, { status: 500 });
  }
}

// POST function remains unchanged...
export async function POST(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  if (!user.isEmployee) return NextResponse.json({ error: "Forbidden: employers only" }, { status: 403 });

  try {
    const body = await req.json();
    const {
      title,
      company,
      location,
      jobType,
      description,
      requirements = [],
      salaryMin,
      salaryMax,
      remote = false,
      extras = {},
    } = body;

    if (!title || !company || !location || !jobType || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const job = await Job.create({
      employerId: user.id,
      title,
      company,
      location,
      jobType,
      description,
      requirements,
      salaryRange: { min: salaryMin, max: salaryMax },
      remote: Boolean(remote),
      extras, 
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}