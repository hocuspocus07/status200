"use client"

import { useEffect, useState } from "react"
import { DashboardMain } from "@/components/dashboard/dashboard-main"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface InboxItem {
  id: string
  conversationId: string
  otherUser: { _id: string; name: string; profile?: { avatar?: string }; email: string }
  content: string
  created_at: string
  read: boolean
  sentByMe: boolean
}

export default function Dashboard() {
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<InboxItem[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    const init = async () => {
      try {
        const meRes = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!meRes.ok) {
          localStorage.removeItem("token")
          window.location.href = "/login"
          return
        }

        const meData = await meRes.json()
        const user = meData.user
        setIsEmployee(Boolean(user.isEmployee))

        if (user.isEmployee) {
          const inboxRes = await fetch("/api/users/messages/inbox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          })
          const inboxData = await inboxRes.json()
          const all = inboxData.inbox || []
          setMessages(all.filter((item: InboxItem) => item.sentByMe))
        }
      } catch (err) {
        console.error(err)
        localStorage.removeItem("token")
        window.location.href = "/login"
      } finally {
        setLoading(false)
      }
    }

    void init()
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

  if (loading || isEmployee === null) {
    return (
      <main className="flex-1 overflow-y-auto flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!isEmployee) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardMain />
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Your Messages</h1>
        <p className="text-sm text-muted-foreground">
          Conversations started by you as an employer.
        </p>
        <Card className="divide-y divide-border rounded-2xl shadow-md">
          {messages.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              You haven&apos;t started any conversations yet.
            </div>
          )}

          {messages.map((item) => {
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
                  "flex items-center gap-4 p-4",
                  !item.read ? "bg-muted/10" : "hover:bg-muted/40 cursor-pointer transition-all"
                )}
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
      </div>
    </main>
  )
}


