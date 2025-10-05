import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Message from "@/models/message"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { user1, user2 } = await req.json()

    if (!user1 || !user2) {
      return NextResponse.json({ error: "user1 and user2 required" }, { status: 400 })
    }

    const ids = [user1.toString(), user2.toString()].sort()
    const conversationId = `${ids[0]}_${ids[1]}`

    const messages = await Message.find({ conversationId })
      .populate("sender receiver", "name profile.avatar")
      .sort({ created_at: 1 })

    return NextResponse.json({ messages })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
