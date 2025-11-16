import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user"; 
import { Types } from "mongoose"; // Import Types for ObjectId

const getUserIdFromToken = (request: Request): string | null => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { institution, degree, field, start, end, current, description } = body;

    if (!institution || !degree || !field || !start) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Create the new education object with a new ObjectId
    const newEducation = {
      _id: new Types.ObjectId(), // Generate a new ID for the sub-document
      institute_name: institution,
      degree,
      field_of_study: field,
      started_at: new Date(start),
      completed_at: !current && end ? new Date(end) : null,
      currently_studying: current,
      description,
    };

    // Use findByIdAndUpdate with $push to avoid the validation error
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          educations: {
            $each: [newEducation], // $each is required to use $position
            $position: 0 // This acts like unshift, adding to the start of the array
          }
        }
      },
      { new: true } // 'new: true' returns the modified doc
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // The added education is the one we just created
    const addedEducation = newEducation;

    return NextResponse.json({ message: "Education added successfully", education: addedEducation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users/profile/education Error:", error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ message: "Validation Error", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}