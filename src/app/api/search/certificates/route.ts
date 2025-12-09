import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/user"; 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    let pipeline: any[] = [];

    if (query) {
      // --- SCENARIO A: SEARCH QUERY EXISTS ---
      // (Your existing logic: Filter users and specific certificates)
      const searchRegex = new RegExp(query, "i");
      pipeline = [
        {
          $match: {
            $or: [
              { "certificates.keywords": searchRegex },
              { "certificates.tags": searchRegex },
              { "certificates.course": searchRegex },
            ],
          },
        },
        { $unwind: "$certificates" },
        {
          $match: {
            $or: [
              { "certificates.keywords": searchRegex },
              { "certificates.tags": searchRegex },
              { "certificates.course": searchRegex },
            ],
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            email: { $first: "$email" },
            headline: { $first: "$headline" },
            profile: { $first: "$profile" },
            matchedCertificates: { $push: "$certificates" }, 
          },
        },
        { $limit: 20 },
      ];
    } else {
      // --- SCENARIO B: NO QUERY (INITIAL LOAD) ---
      // Show recent users who have at least one certificate
      pipeline = [
        {
          $match: { 
            certificates: { $exists: true, $not: { $size: 0 } } 
          }
        },
        { $sort: { created_at: -1 } }, // Newest users first
        { $limit: 20 },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            headline: 1,
            profile: 1,
            // Alias 'certificates' to 'matchedCertificates' to keep frontend consistent
            // We use $slice to only show the first 3 certificates to avoid huge payloads
            matchedCertificates: { $slice: ["$certificates", 3] }
          }
        }
      ];
    }

    const results = await User.aggregate(pipeline);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}