import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user"; // Import the User model
import { getDataFromToken } from "@/lib/server/JwtDecode"; // Import your token helper

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Securely get the user ID from the JWT in the request headers
    const userId = getDataFromToken(request);

    // 2. Find the user by their ID and select only the 'certificates' field for efficiency
    const user = await User.findById(userId).select("certificates -_id");

    // 3. Handle case where user might not be found (e.g., deleted account)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // 4. Return the user's certificates
    return NextResponse.json(
      {
        message: "Certificates fetched successfully",
        success: true,
        certificates: user.certificates,
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