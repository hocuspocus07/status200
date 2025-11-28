import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user"; // Import the User model
import { getDataFromToken } from "@/lib/server/JwtDecode"; // Import our token helper
import { v2 as cloudinary } from "cloudinary";
import { addCertificateToBlockchain } from "@/lib/server/blockchain";

// (Keep your cloudinary.config and uploadToCloudinary function exactly as they are)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FORGERY_MODEL_URL = process.env.NEXT_PUBLIC_FORGERY_MODEL || "http://localhost:5000";
// const NSQF_MODEL_URL = process.env.NEXT_PUBLIC_NSQF_MODEL || "http://localhost:8000";

const uploadToCloudinary = (file: File): Promise<{ secure_url: string, public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "certificates",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error("Failed to upload file."));
        }
        if (result) {
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        } else {
          reject(new Error("Cloudinary upload failed without an error object."));
        }
      }
    );

    file.arrayBuffer().then((buffer) => {
      stream.end(Buffer.from(buffer));
    }).catch(reject);
  });
};


export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Get user and form data
    const userId = getDataFromToken(req);
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("[debug]: req: ", req);
    const formData = await req.formData();
    const certificateFile = formData.get("certificate") as File | null;
    const course = formData.get("course") as string;
    const issued_to = formData.get("issued_to") as string;
    const issued_by = formData.get("issued_by") as string;
    const passed_at_string = formData.get("passed_at") as string;
    const verification_link = formData.get("verification_link") as string;
    const syllabus = formData.get("syllabus") as string;
    const outcomes = formData.get("outcomes") as string;
    const jobs = formData.get("jobs") as string;

    // Retrieve NSQF analysis results from form data
    const analysisResult = {
      nsqf_level: formData.get("nsqf_level") as string || "0.0",
      confidence: parseFloat(formData.get("confidence") as string) || 0,
      tags: JSON.parse(formData.get("tags") as string) as string[] || [],
      keywords: JSON.parse(formData.get("keywords") as string) as string[] || [],
    };

    // const duration = formData.get("duration") as string | null;
    // const credits = formData.get("credits") as string | null;
    // const projects = formData.get("projects") as string | null;

    // how the form was uploaded
    const certif_medium = formData.get("certif_medium") as "upload" | "digilocker" | null; // will update this to handle institution (later)
    console.log("[debug]: Certificate upload medium:", certif_medium);

    if (!certificateFile || !course || !issued_to || !issued_by || !passed_at_string || !syllabus || !outcomes || !jobs || !certif_medium) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const passed_at = new Date(passed_at_string);

    // ✅ CORRECTED: Create a specific FormData for the image model
    const imageFormData = new FormData();
    imageFormData.append("file", certificateFile);

    // 2. Call Cloudinary and both ML models concurrently
    const [
      uploadResult,
      verificationResult
    ] = await Promise.all([
      uploadToCloudinary(certificateFile),

      // ML Model 1 (port 5000): Image verification
      // If from digilocker, skip image model and assume not suspicious
      certif_medium === "upload"
        ? fetch(`${FORGERY_MODEL_URL}/analyze-forgery`, {
          method: "POST",
          body: imageFormData, // Send only the relevant data
        }).then(res => res.json())
        : Promise.resolve({ analysis: { decision: { is_suspicious: false } } }),
    ]);
    console.log("[debug]: Verification Result:", verificationResult);
    console.log("[debug]: model analysis result:", analysisResult);

    // 3. Consolidate all data for MongoDB
    const newCertificateData = {
      course,
      issued_to,
      issued_by,
      passed_at,
      verification_link,
      bucket_image_url: uploadResult.secure_url,
      is_verified: !verificationResult.analysis.decision.is_suspicious,
      nsqf_level: analysisResult.nsqf_level,
      confidence: analysisResult.confidence,
      tags: analysisResult.tags,
      keywords: analysisResult.keywords,
      reasons_for_failure: verificationResult.analysis.decision.reasons || [],

      // additional fields for pathways
      syllabus,
      outcomes,
      jobs,
      certif_medium,
    };
    console.log("[debug]: New Certificate Data:", newCertificateData);

    // 4. Save the initial certificate data to the user
    user.certificates.push(newCertificateData);
    await user.save();

    let message = "Certificate submitted and processing complete.";
    const addedCertificate = user.certificates[user.certificates.length - 1];

    // 5. Conditionally add to blockchain ONLY if verified
    if (newCertificateData.is_verified) {
      console.log("Certificate is verified, proceeding to add to blockchain.");
      const blockchainResult = await addCertificateToBlockchain({
        learnerIdHash: user.learnerIdHash,
        certUrl: uploadResult.secure_url,
        courseName: course,
        issuingBody: issued_by,
        issuedOn: Math.floor(passed_at.getTime() / 1000),
      });

      if (blockchainResult.success) {
        addedCertificate.blockchain_certificate_hash = blockchainResult.certHash;
        addedCertificate.transaction_hash = blockchainResult.txHash;
        await user.save();
        message = "Certificate successfully verified and added to blockchain.";
        console.log("Successfully added to blockchain with txHash:", blockchainResult.txHash);
      } else {
        console.error("Blockchain addition failed:", blockchainResult.error);
        addedCertificate.reasons_for_failure?.push("Blockchain registration failed.");
        await user.save();
        message = "Certificate verified, but failed to register on blockchain.";
      }
    } else {
      console.log("Certificate is not verified, skipping blockchain step.");
      message = "Certificate processed, but did not pass automatic verification.";
    }

    // 6. Return a final success response
    return NextResponse.json({ message, certificate: addedCertificate }, { status: 201 });

  } catch (error) {
    console.error("Error submitting certificate:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}