"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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

export function ProfileSheet({
  user,
  onOpenChange,
  onMessage,
}: {
  user: NetworkUser | null
  onOpenChange: (open: boolean) => void
  onMessage: () => void
}) {
  const open = Boolean(user)
  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {user && (
          <>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.name} avatar`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.title} • {user.location}
                </div>
              </div>
              {user.verified && <Badge className="ml-auto">Verified</Badge>}
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="text-sm font-medium mb-2">About</h3>
              <p className="text-sm text-muted-foreground">{user.bio || "No bio available."}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.length > 0 ? (
                  user.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={onMessage}>Message</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
