// /app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Job from "@/models/jobs";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || ""; // text search (title/company/description)
    const location = url.searchParams.get("location") || "";
    const jobType = url.searchParams.get("jobType") || "";
    const remote = url.searchParams.get("remote"); // "true"/"false" or null
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 100);

    const filter: any = {};

    if (q) {
      // basic case-insensitive partial search across title/company/description
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

export async function POST(req: NextRequest) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  console.log(user);
  console.log(user.isEmployee);
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
      extras, // optional freeform object for custom fields (if your schema allows)
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
