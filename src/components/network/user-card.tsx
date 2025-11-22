"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProfileData } from "./types";
import { Lock } from "lucide-react"

export function UserCard({
  user,
  onMessage,
}: {
  user: ProfileData
  onMessage: () => void
}) {
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
  const isProfilePublic = user.isPublic ?? true;
  
  // Use 'group' for hover effects and better overall spacing
  return (
    <Card className="bg-card w-full max-w-sm hover:shadow-lg transition-shadow duration-300 group">
      
      {/* Header Section */}
      <CardHeader className="flex flex-row items-start justify-between p-4 border-b border-border/70">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/50 group-hover:border-primary transition-colors">
            {/* Added a modern outline and slightly larger size */}
            <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={`${user.name} avatar`} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col pt-1">
            {/* Title font size increased, added truncation */}
            <CardTitle className="text-xl font-bold text-foreground truncate max-w-[150px]">{user.name}</CardTitle>
            
            {/* Conditional display for public profile details */}
            {isProfilePublic ? (
              <p className="text-sm text-muted-foreground mt-0.5">
                {user.headline || "No headline"}
              </p>
            ) : (
                // Only show verified badge if public, otherwise it's just clutter
                <Badge variant="destructive" className="mt-1 px-2 py-0.5 text-xs w-fit">
                    <Lock className="h-3 w-3 mr-1" /> Private
                </Badge>
            )}
          </div>
        </div>
        
        {/* Verification Badge - only show if public */}
        {user.isVerified && isProfilePublic && (
            <Badge variant="default" className="text-xs font-medium px-2 py-0.5 mt-2">Verified</Badge>
        )}
      </CardHeader>
      
      {/* Content Section */}
      <CardContent className="flex flex-col gap-4 p-4">
        
        {isProfilePublic ? (
          <>
            {/* Skills Section */}
            <div className="flex flex-wrap gap-2 min-h-[20px]">
              {user.skills?.slice(0, 4).map((s) => (
                <Badge key={s} variant="outline" className="text-xs font-normal border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                    {s}
                </Badge>
              ))}
            </div>

            {/* Bio/About Section */}
            <p className="text-sm text-foreground/80 line-clamp-3 min-h-[60px] leading-relaxed">
              {user.about || "This profile has not provided a bio yet."}
            </p>
          </>
        ) : (
          // **Cleaned-up Private Profile State**
          <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg border border-border/70 text-center min-h-[140px]">
            <Lock className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-base font-semibold text-muted-foreground">Profile Details Hidden</p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Connect or request access to view skills and bio.
            </p>
          </div>
        )}
        
        {/* Footer/Action Buttons */}
        <div className="flex items-center justify-center pt-2 border-t border-border">
          <Button variant="ghost" asChild className="text-primary hover:text-primary hover:bg-primary/90 transition-colors">
            <Link href={`/dashboard/profiles/${user._id}`}>View Profile</Link>
          </Button>
          
          {isProfilePublic && (
            <Button onClick={onMessage} className="px-6">
                Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}