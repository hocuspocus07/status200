import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Message from "@/models/message"
import User from "@/models/user"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { senderId, receiverId, content, messageType = "text" } = await req.json()

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate users
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ])
    if (!sender || !receiver) {
      return NextResponse.json({ error: "Invalid sender or receiver" }, { status: 404 })
    }

    const ids = [senderId.toString(), receiverId.toString()].sort()
    const conversationId = `${ids[0]}_${ids[1]}`

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      conversationId,
    })

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
