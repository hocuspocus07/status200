"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, CheckCheck } from "lucide-react"
import { ProfileSheet } from "./profile-sheet"
import { ProfileData } from "./types" // Shared types

type ChatMessage = { id: string; role: "me" | "them"; text: string; ts: number; read?: boolean }

export function MessageDialog({
    user,
    onOpenChange,
}: {
    user: ProfileData | null
    onOpenChange: (open: boolean) => void
}) {
    const open = Boolean(user)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)
    const [signedInUser, setSignedInUser] = useState<{ id: string; name: string; email: string } | null>(null)
    const [chatUser, setChatUser] = useState<ProfileData | null>(null)
    const [profileUser, setProfileUser] = useState<ProfileData | null>(null) // for profile popup


    const senderId = signedInUser?.id

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token")
            if (!token) return // Handle redirect elsewhere if needed

            try {
                const response = await fetch("/api/users/me", {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                if (!response.ok) return 
                const data = await response.json()
                setSignedInUser(data.user)
            } catch {
                localStorage.removeItem("token")
            }
        }
        fetchUser()
    }, [])

    useEffect(() => {
        if (user && senderId) {
            fetch("/api/users/messages/get-messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user1: senderId, user2: user._id }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.messages) {
                        const formatted = data.messages.map((m: any) => ({
                            id: m._id,
                            role: m.sender._id === senderId ? "me" : "them",
                            text: m.content,
                            ts: new Date(m.created_at).getTime(),
                            read: m.read,
                        }))
                        setMessages(formatted)
                    }
                })
        } else {
            setMessages([])
        }
    }, [user, senderId])

    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, open])

    async function send() {
        const text = input.trim()
        if (!text || !user || !senderId) return
        const newMsg: ChatMessage = { id: crypto.randomUUID(), role: "me", text, ts: Date.now(), read: false }
        setMessages(prev => [...prev, newMsg])
        setInput("")

        await fetch("/api/users/messages/post-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderId, receiverId: user._id, content: text }),
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTitle className="hidden">Profile</DialogTitle>
                <DialogContent className="max-w-xl p-0 rounded-xl">
                    {user && (
                        <>
                            {/* Header */}
                            <div
                                className="flex items-center gap-3 p-4 bg-muted/10 border-b cursor-pointer hover:bg-muted/20 transition-colors"
                            >
                                <Avatar className="h-10 w-10" onClick={() => setProfileUser(user)}>
                                    <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <div onClick={() => setProfileUser(user)} className="flex flex-col">
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.headline || user.title}</p>
                                </div>
                            </div>


                            <Separator />

                            {/* Messages */}
                            <ScrollArea className="h-72 md:h-96 p-2">
                                <div className="flex flex-col gap-2">
                                    {messages.map(m => (
                                        <div key={m.id} className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[70%] p-2 rounded-lg ${m.role === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} flex items-end gap-1`}>
                                                <span className="text-sm">{m.text}</span>
                                                {/* Ticks */}
                                                {m.role === "me" && (
                                                    <span>{m.read ? <CheckCheck className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3 text-primary-foreground/70" />}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={bottomRef} />
                                </div>
                            </ScrollArea>

                            {/* Input */}
                            <div className="flex gap-2 p-4 border-t">
                                <Input placeholder="Type a message…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
                                <Button onClick={send}>Send</Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Profile Popup (nested inside message dialog logic) */}
            <ProfileSheet
                user={profileUser}
                onOpenChange={(open) => {
                    if (!open) setProfileUser(null) // close profile
                }}
                onMessage={() => {
                    // Already inside message dialog, just close profile
                    setProfileUser(null);
                }}
            />

        </>
    )
}