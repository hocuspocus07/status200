"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap, GraduationCap, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- INTERFACES ---
interface Certificate {
  _id: string;
  course: string;
  issued_to: string;
  issued_by: string;
  passed_at: string;
  is_verified: boolean;
  verification_link: string;
  bucket_image_url?: string;
  nsqf_level?: string;
  reasons_for_failure?: string[];

  // additional fields for pathways
  syllabus?: string;
  outcomes?: string;
  jobs?: string;
  certif_medium?: "upload" | "digilocker";
}

// New Interfaces for Pathway API
interface PathwayCourse {
  NSQFLevel: number;
  courseName: string;
  idx: number;
  similarity: number;
  syllabusCovered: string;
}

interface PathwayResponse {
  pathway: PathwayCourse[];
  start_level: number;
}

const reasons_for_failure_updated = [
  "Certificate may be not present in the predefined templates",
  "Some parts appear edited or altered",
  "Textures don't match across the document",
  "Repeated patterns suggest copy-paste",
  "Text or handwriting(signature) thickness is inconsistent",
];

// --- HELPER COMPONENTS ---

// Helper function uses standard Shadcn badge variants
const getStatusProps = (cert: Certificate) => {
  if (cert.is_verified) {
    return { text: 'Verified', variant: 'default' as const, icon: CheckCircle };
  }
  if (cert.reasons_for_failure && cert.reasons_for_failure.length > 0) {
    // Using 'destructive' for failed verification
    return { text: 'Failed', variant: 'destructive' as const, icon: XCircle };
  }
  // Fallback to a neutral state if verification is ongoing/not yet determined
  return { text: 'Pending', variant: 'secondary' as const, icon: Loader2 };
};

export function CertificateCard({
  certificate,
  onClick,
}: {
  certificate: Certificate;
  onClick: () => void;
}) {
  const status = getStatusProps(certificate);
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-shadow hover:shadow-lg hover:border-primary/50"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl leading-tight">
              {certificate.course}
            </CardTitle>
            <CardDescription className="text-sm">
              Issued by {certificate.issued_by}
            </CardDescription>
          </div>

          <Badge variant={status.variant} className="h-fit text-xs px-3 py-1 flex items-center gap-1">
            <status.icon className={cn("h-3 w-3", status.text === 'Pending' && 'animate-spin')} />
            {status.text}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}

const CertificateModal = ({
  certificate,
  onClose,
  onFetchPathways,
  pathwayData,
  loadingPathways
}: {
  certificate: Certificate;
  onClose: () => void;
  onFetchPathways: () => void;
  pathwayData: PathwayResponse | null;
  loadingPathways: boolean;
}) => {
  const status = getStatusProps(certificate);

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="sm:col-span-2 text-foreground break-words">{value}</dd>
    </div>
  );

  const [userIsPremium, setUserIsPremium] = useState(false);

  useEffect(() => {
    const getUserIsPremium = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      res.json().then((data) => {
        setUserIsPremium(data.user.isPremium);
      })
    }

    getUserIsPremium();
  }, []);

  const redirectToPremiumPage = () => {
    toast.error("Upgrade to Premium to access this feature.")
    window.location.href = "/pricing";
  };

  // Modal content width increased from max-w-4xl to max-w-6xl for better spacing.
  return (
    <Dialog open={!!certificate} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] flex flex-col p-0">        {/* Modal Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">{certificate.course}</DialogTitle>
          <DialogDescription>Certificate record and potential career paths.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 space-y-8">

          {/* Basic Details Column */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">Certificate Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left Column: Image & Core Meta */}
              <div className="space-y-4">
                {certificate.bucket_image_url && (
                  <div className="border rounded-lg overflow-hidden shadow-md">
                    <img
                      src={certificate.bucket_image_url}
                      alt={`Certificate for ${certificate.course}`}
                      className="w-full object-cover max-h-60 bg-muted"
                    />
                  </div>
                )}
                <dl className="space-y-1 text-sm bg-muted/30 p-4 rounded-lg">
                  <DetailItem label="Recipient" value={certificate.issued_to} />
                  <DetailItem label="Issued by" value={certificate.issued_by} />
                  <DetailItem label="Date Passed" value={new Date(certificate.passed_at).toLocaleDateString()} />
                  {certificate.nsqf_level && <DetailItem label="NSQF Level" value={<Badge variant="outline">{certificate.nsqf_level}</Badge>} />}
                  <DetailItem label="Status" value={<Badge variant={status.variant} className="text-xs">{status.text}</Badge>} />
                  <DetailItem label="Source" value={certificate.certif_medium || 'N/A'} />
                </dl>
              </div>

              {/* Right Column: Detailed Outcomes/Failures */}
              <div className="space-y-4">
                {/* Outcome Details */}
                <Card className="shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground/80"><GraduationCap className="w-4 h-4 text-primary" /> Key Learning Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground pt-0">
                    {certificate.outcomes || certificate.syllabus || "No detailed syllabus or outcome information available."}
                  </CardContent>
                </Card>

                {/* Job Details */}
                <Card className="shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground/80"><TrendingUp className="w-4 h-4 text-primary" /> Associated Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground pt-0">
                    {certificate.jobs || "No specific job roles provided with this certificate."}
                  </CardContent>
                </Card>

                {/* Failure Reasons Block */}
                {status.text === 'Failed' && certificate.reasons_for_failure && (
                  <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-sm">
                    <p className="font-semibold text-destructive mb-2">Verification Failed Reasons:</p>
                    <ul className="list-disc list-inside text-destructive/90 space-y-0.5 ml-2">
                      {reasons_for_failure_updated.map((reason, index) => <li key={index}>{reason}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Pathway Section */}
          <section>
            <Separator className="my-6" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2"><Zap className="w-5 h-5" /> Career Pathways</h3>

              {/* Pathway Generation Button */}
              {!pathwayData && (
                <Button
                  onClick={userIsPremium ? onFetchPathways : redirectToPremiumPage}
                  disabled={loadingPathways}
                >
                  {userIsPremium
                    ? loadingPathways
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                      : "Generate Pathways"
                    : "Upgrade to Premium to Generate"}
                </Button>
              )}
            </div>

            {pathwayData && (
              <div className="space-y-4">
                {/* Current Level Indicator */}
                <div className="p-3 bg-secondary/30 rounded-lg border border-secondary text-sm text-secondary-foreground">
                  <span className="font-semibold">Starting Point:</span> Your current certificate aligns with NSQF Level     {pathwayData.start_level}  .
                </div>

                {/* Pathway Cards */}
                <div className="grid gap-4">
                  {pathwayData.pathway.map((path, idx) => (
                    <Card key={idx} className="hover:border-primary transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-bold text-foreground">{path.courseName}</CardTitle>
                          <Badge variant="outline" className="text-xs bg-muted border-primary/50 text-primary">
                            NSQF {path.NSQFLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-24 bg-muted-foreground/20 rounded-full h-2">
                            {/* Similarity Bar using primary color */}
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${path.similarity * 100}%` }}></div>
                          </div>
                          <span>{(path.similarity * 100).toFixed(0)}% Syllabus Match</span>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground leading-relaxed pt-0">
                        Focus:     {path.syllabusCovered}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page Component ---
export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Pathway State
  const [pathwayData, setPathwayData] = useState<Record<string, PathwayResponse | null>>({});
  const [loadingPathways, setLoadingPathways] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/certificate/get', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error("Session expired. Please log in again.");
          setCertificates([]);
          return;
        }

        const data = await response.json();
        setCertificates(data.certificates || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not fetch certificates.";
        toast.error(errorMessage);
        setCertificates([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, []);

  const handleFetchPathways = async (certificate: Certificate) => {
    const certId = certificate._id;
    if (pathwayData[certId]) return; // Skip if already loaded

    setLoadingPathways((prev) => ({ ...prev, [certId]: true }));

    try {
      // Using the localhost:4500 endpoint as provided
      const res = await fetch("http://localhost:4500/pathway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: certificate.course,
          syllabusCovered: certificate.syllabus || "",
          jobDescription: certificate.jobs || ""
        }),
      });

      if (!res.ok) {
        throw new Error(`Pathway API Error: ${res.statusText}`);
      }

      const data: PathwayResponse = await res.json();
      setPathwayData((prev) => ({ ...prev, [certId]: data }));
      toast.success("Pathways generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate pathways. Check the service connection.");
    } finally {
      setLoadingPathways((prev) => ({ ...prev, [certId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 text-foreground flex items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        <p className="text-xl text-muted-foreground">Loading your certificates...</p>

      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Credentials</h1>
        {certificates.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg bg-card shadow-sm">
            <p className="text-muted-foreground">You have no certificates. Use the "Upload" feature to add your first credential!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert._id}
                certificate={cert}
                onClick={() => setSelectedCertificate(cert)}
              />
            ))}
          </div>
        )}

      </div>

      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}

          // Pathway Props
          onFetchPathways={() => handleFetchPathways(selectedCertificate)}
          pathwayData={pathwayData[selectedCertificate._id] || null}
          loadingPathways={!!loadingPathways[selectedCertificate._id]}
        />
      )}
    </div>
  );
}