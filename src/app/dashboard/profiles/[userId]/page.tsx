"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import {
  Award,
  Mail,
  CalendarDays,
  Sparkles,
  UserCheck,
  BookMarked,
  Loader2,
  Link as LinkIcon,
  Info,
  MapPin,
  GraduationCap,
  Lock
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

import { FileDown } from "lucide-react";
interface Certificate {
  _id: string;
  course: string;
  issued_by: string;
  nsqf_level: string;
  passed_at: string | Date;
  bucket_image_url: string;
  is_verified: boolean;
  blockchain_certificate_hash?: string;
}

interface Education {
  _id: string;
  institute_name: string;
  degree: string;
  field_of_study: string;
  started_at: string | Date;
  completed_at: (string | Date) | null;
  currently_studying: boolean;
  description?: string;
}

interface UserProfile {
  name: string;
  email: string;
  skills: string[];
  certificates: Certificate[];
  educations: Education[];
  created_at: string | Date;
  about?: string;
  headline?: string;
  location?: string;
  socials?: {
    website?: string;
  };
  isPublic?: boolean;
}

type ConnectionStatus =
  | "idle"
  | "loading"
  | "none"         // No connection
  | "pending-in"   // They sent user a request
  | "pending-out"  // User sent them a request
  | "connected"
  | "self";

export default function UserProfilePage() {
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  console.log(user?.certificates)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [connectionId, setConnectionId] = useState<string | null>(null); // For 'connected' or 'pending-in'
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const formatDate = (raw: any) => {
    try {
      return new Date(raw).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Invalid Date";
    }
  };
  const handleDownloadCertificatesPdf = async () => {
    if (!user || !user.certificates?.length) {
      toast.info("No certificates to download.");
      return;
    }

    setIsDownloading(true);
    const apiEndpoint = '/api/report';
const certData = user.certificates
  .map(cert => {
    return {
      url: cert.bucket_image_url,
      name: cert.course,
      id:cert._id,
    };
  })
  .filter(c => c.url);
    if (certData.length === 0) {
      toast.warning("Certificate images are missing.");
      setIsDownloading(false);
      return;
    }

    const downloadToastId = toast.loading("Generating PDF report...");

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({certificates: certData }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      // 2. Get the PDF data as a Blob
      const pdfBlob = await response.blob();
      let filename = `${user.name.replace(/\s/g, '_')}_Certificates_Report.pdf`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/i);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // 4. Create a URL for the Blob object
      const url = window.URL.createObjectURL(pdfBlob);

      // 5. Create a temporary <a> element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;

      // 6. Programmatically click the link to initiate the download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 7. Revoke the Blob URL to free up memory
      window.URL.revokeObjectURL(url);

      toast.success("PDF generated successfully! Download started.", { id: downloadToastId });

    } catch (error) {
      console.error('Error during PDF download:', error);
      toast.error("Failed to generate PDF. Please try again.", { id: downloadToastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatMonthYear = (raw: any) => {
    if (!raw) return null;
    try {
      return new Date(raw).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short"
      });
    } catch {
      return "Invalid Date";
    }
  };

  // 1. Get token and profile user's ID from URL on mount
  useEffect(() => {
    setToken(localStorage.getItem("token"));

    const pathSegments = window.location.pathname.split('/');
    const lastSegment = pathSegments.pop();
    if (lastSegment) {
      setProfileUserId(lastSegment);
    } else {
      setError("Could not determine user ID from URL.");
      setLoading(false);
    }
  }, []);

  // 2. Fetch the profile user's data
  useEffect(() => {
    if (!profileUserId || !token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${profileUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();
        if (!res.ok) {
          setError(json.message || "Failed to load user");
          setLoading(false);
          return;
        }
        console.log(json);
        setUser(json.data);
        setLoading(false);
      } catch (err) {
        setError("Could not fetch user profile.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [profileUserId, token]);

  // 3. Fetch logged-in user's ID and connection status
  useEffect(() => {
    if (!profileUserId || !token) return;

    const fetchMyIdAndConnectionStatus = async () => {
      setConnectionStatus("loading");

      let currentUserId: string | null = null;
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
        setError(`Session invalid: ${err.message}. Please log in again.`);
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

// 1. Check accepted connections (c.user could be null)
const accepted = connections.find((c: any) => c.user?._id === profileUserId);
if (accepted) {
  setConnectionStatus("connected");
  setConnectionId(accepted.connectionId);
  return;
}

// 2. Check pending-in requests (r.requester could be null)
const pendingIn = pendingRequests.find((r: any) => r.requester?._id === profileUserId);
if (pendingIn) {
  setConnectionStatus("pending-in");
  setConnectionId(pendingIn._id);
  return;
}

// 3. Check pending-out requests (r.recipient could be null)
const pendingOut = sentRequests.find((r: any) => r.recipient?._id === profileUserId);
if (pendingOut) {
  setConnectionStatus("pending-out");
  return;
}
        // If none match, there is no connection
        setConnectionStatus("none");

      } catch (err: any) {
        console.error("Connection status error:", err.message);
        setConnectionStatus("idle"); // Set to idle on error
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
      // Success
      setConnectionStatus("pending-out");
    } catch (err: any) {
      console.error(err.message);
      toast.error("some error occured");
    }
    setIsConnecting(false);
  };

  const handleRemoveConnection = async () => {
    if (!connectionId || !token) return;
    setIsConnecting(true);
    try {
      const res = await fetch(`/api/connections/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ connectionId: connectionId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to remove connection");
      }
      // Success
      setConnectionStatus("none");
      setConnectionId(null);
    } catch (err: any) {
      console.error(err.message);
      toast.error("some error occured");
    }
    setIsConnecting(false);
  };

  const handleRespondToRequest = (response: "accepted" | "rejected") => {
    if (!connectionId || !token) return;
    setIsConnecting(true);

    fetch(`/api/connections/respond`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: connectionId, response: response }),
    })
      .then(res => res.json())
      .then(json => {
        if (!json.connection && response === 'accepted') { // Check for connection on accept
          throw new Error(json.message || "Failed to accept");
        }
        if (response === 'accepted') {
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("none");
          setConnectionId(null);
        }
      })
      .catch(() => toast.error("some error occured"))
      .finally(() => setIsConnecting(false));
  };


  const renderConnectionButtons = () => {
    if (isConnecting) {
      return <Button variant="outline" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>;
    }

    switch (connectionStatus) {
      case "connected":
        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">Connected</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Connection</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {user?.name} from your connections?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveConnection} className="bg-red-500 hover:bg-red-600">
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      case "pending-in":
        return (
          <div className="text-sm">
            {user?.name} wants to connect
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => handleRespondToRequest('accepted')}>Accept</Button>
              <Button variant="outline" size="sm" onClick={() => handleRespondToRequest('rejected')}>Decline</Button>
            </div></div>
        );
      case "pending-out":
        return <Button variant="outline" size="sm" disabled>Request Sent</Button>;
      case "none":
        return <Button variant="default" size="sm" onClick={handleConnect}>Connect</Button>;
      case "loading":
      case "idle":
      default:
        return <Button variant="outline" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500">
        {error || "User not found."}
      </div>
    );
  }
  console.log("this", user.isPublic);
  const isProfilePublic = user.isPublic ?? true;

  const canViewProfileDetails =
    isProfilePublic ||
    connectionStatus === "connected" ||
    connectionStatus === "self";

  const avatarFallback = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "??";

  const coverUrl = `https://placehold.co/1500x400/A0AEC0/FFFFFF?text=Professional+Banner`;
  const avatarUrl = `https://placehold.co/160x160/E2E8F0/4A5568?text=${avatarFallback}`;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-7xl mx-auto">
        <div className="relative h-48 md:h-64">
          <div
            className="absolute inset-0 bg-cover bg-center rounded-b-lg"
            style={{ backgroundImage: `url(${coverUrl})` }}
          />
          <a href="/dashboard/network" className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              size="sm"
              className="backdrop-blur bg-white/70 dark:bg-gray-900/70"
            >
              ← Back to Network
            </Button>
          </a>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative flex items-end justify-between -mt-20 md:-mt-24">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-gray-950 rounded-full shadow-lg">
              <AvatarImage src={avatarUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">{avatarFallback}</AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              {renderConnectionButtons()}
              {(isProfilePublic || connectionStatus === "connected") && (
                <Button variant="default" size="sm">Message</Button>)}
            </div>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
            <p className="text-xl mt-1 text-gray-800 dark:text-gray-200">
              {user.headline || (user.skills?.length ? user.skills.join(" | ") : "Learner & Developer")}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${user.email}`} className="hover:underline">
                {user.email}
              </a>
            </div>

            {user.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                {user.location}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CalendarDays className="h-4 w-4" />
              Joined {formatDate(user.created_at)}
            </div>

            {user.skills?.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="h-4 w-4" />
                {user.skills.length} skills
              </div>
            )}

            {user.socials?.website && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <LinkIcon className="h-4 w-4" />
                <a
                  href={user.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {user.socials.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pb-20">
          {canViewProfileDetails ? (
            <Tabs defaultValue="certificates" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              <TabsContent value="certificates" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" /> Verified Certificates
                    </CardTitle>
                    <CardDescription>Credentials earned by {user.name}</CardDescription>
                    {user.certificates?.length > 0 && (
                      <Button
                        size="sm"
                        onClick={handleDownloadCertificatesPdf}
                        disabled={isDownloading}
                        variant="outline"
                        className="text-sm"
                      >
                        {isDownloading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileDown className="mr-2 h-4 w-4" />
                        )}
                        Download PDF
                      </Button>
                    )}
                  </CardHeader>

                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.certificates?.length ? (
                      user.certificates.map((cert, i) => (
                        <Link href={`/dashboard/certificates/${cert._id}`} key={cert._id}>
                          <Card className="overflow-hidden shadow-lg hover:shadow-xl">
                            <img
                              src={cert.bucket_image_url}
                              alt={cert.course}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://placehold.co/600x400?text=${cert.course}`;
                              }}
                            />
                            <CardHeader>
                              <CardTitle className="text-lg">{cert.course}</CardTitle>
                              <CardDescription>Issued by: {cert.issued_by}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <BookMarked className="h-4 w-4" />
                                NSQF Level: {cert.nsqf_level}
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Passed: {formatDate(cert.passed_at)}
                              </div>
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                Status:{" "}
                                {cert.is_verified ? (
                                  <span className="text-green-500 font-semibold">Verified</span>
                                ) : (
                                  <span className="text-yellow-500 font-semibold">Pending</span>
                                )}
                              </div>
                              {cert.blockchain_certificate_hash && (
                                <div className="flex items-center gap-2 text-xs pt-2">
                                  <LinkIcon className="h-3 w-3" />
                                  <span className="truncate">
                                    Hash: {cert.blockchain_certificate_hash}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 md:col-span-2">
                        No certificates added yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about" className="mt-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" /> About
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {user.about ? (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {user.about}
                        </p>
                      ) : (
                        <p className="text-center text-gray-500">
                          No 'About' information provided.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" /> Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {user.educations?.length ? (
                        <ul className="space-y-4">
                          {user.educations.map((edu) => (
                            <li key={edu._id} className="flex gap-4">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{edu.institute_name}</h3>
                                <p className="text-gray-700 dark:text-gray-300">{edu.degree}, {edu.field_of_study}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatMonthYear(edu.started_at)} - {edu.currently_studying ? 'Present' : formatMonthYear(edu.completed_at)}
                                </p>
                                {edu.description && (
                                  <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                    {edu.description}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-gray-500">
                          No education added yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" /> Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.skills?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">
                          No skills added yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="mt-6 py-20 flex flex-col items-center justify-center text-center">
              <Lock className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-semibold">This profile is private</p>
              <p className="text-sm text-muted-foreground mt-1">
                Connect with {user.name} to view their full profile.
              </p>
            </Card>

          )}
        </div>
      </div>
    </main>
  );
}