import { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  issued_to: string;
  issued_by: string;
  course: string;
  nsqf_level?: string;
  passed_at: Date;
  duration_hours?: number;
  bucket_image_url?: string;
  is_verified: boolean;
  verification_link: string;
  digital_signature: string;
  original_verification_link?: string;
  original_digital_signature?: string;
  blockchain_certificate_hash?: string;
  transaction_hash?: string;
}

export const CertificateSchema = new Schema<ICertificate>({
  issued_to: { type: String, required: true },
  issued_by: { type: String, required: true },
  course: { type: String, required: true },
  nsqf_level: { type: String },
  passed_at: { type: Date, required: true },
  duration_hours: { type: Number },
  bucket_image_url: { type: String },
  is_verified: { type: Boolean, default: false },
  verification_link: { type: String, required: true },
  digital_signature: { type: String, required: true },
  original_verification_link: { type: String },
  original_digital_signature: { type: String },
  blockchain_certificate_hash: { type: String },
  transaction_hash: { type: String },
});
