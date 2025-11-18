import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/server/JwtDecode";
import dbConnect from "@/lib/dbConnect";
import Connection from "@/models/connection";


export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Get current user ID from token
    const currentUserId = getDataFromToken(request);

    // 2. Find all accepted connections where the user is either the requester or recipient
    const connections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: "accepted",
    })
      .populate({
        path: "requester",
        select: "name profile.avatar headline",
      })
      .populate({
        path: "recipient",
        select: "name profile.avatar headline",
      });

    // 3. Process the list to return only the "other" user
    const friends = connections.map((conn) => {
      const connection = conn as any; 
      if (connection.requester._id.toString() === currentUserId) {
        return {
          connectionId: connection._id,
          user: connection.recipient,
        };
      } else {
        return {
          connectionId: connection._id,
          user: connection.requester,
        };
      }
    });

    return NextResponse.json(
      {
        message: "Connections fetched successfully",
        connections: friends,
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