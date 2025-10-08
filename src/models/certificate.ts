import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  issued_to: string;
  issued_by: string;
  course: string;
  nsqf_level?: string;
  passed_at: Date;
  bucket_image_url?: string;
  is_verified: boolean;
  verification_link: string;
  blockchain_certificate_hash?: string;
  transaction_hash?: string;
  reasons_for_failure?: string[];
}

export const CertificateSchema = new Schema<ICertificate>({
  issued_to: { type: String, required: true },
  issued_by: { type: String, required: true },
  course: { type: String, required: true },
  nsqf_level: { type: String },
  passed_at: { type: Date, required: true },
  bucket_image_url: { type: String },
  is_verified: { type: Boolean, default: false },
  verification_link: { type: String, required: true },
  reasons_for_failure: { type: [String], default: [] },
  blockchain_certificate_hash: { type: String },
  transaction_hash: { type: String },
});

export default mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);
