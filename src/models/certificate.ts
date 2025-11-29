import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  issued_to: string;
  issued_by: string;
  course: string;
  passed_at: Date;
  is_verified: boolean;
  verification_link?: string;
  bucket_image_url?: string;
  nsqf_level?: number;
  blockchain_certificate_hash?: string;
  transaction_hash?: string;
  reasons_for_failure?: string[];
  confidence?: number;
  tags?: string[];
  keywords?: string[];

  // additional fields for pathways
  syllabus?: string;
  outcomes?: string;
  jobs?: string;
  certif_medium?: "upload" | "digilocker";

  createdAt: Date;
  are_claims_verified?: boolean;
  claims_similarity?: number;
}


export const CertificateSchema = new Schema<ICertificate>({
  issued_to: { type: String, required: true },
  issued_by: { type: String, required: true },
  course: { type: String, required: true },
  passed_at: { type: Date, required: true },
  bucket_image_url: { type: String },
  is_verified: { type: Boolean, default: false },
  verification_link: { type: String, required: false },
  reasons_for_failure: { type: [String], default: [] },
  blockchain_certificate_hash: { type: String },
  transaction_hash: { type: String },
  nsqf_level: { type: Number },
  confidence: { type: Number },
  tags: { type: [String], default: [] },
  keywords: { type: [String], default: [] },

  // additional fields for pathways
  syllabus: { type: String },
  outcomes: { type: String },
  jobs: { type: String },
  certif_medium: { type: String, enum: ["upload", "digilocker"] },

  createdAt: { type: Date, default: Date.now },
  are_claims_verified: { type: Boolean },
  claims_similarity: { type: Number },
});

export default mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);