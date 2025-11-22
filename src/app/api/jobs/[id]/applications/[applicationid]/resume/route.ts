import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Application from "@/models/application";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// ==========================================
// STEP 1: VERIFY CONFIGURATION
// ==========================================
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;


if (!cloudName || !apiKey || !apiSecret) {
  console.error(" CRITICAL: Missing Cloudinary Environment Variables!");
} else {
  console.log(" Cloudinary Config looks okay.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// ==========================================
// STEP 2: THE ROBUST URL PARSER
// ==========================================
function generateSignedUrl(originalUrl: string) {

  try {
    // Check 1: Is it even a Cloudinary URL?
    if (!originalUrl.includes("cloudinary.com")) {
      console.warn(" URL is not a Cloudinary URL. Returning as is.");
      return originalUrl;
    }

    // Check 2: Split by '/upload/' to isolate the path
    const parts = originalUrl.split("/upload/");
    if (parts.length < 2) {
      console.error(" Could not split by '/upload/'. Format unrecognized.");
      return originalUrl;
    }

    const baseUrl = parts[0]; // e.g. https://res.cloudinary.com/xyz/image
    const pathPart = parts[1]; // e.g. v12345/folder/filename.pdf


    // Check 3: Determine Resource Type (image vs raw)
    // We look at the last segment of the base URL
    const urlSegments = baseUrl.split("/");
    let resourceType = urlSegments[urlSegments.length - 1]; // "image", "raw", or "video"

    // Sanity check: If usage uses a different URL structure, fallback to defaults
    if (!["image", "raw", "video"].includes(resourceType)) {
      console.warn(`Extracted resource type "${resourceType}" is unusual. Defaulting to 'image'.`);
      resourceType = "image";
    }
    console.log(`4. Detected Resource Type: "${resourceType}"`);

    // Check 4: Clean the Public ID
    // Remove version number (e.g. v1763787940/)
    let publicId = pathPart.replace(/^v\d+\//, "");
    console.log(`5. ID after removing version: "${publicId}"`);

    // Check 5: Extension Handling (CRITICAL STEP)
    if (resourceType === "image" || resourceType === "video") {
      // For images/videos, Cloudinary ID matches the filename WITHOUT extension
      // But we request it WITH extension via format: "pdf" later
      if (publicId.endsWith(".pdf")) {
        console.log("   -> 'image' type detected with .pdf extension. Stripping extension from ID.");
        publicId = publicId.replace(/\.pdf$/i, "");
      } else {
        // General extension stripper
        publicId = publicId.replace(/\.[^/.]+$/, "");
      }
    }
    else if (resourceType === "raw") {
      // For raw files, the extension IS part of the ID. We do NOT strip it.
      console.log("   -> 'raw' type detected. Keeping extension in ID.");
    }

    console.log(`6. FINAL PUBLIC ID: "${publicId}"`);

    // Check 6: Generate the Signed URL
    console.log("7. Generating Signed URL with params:");
    const params = {
      resource_type: resourceType,
      type: "upload", // Kept as upload to find the file
      sign_url: true, // Adds signature to bypass "Blocked"
      secure: true,
      // If image -> force format pdf. If raw -> format is in the ID.
      format: resourceType === "image" ? "pdf" : undefined
    };
    console.log(JSON.stringify(params, null, 2));

    const signedUrl = cloudinary.url(publicId, params);

    console.log(`✅ GENERATED URL: ${signedUrl}`);
    return signedUrl;

  } catch (error) {
    console.error("❌ Error inside generateSignedUrl:", error);
    return originalUrl;
  }
}

// ==========================================
// STEP 3: THE ROUTE HANDLER
// ==========================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {

  await dbConnect();
  const user = await getUserFromToken(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const applicationId = resolvedParams.applicationid; // Lowercase check

    if (!applicationId || !mongoose.isValidObjectId(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    // Permission Check
    const isEmployer = application.employerId?.toString() === user.id;
    const isApplicant = application.userId?.toString() === user.id;
    if (!isEmployer && !isApplicant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Get URL
    const resumeLink = application.resumeUrl || application.resume;

    if (!resumeLink) return NextResponse.json({ error: "No resume found" }, { status: 404 });

    // GENERATE
    const signedUrl = generateSignedUrl(resumeLink);

    return NextResponse.json({ url: signedUrl });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}