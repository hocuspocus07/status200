"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type ChatMessage = { id: string; role: "me" | "them"; text: string; ts: number }
type NetworkUser = {
  id: string
  name: string
  title: string
  location: string
  skills: string[]
  verified: boolean
  bio: string
  lastActive: string
  avatar: string
}

export function MessageDialog({
  user,
  onOpenChange,
}: {
  user: NetworkUser | null
  onOpenChange: (open: boolean) => void
}) {
  const open = Boolean(user)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      setMessages([
        { id: "m1", role: "them", text: `Hi, I'm ${user.name}. Happy to connect!`, ts: Date.now() - 1000 * 60 * 3 },
        { id: "m2", role: "me", text: "Great to meet you!", ts: Date.now() - 1000 * 60 * 2 },
      ])
    } else {
      setMessages([])
    }
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "me", text, ts: Date.now() }])
    setInput("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {user && (
          <>
            <DialogHeader>
              <DialogTitle>Chat with {user.name}</DialogTitle>
            </DialogHeader>

            <Separator />

            <ScrollArea className="h-64 mt-3 rounded-md border">
              <div className="p-3 flex flex-col gap-2">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === "me" ? "self-end max-w-[80%]" : "self-start max-w-[80%]"}>
                    <div
                      className={
                        m.role === "me"
                          ? "rounded-lg bg-primary text-primary-foreground px-3 py-2"
                          : "rounded-lg bg-muted text-foreground px-3 py-2"
                      }
                    >
                      <div className="text-sm">{m.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="mt-3 flex items-center gap-2">
              <Input
                placeholder="Type your message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send()
                }}
              />
              <Button onClick={send}>Send</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
