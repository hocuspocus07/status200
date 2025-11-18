import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/server/JwtDecode";
import dbConnect from "@/lib/dbConnect";
import Connection from "@/models/connection";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const currentUserId = getDataFromToken(request);

    const pendingRequests = await Connection.find({
      recipient: currentUserId,
      status: "pending",
    }).populate({
      path: "requester",
      select: "name profile.avatar headline",
    });

    return NextResponse.json(
      {
        message: "Pending requests fetched successfully",
        requests: pendingRequests,
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