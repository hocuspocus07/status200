import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Message from "@/models/message"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender receiver", "name profile.avatar email")
      .sort({ created_at: -1 })

    const seen = new Set()
    const inbox = []
    for (const msg of messages) {
      if (!seen.has(msg.conversationId)) {
        seen.add(msg.conversationId)
        const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender
        inbox.push({
          id: msg._id,
          conversationId: msg.conversationId,
          otherUser,
          content: msg.content,
          created_at: msg.created_at,
          read: msg.read,
          sentByMe: msg.sender._id.toString() === userId,
        })
      }
    }

    return NextResponse.json({ inbox })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
