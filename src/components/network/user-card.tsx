"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProfileData } from "./types";

export function UserCard({
  user,
  onOpenProfile,
  onMessage,
}: {
  user: ProfileData
  onOpenProfile: () => void
  onMessage: () => void
}) {
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={`${user.name} avatar`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {user.headline || "No headline"} • {user.location || "No location"}
            </p>
          </div>
        </div>
        {user.isVerified && <Badge variant="default">Verified</Badge>}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {user.skills?.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{user.about || "No bio provided."}</p>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onOpenProfile}>View Profile</Button>
          <Button onClick={onMessage}>Message</Button>
        </div>
      </CardContent>
    </Card>
  )
}