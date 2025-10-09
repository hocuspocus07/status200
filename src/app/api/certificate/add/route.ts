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


export async function POST(req: NextRequest) { // Use NextRequest to access headers
  try {
    await dbConnect();

    // 1. Get the user ID from the token
    const userId = getDataFromToken(req);

    // 2. Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found. Authorization failed." }, { status: 404 });
    }

    const formData = await req.formData();
    const certificateFile = formData.get("certificate") as File | null;

    const issued_to = formData.get("issued_to") as string;
    const issued_by = formData.get("issued_by") as string;
    const course = formData.get("course") as string;
    const nsqf_level = formData.get("nsqf_level") as string | null;
    const passed_at_string = formData.get("passed_at") as string;
    const verification_link = formData.get("verification_link") as string;

    if (!certificateFile) {
      return NextResponse.json({ error: "Certificate file is required" }, { status: 400 });
    }

    if (!issued_to || !issued_by || !course || !passed_at_string || !verification_link) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const passed_at = new Date(passed_at_string);
    if (isNaN(passed_at.getTime())) {
      return NextResponse.json({ error: "Invalid date format for 'passed_at'. Please use ISO format." }, { status: 400 });
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(certificateFile);

    // 3. Create a new certificate *object* (not a model instance)
    const newCertificateData = {
      issued_to,
      issued_by,
      course,
      nsqf_level: nsqf_level || undefined,
      passed_at,
      verification_link,
      bucket_image_url: uploadResult.secure_url,
      // You can set other default values here if needed
    };

    // 4. Push the new certificate object into the user's certificates array
    user.certificates.push(newCertificateData);


    // 5. Save the updated user document
    await user.save();

    // 6. Call the blockchain helper function directly
    const blockchainResult = await addCertificateToBlockchain({
      learnerIdHash: user.learnerIdHash, // Get from the user object
      certUrl: uploadResult.secure_url,
      courseName: course,
      issuingBody: issued_by,
      issuedOn: Math.floor(passed_at.getTime() / 1000),
    });
    console.log("Blockchain result:", blockchainResult);

    if (!blockchainResult.success) {
      console.error("Blockchain addition failed:", blockchainResult.error);
      return NextResponse.json(
        { error: "Certificate saved but failed to add to blockchain", details: blockchainResult.error },
        { status: 500 }
      );
    }
    
    // 7. Update the certificate with the blockchain hash and save again
    const addedCertificate = user.certificates[user.certificates.length - 1];
    addedCertificate.blockchain_certificate_hash = blockchainResult.certHash;
    addedCertificate.transaction_hash = blockchainResult.txHash;
    await user.save();
    
    return NextResponse.json(
      { message: "Certificate submitted and added to blockchain successfully", certificate: addedCertificate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting certificate:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred";
    // If the error is from the token helper, it's an auth issue
    if (errorMessage === "No token provided" || errorMessage.includes("jwt")) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}