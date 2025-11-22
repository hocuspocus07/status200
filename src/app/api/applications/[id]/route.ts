// /app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Application from "@/models/application";
import { getUserFromToken } from "@/lib/getUserFromToken";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid application id" }, { status: 400 });

    const application = await Application.findById(id).populate("jobId").populate("userId", "name email profile").lean();
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    // allow if user is the applicant or employer
    if (application.userId._id.toString() !== user.id && application.employerId.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}
