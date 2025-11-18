"use client";

import { CertificatePreview } from "@/components/credentials/certificate-preview";
import { useEffect, useState } from "react";

export default function CertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
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

  if (!certificate) return <div>Loading...</div>;

  return <CertificatePreview certificate={certificate} />;
}
