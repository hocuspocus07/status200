import { Schema, Document } from "mongoose";

export interface IEducation extends Document {
  institute_name: string;
  degree: string;
  started_at: Date;
  completed_at: Date;
  currently_studying: boolean;
  grade?: string;
  description?: string;
  field_of_study: string;
}

export const EducationSchema = new Schema<IEducation>({
  institute_name: { type: String, required: true },
  degree: { type: String, required: true },
  field_of_study: { type: String, required: true },
  started_at: { type: Date, required: true },
  completed_at: { type: Date },
  currently_studying: { type: Boolean, default: false },
  grade: { type: String },
  description: { type: String },
});
