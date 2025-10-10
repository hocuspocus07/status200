import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  issued_to: string;
  issued_by: string;
  course: string;
  passed_at: Date;
  is_verified: boolean; // This will be set by the model at localhost:5000
  verification_link: string;
  bucket_image_url?: string;
  nsqf_level?: number; // Updated type from ML model
  blockchain_certificate_hash?: string;
  transaction_hash?: string;
  reasons_for_failure?: string[];
  // --- New fields for ML model data ---
  confidence?: number;
  tags?: string[];
  keywords?: string[];
}

export const CertificateSchema = new Schema<ICertificate>({
  issued_to: { type: String, required: true },
  issued_by: { type: String, required: true },
  course: { type: String, required: true },
  passed_at: { type: Date, required: true },
  bucket_image_url: { type: String },
  is_verified: { type: Boolean, default: false },
  verification_link: { type: String, required: true },
  reasons_for_failure: { type: [String], default: [] },
  blockchain_certificate_hash: { type: String },
  transaction_hash: { type: String },
  nsqf_level: { type: Number },
  // --- New fields for ML model data ---
  confidence: { type: Number },
  tags: { type: [String], default: [] },
  keywords: { type: [String], default: [] },
});

export default mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);