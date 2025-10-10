import mongoose, { Schema, Document } from "mongoose";
import { EducationSchema, IEducation } from "./education";
import { CertificateSchema, ICertificate } from "./certificate";

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  about?: string;
  location?:string,
  headline?:string,
  uuid: string;          
  learnerIdHash: string;
  skills?: string[];
  profile?: {
    avatar?: string;
    username?: string;
  };
  socials?: {
    linkedin?: string;
    github?: string;
    x?: string;
    website?:string,
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
    about: { type: String },
    location: { type: String },
    headline: { type: String },
    password_hash: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },          
    learnerIdHash: { type: String, required: true, unique: true }, 
    profile: {
      avatar: String,
      username: String,
    },
    socials: {
      linkedin: String,
      github: String,
      x: String,
      website: String,
    },
    skills: { type: [String], default: [] },
    educations: [EducationSchema],
    certificates: [CertificateSchema],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
