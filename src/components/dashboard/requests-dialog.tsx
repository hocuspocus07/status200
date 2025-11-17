"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Loader2,
  UserPlus,
  Check,
  X,
} from "lucide-react";

// Interface for a user in the pending requests list
interface RequesterUser {
  _id: string;
  name: string;
  headline?: string;
  profile?: {
    avatar?: string;
  };
}

// Interface for the pending request item from /api/connections/pending
interface PendingRequestItem {
  _id: string;
  requester: RequesterUser;
  status: string;
}

interface IncomingRequestsDialogProps {
  token: string | null;
  pendingCount: number;
  onRequestsUpdated: (count: number) => void;
}

export function IncomingRequestsDialog({
  token,
  pendingCount,
  onRequestsUpdated,
}: IncomingRequestsDialogProps) {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<PendingRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && token) {
      const fetchPendingRequests = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/connections/pending", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch pending requests");
          const data = await res.json();
          setRequests(data.requests);
        } catch (err: any) {
          setError(err.message);
        }
        setLoading(false);
      };
      fetchPendingRequests();
    }
  }, [open, token]);

  const handleRespond = async (
    requestId: string,
    response: "accepted" | "rejected"
  ) => {
    if (!token) return;
    try {
      const res = await fetch("/api/connections/respond", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, response }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to respond to request");
      }
      const newRequests = requests.filter((r) => r._id !== requestId);
      setRequests(newRequests);
      onRequestsUpdated(newRequests.length);
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    }
  };

  const getAvatarFallback = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <UserPlus className="h-4 w-4 mr-2" />
          Requests
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Incoming Connection Requests</DialogTitle>
          <DialogDescription>
            Accept or decline requests from other users.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : requests.length > 0 ? (
            requests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between"
              >
                <a
                  href={`/users/${request.requester._id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar>
                    <AvatarImage src={request.requester.profile?.avatar} />
                    <AvatarFallback>
                      {getAvatarFallback(request.requester.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold group-hover:underline">
                      {request.requester.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.requester.headline || "No headline"}
                    </p>
                  </div>
                </a>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => handleRespond(request._id, "accepted")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRespond(request._id, "rejected")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              You have no pending requests.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}