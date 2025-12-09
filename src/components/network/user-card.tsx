"use client"

import { Briefcase, MapPin } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProfileData } from "./types";
import { Lock, CheckCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
type ConnectionStatus = "idle" | "loading" | "none" | "pending-out" | "pending-in" | "connected" | "self";

export function UserListItem({
  user,
  onMessage,
  token,
}: {
  user: ProfileData
  onMessage: () => void
  token: string | null
}) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const profileUserId = user._id;

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
  const isProfilePublic = user.isPublic ?? true;

  const toast = {
    error: (message: string) => console.error("Toast Error:", message),
  };
  const setMyId = (id: string) => console.log("Current User ID fetched:", id);
  const setError = (message: string) => console.error("Error handler called:", message);


  useEffect(() => {
    if (!profileUserId || !token) {
      setConnectionStatus("idle");
      return;
    }

    const fetchMyIdAndConnectionStatus = async () => {
      setConnectionStatus("loading");

      let currentUserId: string;
      try {
        const meRes = await fetch(`/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const meJson = await meRes.json();

        if (meRes.ok) {
          currentUserId = meJson.user.id;
          setMyId(currentUserId);
        } else {
          throw new Error(meJson.message || "Could not authenticate user");
        }
      } catch (err: any) {
        console.error("Session Error:", err.message);
        setError(`Session invalid: ${err.message}.`);
        setConnectionStatus("idle");
        return;
      }

      if (currentUserId === profileUserId) {
        setConnectionStatus("self");
        return;
      }

      try {
        const [connRes, pendingRes, sentRes] = await Promise.all([
          fetch(`/api/connections`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/connections/pending`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/connections/sent`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!connRes.ok || !pendingRes.ok || !sentRes.ok) {
          throw new Error("Failed to fetch connection status");
        }

        const { connections } = await connRes.json();
        const { requests: pendingRequests } = await pendingRes.json();
        const { requests: sentRequests } = await sentRes.json();
        //Connected
        const accepted = connections.find((c: any) => c.user?._id === profileUserId);
        if (accepted) {
          setConnectionStatus("connected");
          setConnectionId(accepted.connectionId);
          return;
        }

        // 2. Pending In
        const pendingIn = pendingRequests.find((r: any) => r.requester?._id === profileUserId);
        if (pendingIn) {
          setConnectionStatus("pending-in");
          setConnectionId(pendingIn._id);
          return;
        }

        // 3. Pending Out: Waiting for their action
        const pendingOut = sentRequests.find((r: any) => r.recipient?._id === profileUserId);
        if (pendingOut) {
          setConnectionStatus("pending-out");
          return;
        }

        // 4. None: No connection
        setConnectionStatus("none");

      } catch (err: any) {
        console.error("Connection status error:", err.message);
        setConnectionStatus("idle");
      }
    };

    fetchMyIdAndConnectionStatus();
  }, [profileUserId, token]);

  const handleConnect = async () => {
    if (!profileUserId || !token) return;
    setIsConnecting(true);
    try {
      const res = await fetch(`/api/connections/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: profileUserId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to send request");
      }
      setConnectionStatus("pending-out");
    } catch (err: any) {
      console.error(err.message);
      toast.error("Failed to send connection request.");
    }
    setIsConnecting(false);
  };

  const renderActionButton = () => {
    if (connectionStatus === "loading") {
      return (
        <Button disabled className="w-[120px] sm:w-[140px] px-6">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }

    if (connectionStatus === "connected") {
      return (
        <Button onClick={onMessage} className="w-[120px] sm:w-[140px] px-6">
          Message
        </Button>
      );
    }

    if (connectionStatus === "pending-out") {
      return (
        <Button variant="outline" disabled className="w-[120px] sm:w-[140px] px-6">
          Pending
        </Button>
      );
    }

    if (connectionStatus === "pending-in") {
      return (
        <Button variant="default" className="w-[120px] sm:w-[140px] px-6">
          Accept
        </Button>
      );
    }

    if (connectionStatus === "none") {
      return (
        <Button onClick={handleConnect} disabled={isConnecting} className="w-[120px] sm:w-[140px] px-6">
          {isConnecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Connect"}
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className="w-full bg-card hover:shadow-md transition-shadow duration-200 group border border-border/70">
      {/* Reduced overall padding and items-center for vertical centering */}
      <CardContent className="flex items-center justify-between p-3 sm:p-4 space-x-3">
        <div className="flex items-start flex-grow min-w-0">

          {/* Compact Avatar: h-12 w-12 */}
          <Avatar className={`h-12 w-12 border-2 ${user.isPremium ? "border-yellow-400" : "border-primary/50"} flex-shrink-0 mr-3 mt-1`}>
            <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={`${user.name} avatar`} />
            <AvatarFallback className={`${user.isPremium ? "text-yellow-600 dark:text-yellow-400" : "text-primary"} bg-primary/10 text-base font-bold`}>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">

            {/* Name and Verification - Font size reduced, margin removed */}
            <div className="flex items-center gap-1">
              <Link href={`/dashboard/profiles/${user._id}`} className="text-base font-bold text-foreground hover:text-primary transition-colors truncate">
                {user.name} {user.isPremium && <span className="text-yellow-500 border-2 border-yellow-500 p-0.5 rounded-sm text-xs font-semibold">PRO</span>}
              </Link>
              {user.isVerified && isProfilePublic && (
                <CheckCircle className="h-3 w-3 text-primary" />
              )}
            </div>

            {/* Headline / Private Status - Uses Briefcase icon */}
            {isProfilePublic ? (
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{user.headline || "No professional headline"}</span>
              </p>
            ) : (
              <Badge variant="destructive" className="mt-0.5 px-2 py-0 text-xs w-fit">
                <Lock className="h-3 w-3 mr-1" /> Private Profile
              </Badge>
            )}

            {/* Location (New Addition for completeness) */}
            {user?.location && isProfilePublic && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{user.location}</span>
              </p>
            )}

            {/* Skills/Badges - Highly compacted spacing */}
            {(isProfilePublic || connectionStatus === "connected") && user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.skills.slice(0, 3).map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-xs font-normal border-primary/30 text-primary hover:bg-primary/10 transition-colors px-1.5 py-0" // py-0 for extreme compactness
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            {/* Private Profile placeholder text */}
            {!isProfilePublic && connectionStatus !== "connected" && (
              <div className="text-xs text-muted-foreground/80 mt-1 flex items-center">
                <Lock className="h-3 w-3 mr-1 text-muted-foreground/50" />
                Connect to view details.
              </div>
            )}

          </div>
        </div>

        {/* Right Section: Action Buttons - Aligned tightly */}
        <div className="flex flex-col items-end justify-center gap-1 flex-shrink-0">
          {/* View Profile Button - height reduced to h-8 */}
          <Button variant="outline" asChild className="w-[100px] sm:w-[120px] px-3 h-8 text-sm">
            <Link href={`/dashboard/profiles/${user._id}`}>Profile</Link>
          </Button>

          {/* Main Action Button (Connect/Message/Pending) */}
          {renderActionButton()}
        </div>
      </CardContent>
    </Card>
  )
}