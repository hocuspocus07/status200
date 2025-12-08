"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Loader2,
  Users,
  Send,
  AlertOctagon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
// --- Types (copied from network page) ---

interface ConnectionUser {
  _id: string;
  name: string;
  headline?: string;
  profile?: {
    avatar?: string;
  };
}

interface ConnectionItem {
  connectionId: string;
  user: ConnectionUser;
}

interface SentRequestItem {
  _id: string;
  recipient: ConnectionUser;
  status: string;
}

// --- Component Props ---

interface ConnectionsTabsProps {
  token: string | null;
}

export function ConnectionsTabs({ token }: ConnectionsTabsProps) {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequestItem[]>([]);

  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [sentRequestsLoading, setSentRequestsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Fetch connections (runs on token change)
  useEffect(() => {
    if (!token) {
      setConnectionsLoading(false);
      return;
    }

    const fetchConnections = async () => {
      setConnectionsLoading(true);
      try {
        const res = await fetch("/api/connections", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch connections");
        const data = await res.json();
        setConnections(data.connections);
      } catch (err: any) {
        setError(err.message);
      }
      setConnectionsLoading(false);
    };

    fetchConnections();
  }, [token]);

  // Fetch sent requests when tab is clicked
  const fetchSentRequests = async () => {
    if (!token) {
      setSentRequestsLoading(false);
      return;
    }
    if (sentRequests.length > 0) return; // Don't refetch
    
    setSentRequestsLoading(true);
    try {
      const res = await fetch("/api/connections/sent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sent requests");
      const data = await res.json();
      setSentRequests(data.requests);
    } catch (err: any) {
      setError(err.message);
    }
    setSentRequestsLoading(false);
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/connections/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ connectionId }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to remove connection");
      }
      // Remove from state
      setConnections((prev) =>
        prev.filter((c) => c.connectionId !== connectionId)
      );
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
      // Show toast error
    }
  };

  const getAvatarFallback = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <>
      {error && (
        <Card className="mb-4 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertOctagon className="h-5 w-5" /> Error
            </CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="connections">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="connections">
            <Users className="h-4 w-4 mr-2" />
            My Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="sent" onClick={fetchSentRequests}>
            <Send className="h-4 w-4 mr-2" />
            Sent Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Connections</CardTitle>
              <CardDescription>
                People you are currently connected with.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionsLoading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : connections.length > 0 ? (
                connections.map(({ connectionId, user }) => (
                  <div
                    key={connectionId}
                    className="flex items-center justify-between"
                  >
                    <Link
                      href={`/dashboard/profiles/${user._id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar>
                        <AvatarImage src={user.profile?.avatar} />
                        <AvatarFallback>
                          {getAvatarFallback(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold group-hover:underline">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user.headline || "No headline"}
                        </p>
                      </div>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Connection</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {user.name} from
                            your connections?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveConnection(connectionId)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  You have no connections yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Requests</CardTitle>
              <CardDescription>
                People you have sent connection requests to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sentRequestsLoading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : sentRequests.length > 0 ? (
                sentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between"
                  >
                    <Link
                      href={`/dashboard/profiles/${request.recipient?._id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar>
                        <AvatarImage src={request.recipient?.profile?.avatar} />
                        <AvatarFallback>
                          {getAvatarFallback(request.recipient?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold group-hover:underline">
                          {request.recipient?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {request.recipient?.headline || "No headline"}
                        </p>
                      </div>
                    </Link>
                    <Button variant="outline" size="sm" disabled>
                      Request Sent
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  You have no pending sent requests.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}