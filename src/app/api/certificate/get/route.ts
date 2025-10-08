import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Certificate from "@/models/certificate"; // Ensure this path is correct

export async function GET(req: Request) {
  try {
    await dbConnect();

    const certificates = await Certificate.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Certificates fetched successfully",
        success: true,
        certificates,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching certificates:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        message: "Failed to fetch certificates",
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

