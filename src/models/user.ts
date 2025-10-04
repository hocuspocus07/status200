import mongoose, { Schema, Document } from "mongoose";
import { EducationSchema, IEducation } from "./education";
import { CertificateSchema, ICertificate } from "./certificate";

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  uuid: string;           // New field
  learnerIdHash: string;  // New field
  profile?: {
    avatar?: string;
    username?: string;
  };
  socials?: {
    linkedin?: string;
    github?: string;
    x?: string;
  };
  educations?: IEducation[];
  certificates?: ICertificate[];
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },          // New
    learnerIdHash: { type: String, required: true, unique: true }, // New
    profile: {
      avatar: String,
      username: String,
    },
    socials: {
      linkedin: String,
      github: String,
      x: String,
    },
    educations: [EducationSchema],
    certificates: [CertificateSchema],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
