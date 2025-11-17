import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/server/JwtDecode";
import dbConnect from "@/lib/dbConnect";
import Connection from "@/models/connection";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Get current user ID from token
    const currentUserId = getDataFromToken(request);

    // 2. Find all pending requests where the user is the requester
    const sentRequests = await Connection.find({
      requester: currentUserId,
      status: "pending",
    }).populate({
      path: "recipient", // Populate with recipient's info
      select: "name profile.avatar headline", 
    });

    return NextResponse.json(
      {
        message: "Sent requests fetched successfully",
        requests: sentRequests,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes("authentication")) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}