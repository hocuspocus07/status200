"use client";

import { CertificatePreview } from "@/components/credentials/certificate-preview";
import { Loader2 } from "lucide-react";

import { useEffect, useState, use } from "react"; // 1. Import 'use'

export default function CertificatePage({
  params,
}: {

  params: Promise<{ id: string }>; // 2. Update type to Promise
}) {
  const { id } = use(params); // 3. Unwrap params using use()
  
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCert = async () => {
      try {
        const res = await fetch(`/api/certificate/get-cert-by-id/${id}`);
        const data = await res.json();
        setCertificate(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCert();
  }, [id]);

  if (!certificate)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading...
      </div>
    );

  return <CertificatePreview certificate={certificate} />;
}