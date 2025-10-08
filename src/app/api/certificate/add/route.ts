import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Certificate from "@/models/certificate";
import { v2 as cloudinary } from "cloudinary";

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

export async function POST(req: Request) {
  try {
    await dbConnect();

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

    // Create a new certificate document with the Cloudinary URL
    const newCertificate = new Certificate({
      issued_to,
      issued_by,
      course,
      nsqf_level: nsqf_level || undefined,
      passed_at,
      verification_link,
      bucket_image_url: uploadResult.secure_url,
    });

    await newCertificate.save();

    return NextResponse.json(
      { message: "Certificate submitted successfully", certificate: newCertificate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting certificate:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
