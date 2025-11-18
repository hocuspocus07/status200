"use client";

import * as React from "react";
import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Database,
  Hash,
  QrCode,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ICertificate } from "@/models/certificate";
import { QrCodeModal } from "./qr-code";

interface CertificatePreviewProps {
  certificate: ICertificate;
}

const VerificationBadge: React.FC<{
  isVerified: boolean;
  reasons?: string[];
}> = ({ isVerified, reasons }) => {
  if (isVerified) {
    return (
      <Badge className="text-base p-3 bg-green-600 hover:bg-green-700">
        <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        Successfully Verified
      </Badge>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <Badge variant="destructive" className="text-base p-3">
        <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        Verification Failed
      </Badge>
      {reasons && reasons.length > 0 && (
        <ul className="list-disc list-inside text-sm text-destructive mt-3 space-y-1">
          {reasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const InfoItem: React.FC<{
  label: string;
  value: string;
  isHash?: boolean;
  icon?: React.ReactNode;
}> = ({ label, value, isHash = false, icon }) => (
  <div className="flex flex-col">
    <p className="text-sm font-medium text-muted-foreground flex items-center">
      {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
      {label}
    </p>
    {isHash ? (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>
            <p className="text-sm font-mono text-primary break-all" title={value}>
              {`${value.substring(0, 10)}...${value.substring(
                value.length - 10
              )}`}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <p className="text-lg font-semibold">{value}</p>
    )}
  </div>
);

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formattedDate = new Date(certificate.passed_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  console.log(certificate);
  return (
    <div className="p-4">
      <Card className="max-w-6xl mx-auto shadow-none border-0 overflow-hidden rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 p-0 md:p-10 bg-muted/30 flex items-center justify-center">
            {certificate.bucket_image_url ? (
              <img
                src={certificate.bucket_image_url}
                alt={`Certificate for ${certificate.course}`}
                className="rounded-xl border-2 bg-white shadow-md object-contain aspect-[800/560] w-full"
              />
            ) : (
              <div className="w-full aspect-[800/560] flex items-center justify-center bg-gray-200 rounded-lg">
                <p className="text-gray-500">
                  Certificate image not available
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 p-6 md:p-8 flex flex-col lg:border-l border-border">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                {certificate.course}
              </CardTitle>
              <CardDescription className="text-lg">
                Issued by <strong>{certificate.issued_by}</strong>
              </CardDescription>
            </CardHeader>

            <VerificationBadge
              isVerified={certificate.is_verified}
              reasons={certificate.reasons_for_failure}
            />

            <Separator className="my-6" />

            <CardContent className="p-0 flex-grow space-y-5">
              <InfoItem label="Issued To" value={certificate.issued_to} />
              <InfoItem label="Date of Completion" value={formattedDate} />

              {certificate.nsqf_level && (
                <InfoItem
                  label="NSQF Level"
                  value={String(certificate.nsqf_level)}
                  icon={<Database />}
                />
              )}

              {certificate.blockchain_certificate_hash && (
                <InfoItem
                  label="Blockchain Hash"
                  value={certificate.blockchain_certificate_hash}
                  isHash
                  icon={<Hash />}
                />
              )}

              {certificate.transaction_hash && (
                <InfoItem
                  label="Transaction Hash"
                  value={certificate.transaction_hash}
                  isHash
                  icon={<Hash />}
                />
              )}
            </CardContent>

            <div className="flex-grow min-h-[2rem]"></div>

            <Separator className="my-6" />

            <CardFooter className="p-0">
              <Button className="w-full" size="lg" onClick={() => setIsModalOpen(true)}>
                <QrCode className="w-4 h-4 mr-2" />
                Get QR Code
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
      <QrCodeModal
        url={`http://localhost:3000/dashboard/certificates/${certificate._id}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
