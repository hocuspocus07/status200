import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user"; 

const getUserIdFromToken = (request: Request): string | null => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch (error) {
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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newEducation = {
      institute_name: institution,
      degree,
      field_of_study: field,
      started_at: new Date(start),
      completed_at: !current && end ? new Date(end) : null,
      currently_studying: current,
      description,
    };

    user.educations.unshift(newEducation as any); 
    await user.save();

    const addedEducation = user.educations[0];

    return NextResponse.json({ message: "Education added successfully", education: addedEducation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users/profile/education Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}