import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user"; // Import the User model
import { getDataFromToken } from "@/lib/server/JwtDecode"; // Import your token helper

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    // 1. Securely get the user ID from the JWT in the request headers for authentication
    const currentUserId = getDataFromToken(request);

    // 2. Find the current user to verify authentication
    const user = await User.findById(currentUserId);

    // 3. Handle case where current user might not be found (e.g., deleted account)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // 4. Get target user ID from route parameter
    const targetUserId = await params.id;

    // 5. Fetch the certificates for the target user
    const targetUser = await User.findById(targetUserId).select("certificates -_id");

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Target user not found." },
        { status: 404 }
      );
    }

    // 6. Return the target user's certificates
    return NextResponse.json(
      {
        message: "Certificates fetched successfully",
        success: true,
        certificates: targetUser.certificates,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // This will catch any errors, including those from getDataFromToken (e.g., invalid/expired token)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 } // 401 Unauthorized is the appropriate status for auth failures
    );
  }
}