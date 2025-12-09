"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, ExternalLink } from "lucide-react";
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
  blockchain_certificate_hash?: string;
  reasons_for_failure?: string[];
  transaction_hash?: string;
}
interface BlockchainData {
  certHash: string;
  courseHash: string;
  issuerHash: string;
  issuedOn: number;
}
interface DecodedToken {
  id: string;
  email: string;
  learnerIdHash: string;
  iat: number;
  exp: number;
}

const reasons_for_failure_updated = [
  "Certificate may be not present in the predefined templates",
  "Some parts appear edited or altered",
  "Textures don't match across the document",
  "Repeated patterns suggest copy-paste",
  "Text or handwriting(signature) thickness is inconsistent",
];

// --- HELPER COMPONENTS ---

// Helper function now uses standard Shadcn badge variants
const getStatusProps = (cert: Certificate) => {
  if (cert.is_verified) {
    return { text: 'Verified', variant: 'default' as const };
  }
  if (cert.reasons_for_failure && cert.reasons_for_failure.length > 0) {
    // Using 'destructive' for failed verification
    return { text: 'Failed', variant: 'destructive' as const };
  }
  // Assuming 'Pending' for cases where verification hasn't explicitly succeeded or failed yet
  return { text: 'Pending', variant: 'secondary' as const };
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
      className="cursor-pointer transition-shadow hover:shadow-lg"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl leading-tight">
              {certificate.course}
            </CardTitle>
            <CardDescription className="text-sm">
              Issued by {certificate.issued_by}
            </CardDescription>
          </div>

          <Badge variant={status.variant} className="h-fit text-xs px-3 py-1">
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
  onFetchBlockchain,
  blockchainData,
  loadingChain,
}: {
  certificate: Certificate;
  onClose: () => void;
  onFetchBlockchain: () => void;
  blockchainData: BlockchainData | null;
  loadingChain: boolean;
}) => {
  const status = getStatusProps(certificate);

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="sm:col-span-2 text-foreground break-words">{value}</dd>
    </div>
  );

  // The modal is now a Shadcn Dialog
  return (
    <Dialog open={!!certificate} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Modal Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">{certificate.course}</DialogTitle>
          <DialogDescription>Details for the certificate issued by {certificate.issued_by}.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 space-y-6">

          {/* Certificate Image and Core Details */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Core Information</h3>
            {certificate.bucket_image_url && (
              <div className="mb-6 border rounded-lg overflow-hidden">
                <img
                  src={certificate.bucket_image_url}
                  alt={`Certificate for ${certificate.course}`}
                  className="w-full object-contain max-h-80"
                />
              </div>
            )}
            <dl className="space-y-2 text-sm">
              <DetailItem label="Recipient" value={certificate.issued_to} />
              <DetailItem label="Date Passed" value={new Date(certificate.passed_at).toLocaleDateString()} />
              {certificate.nsqf_level && <DetailItem label="NSQF Level" value={<Badge variant="outline">{certificate.nsqf_level}</Badge>} />}
              <DetailItem label="Verification Status" value={<Badge variant={status.variant} className="text-xs">{status.text}</Badge>} />
              {certificate.verification_link && <DetailItem label="Official Link" value={<a href={certificate.verification_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">View <ExternalLink className="w-3 h-3" /></a>} />}
            </dl>

            {/* Failure Reasons Block */}
            {status.text === 'Failed' && certificate.reasons_for_failure && (
              <div className="mt-4 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-sm">
                <p className="font-semibold text-destructive mb-2">Verification Failed Reasons:</p>
                <ul className="list-disc list-inside text-destructive/90 space-y-0.5 ml-2">
                  {reasons_for_failure_updated.map((reason, index) => <li key={index}>{reason}</li>)}
                </ul>
              </div>
            )}
          </section>

          {/* Blockchain section */}
          {certificate.blockchain_certificate_hash && (
            <section>
              <Separator className="my-6" />
              <h3 className="text-lg font-semibold mb-4">Immutable Record (Blockchain)</h3>

              <Button
                className="w-full mb-4"
                onClick={onFetchBlockchain}
                disabled={loadingChain}
              >
                {loadingChain ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying on Blockchain...</>
                ) : (
                  "Verify on Blockchain"
                )}
              </Button>

              {/* Blockchain Data Display */}
              {blockchainData && (
                <Card className="p-4 bg-muted/20 border-border">
                  <div className="space-y-1 text-xs break-words font-mono">
                    <p className="text-muted-foreground">Blockchain Record Found:</p>
                    <DetailItem label="Certificate Hash" value={blockchainData.certHash} />
                    <DetailItem label="Course Hash" value={blockchainData.courseHash} />
                    <DetailItem label="Issuer Hash" value={blockchainData.issuerHash} />
                    <DetailItem label="Issued On" value={new Date(blockchainData.issuedOn * 1000).toLocaleString()} />
                  </div>
                </Card>
              )}

              {/* PolygonScan Link */}
              {certificate.transaction_hash && (
                <a
                  href={`https://amoy.polygonscan.com/tx/${certificate.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex bg-secondary text-secondary-foreground hover:bg-secondary/80 items-center justify-center gap-2 px-4 py-2 rounded-md"
                >
                  View Transaction on PolygonScan <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </section>
          )}
        </div>
        {/* DialogClose is automatically positioned in the top corner by Shadcn */}
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page Component ---
export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [blockchainData, setBlockchainData] = useState<Record<string, BlockchainData | null>>({});
  const [loadingChain, setLoadingChain] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<{ learnerIdHash: string } | null>(null);

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
        const decodedToken: DecodedToken = jwtDecode(token);
        setUser({ learnerIdHash: decodedToken.learnerIdHash });
      } catch (error) {
        toast.error("Invalid session token. Please log in again.");
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

  const handleFetchBlockchain = async (certificate: Certificate) => {
    const certHash = certificate.blockchain_certificate_hash;
    if (!user || !certHash) return;

    setLoadingChain((prev) => ({ ...prev, [certHash]: true }));
    try {
      const res = await fetch("/api/blockchain-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerIdHash: user.learnerIdHash,
          certHash: certHash
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch from blockchain");
      setBlockchainData((prev) => ({ ...prev, [certHash]: data }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed.";
      toast.error(errorMessage);
      setBlockchainData((prev) => ({ ...prev, [certHash]: null }));
    } finally {
      setLoadingChain((prev) => ({ ...prev, [certHash]: false }));
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Certificates</h1>
        {certificates.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg bg-card shadow-sm">
            <p className="text-muted-foreground">You have not submitted any certificates yet.</p>
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
          onFetchBlockchain={() => handleFetchBlockchain(selectedCertificate)}
          blockchainData={selectedCertificate.blockchain_certificate_hash ? blockchainData[selectedCertificate.blockchain_certificate_hash] : null}
          loadingChain={selectedCertificate.blockchain_certificate_hash ? !!loadingChain[selectedCertificate.blockchain_certificate_hash] : false}
        />
      )}
    </div>
  );
}