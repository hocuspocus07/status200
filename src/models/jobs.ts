import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  employerId: mongoose.Types.ObjectId; // the employer posting it
  title: string;
  company: string;
  location: string;
  jobType: string; // full-time, part-time, internship etc.
  description: string;
  requirements: string[];
  salaryRange?: {
    min?: number;
    max?: number;
  };
  remote: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    salaryRange: {
      min: Number,
      max: Number,
    },
    remote: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
