"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProfileData } from "./types";
import type { Certificate } from "./types";
import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react" 

export function ProfileSheet({
  user,
  onOpenChange,
  onMessage,
}: {
  user: ProfileData | null
  onOpenChange: (open: boolean) => void
  onMessage: () => void
}) {
  const open = Boolean(user)
  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? ""

  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return;

      const response = await fetch(`/api/certificate/get-by-id/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setCertificates(data.certificates);
      }
    };

    if (user) {
      fetchCertificates();
    }
    return () => {
        setCertificates([]);
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {user && (
          <>
            <DialogHeader><DialogTitle>Profile</DialogTitle></DialogHeader>
            <div className="mt-4 flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={`${user.name} avatar`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.headline || "No headline"} • {user.location || "No location"}
                </div>
              </div>
              {user.isVerified && <Badge className="ml-auto">Verified</Badge>}
            </div>
            <Separator className="my-4" />
            <div>
              <h3 className="text-sm font-medium mb-2">About</h3>
              <p className="text-sm text-muted-foreground">{user.about || "No bio available."}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((s) => (<Badge key={s} variant="secondary">{s}</Badge>))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed.</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Certificates</h3>
              <div className="space-y-3">
                {certificates && certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <div key={cert._id} className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{cert.course}</p>
                        <p className="text-xs text-muted-foreground">{cert.issued_by}</p>
                      </div>
                      {cert.verification_link && (
                        <a
                          href={cert.verification_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`View certificate for ${cert.course}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No certificates to display.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={onMessage}>Message</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}