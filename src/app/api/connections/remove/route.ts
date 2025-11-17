import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/server/JwtDecode";
import dbConnect from "@/lib/dbConnect";
import Connection from "@/models/connection";
import mongoose from "mongoose";

export async function DELETE(request: NextRequest) {
  await dbConnect();

  try {
    const currentUserId = getDataFromToken(request);

    const body = await request.json();
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json(
        { message: "Connection ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return NextResponse.json(
        { message: "Invalid connection ID format" },
        { status: 400 }
      );
    }

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return NextResponse.json(
        { message: "Connection not found" },
        { status: 404 }
      );
    }

    if (
      connection.requester.toString() !== currentUserId &&
      connection.recipient.toString() !== currentUserId
    ) {
      return NextResponse.json(
        { message: "You are not authorized to remove this connection" },
        { status: 403 }
      );
    }

    await Connection.findByIdAndDelete(connectionId);

    return NextResponse.json(
      { message: "Connection successfully removed" },
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