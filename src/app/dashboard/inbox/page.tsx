"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check, CheckCheck } from "lucide-react"
import { MessageDialog } from "@/components/network/message"

interface InboxItem {
  id: string
  conversationId: string
  otherUser: { _id: string; name: string; profile?: { avatar?: string }; email: string }
  content: string
  created_at: string
  read: boolean
  sentByMe: boolean
}

export default function InboxPage() {
  const [inbox, setInbox] = useState<InboxItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<InboxItem["otherUser"] | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return (window.location.href = "/login")
        const data = await res.json()
        setUserId(data.user.id)

        const inboxRes = await fetch("/api/users/messages/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id }),
        })
        const inboxData = await inboxRes.json()
        setInbox(inboxData.inbox || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
  }, [])

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderTick = (item: InboxItem) => {
    if (!item.sentByMe) return null
    return (
      <span className="ml-1 text-xs">
        {item.read ? (
          <CheckCheck className="w-4 h-4 inline text-blue-500" />
        ) : (
          <Check className="w-4 h-4 inline text-muted-foreground" />
        )}
      </span>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-4">Inbox</h1>

      <Card className="divide-y divide-border rounded-2xl shadow-md">
        {inbox.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No messages yet</div>
        )}

        {inbox.map((item) => {
          const other = item.otherUser
          const initials = other.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")

          return (
            <div
              key={item.conversationId}
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-muted/40 cursor-pointer transition-all",
                !item.read && !item.sentByMe ? "bg-muted/10" : ""
              )}
              onClick={() => setSelectedUser(other)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={other.profile?.avatar || ""} alt={other.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{other.name}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(item.created_at)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">{item.content}</p>
                  {renderTick(item)}
                </div>
              </div>
            </div>
          )
        })}
      </Card>

      {/* Message Dialog */}
      <MessageDialog
        user={
          selectedUser
            ? {
                _id: selectedUser._id,
                name: selectedUser.name,
                title: "",
                location: "",
                skills: [],
                is_verified: false,
                bio: "",
                lastActive: "",
                avatar: selectedUser.profile?.avatar || "",
              }
            : null
        }
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />
    </div>
  )
}
