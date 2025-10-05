import mongoose, { Schema, Document } from "mongoose"

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId   //user reference
  receiver: mongoose.Types.ObjectId //user reference
  conversationId: string //combined key of sender and receiver
  content: string
  messageType: "text" | "image" | "file" | "system"
  read: boolean
  created_at: Date
  updated_at: Date
  metadata?: {
    fileUrl?: string
    fileName?: string
    fileSize?: number
  }
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    read: { type: Boolean, default: false },
    metadata: {
      fileUrl: String,
      fileName: String,
      fileSize: Number,
    },
    conversationId: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
)
MessageSchema.pre<IMessage>("validate", function (next) {
  if (!this.conversationId && this.sender && this.receiver) {
    const ids = [this.sender.toString(), this.receiver.toString()].sort()
    this.conversationId = `${ids[0]}_${ids[1]}`
  }
  next()
})

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)
