import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/server/JwtDecode";
import dbConnect from "@/lib/dbConnect";
import Connection from "@/models/connection";
import mongoose from "mongoose";

export async function PATCH(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Get current user ID from token
    const currentUserId = getDataFromToken(request);

    // 2. Get request ID and response from body
    const body = await request.json();
    const { requestId, response } = body;

    if (!requestId || !response) {
      return NextResponse.json(
        { message: "Request ID and response are required" },
        { status: 400 }
      );
    }

    if (response !== "accepted" && response !== "rejected") {
      return NextResponse.json(
        { message: "Invalid response. Must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { message: "Invalid request ID format" },
        { status: 400 }
      );
    }

    // 3. Find the connection request
    const connectionRequest = await Connection.findById(requestId);

    if (!connectionRequest) {
      return NextResponse.json(
        { message: "Connection request not found" },
        { status: 404 }
      );
    }

    // 4. Validate that the current user is the recipient
    if (connectionRequest.recipient.toString() !== currentUserId) {
      return NextResponse.json(
        { message: "You are not authorized to respond to this request" },
        { status: 403 }
      );
    }

    // 5. Check if already responded
    if (connectionRequest.status !== "pending") {
      return NextResponse.json(
        { message: "This request has already been responded to" },
        { status: 409 }
      );
    }

    // 6. Update the status
    if (response === "accepted") {
      connectionRequest.status = "accepted";
      await connectionRequest.save();
      return NextResponse.json(
        {
          message: "Connection request accepted",
          connection: connectionRequest,
        },
        { status: 200 }
      );
    } else {
      await Connection.findByIdAndDelete(requestId);
      return NextResponse.json(
        { message: "Connection request rejected and removed" },
        { status: 200 }
      );
    }
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