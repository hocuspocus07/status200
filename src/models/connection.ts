import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "./user";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface IConnection extends Document {
  requester: Types.ObjectId | IUser; // The user who sent the request
  recipient: Types.ObjectId | IUser; // The user who received the request
  status: ConnectionStatus;
  created_at: Date;
  updated_at: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Add a compound index to prevent duplicate requests
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.models.Connection ||
  mongoose.model<IConnection>("Connection", ConnectionSchema);