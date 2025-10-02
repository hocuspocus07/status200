import { Schema, Document } from "mongoose";

export interface IEducation extends Document {
  institute_name: string;
  course: string;
  started_at: Date;
  completed_at: Date;
  grade?: string;
}

export const EducationSchema = new Schema<IEducation>({
  institute_name: { type: String, required: true },
  course: { type: String, required: true },
  started_at: { type: Date, required: true },
  completed_at: { type: Date, required: true },
  grade: { type: String },
});
