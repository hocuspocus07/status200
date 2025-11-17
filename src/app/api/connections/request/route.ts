import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/server/JwtDecode";
import dbConnect from "@/lib/dbConnect";
import Connection from "@/models/connection";
import user from "@/models/user";
import mongoose from "mongoose";


export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Get current user ID from token
    const requesterId = getDataFromToken(request);

    // 2. Get recipient ID from request body
    const body = await request.json();
    const { recipientId } = body;

    if (!recipientId) {
      return NextResponse.json(
        { message: "Recipient ID is required" },
        { status: 400 }
      );
    }

    // 3. Validate IDs
    if (requesterId === recipientId) {
      return NextResponse.json(
        { message: "You cannot send a connection request to yourself" },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(recipientId) ||
      !mongoose.Types.ObjectId.isValid(requesterId)
    ) {
      return NextResponse.json(
        { message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // 4. Check if recipient exists
    const recipientExists = await user.findById(recipientId);
    if (!recipientExists) {
      return NextResponse.json(
        { message: "Recipient user not found" },
        { status: 404 }
      );
    }

    // 5. Check if a connection or request already exists (in either direction)
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        return NextResponse.json(
          { message: "A connection request is already pending" },
          { status: 409 }
        );
      }
      if (existingConnection.status === "accepted") {
        return NextResponse.json(
          { message: "You are already connected" },
          { status: 409 }
        );
      }
      if (existingConnection.status === "rejected") {
        await Connection.findByIdAndDelete(existingConnection._id);
      }
    }

    // 6. Create new connection request
    const newConnection = new Connection({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    await newConnection.save();

    return NextResponse.json(
      {
        message: "Connection request sent successfully",
        connection: newConnection,
      },
      { status: 201 }
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