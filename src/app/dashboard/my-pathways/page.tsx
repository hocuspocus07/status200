"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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

// --- HELPER COMPONENTS ---
const getStatusProps = (cert: Certificate) => {
  if (cert.is_verified) {
    return { text: 'Verified', className: 'bg-green-800 text-green-200' };
  }
  if (cert.reasons_for_failure && cert.reasons_for_failure.length > 0) {
    return { text: 'Pending', className: 'bg-yellow-800 text-yellow-200' };
  }
  return { text: 'Failed', className: 'bg-red-800 text-red-200' };
};

const CertificateBar = ({ certificate, onClick }: { certificate: Certificate; onClick: () => void; }) => {
  const status = getStatusProps(certificate);
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-900 cursor-pointer hover:border-cyan-400 transition-colors"
    >
      <div>
        <h3 className="font-semibold text-lg text-cyan-400">{certificate.course}</h3>
        <p className="text-sm text-gray-400">Issued by: {certificate.issued_by}</p>
      </div>
      <div className={`px-3 py-1 text-xs font-medium rounded-full ${status.className}`}>
        {status.text}
      </div>
    </div>
  );
};

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
    <div className="flex flex-col sm:flex-row">
      <dt className="w-full sm:w-1/3 font-medium text-gray-400">{label}</dt>
      <dd className="w-full sm:w-2/3 text-white">{value}</dd>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-cyan-400">{certificate.course}</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none hover:text-white">&times;</button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">

          {/* Basic Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Certificate Details</h3>
            {certificate.bucket_image_url && (
              <img src={certificate.bucket_image_url} alt={`Certificate for ${certificate.course}`} className="mb-6 rounded-md w-full object-contain border border-gray-700 max-h-80" />
            )}
            <dl className="space-y-3 text-sm">
              <DetailItem label="Recipient" value={certificate.issued_to} />
              <DetailItem label="Issued by" value={certificate.issued_by} />
              <DetailItem label="Date Passed" value={new Date(certificate.passed_at).toLocaleDateString()} />
              {certificate.nsqf_level && <DetailItem label="NSQF Level" value={certificate.nsqf_level} />}
              <DetailItem label="Status" value={<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.className}`}>{status.text}</span>} />
            </dl>
            {status.text === 'Failed' && certificate.reasons_for_failure && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm">
                <p className="font-semibold text-red-300 mb-1">Verification Failed:</p>
                <ul className="list-disc list-inside text-red-400">
                  {certificate.reasons_for_failure.map((reason, index) => <li key={index}>{reason}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Progression Pathways Section */}
          <div>
            <hr className="border-gray-700 mb-6" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Career Progression Pathways</h3>
              {!pathwayData && (
                <button
                  onClick={onFetchPathways}
                  disabled={loadingPathways}
                  className={`px-4 py-2 text-sm rounded font-medium transition-colors ${loadingPathways ? "bg-gray-700 cursor-not-allowed" : "bg-cyan-600 text-white hover:bg-cyan-500"}`}
                >
                  {loadingPathways ? "Generating..." : "Generate Pathways"}
                </button>
              )}
            </div>

            {pathwayData && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-3 bg-gray-800/50 rounded border border-gray-700 text-sm text-gray-300">
                  <span className="font-semibold text-cyan-400">Current Level:</span> NSQF {pathwayData.start_level}
                </div>
                <div className="grid gap-4">
                  {pathwayData.pathway.map((path, idx) => (
                    <div key={idx} className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white text-lg">{path.courseName}</h4>
                        <span className="px-2 py-1 bg-purple-900/50 text-purple-200 text-xs rounded border border-purple-700">
                          NSQF {path.NSQFLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                        <div className="w-full bg-gray-700 rounded-full h-1.5 max-w-[100px]">
                          <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${path.similarity * 100}%` }}></div>
                        </div>
                        <span>{(path.similarity * 100).toFixed(0)}% Match</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{path.syllabusCovered}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
        console.log("[debug]: Fetched certificates:", data);
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

    // If we already have data, don't fetch again (optional optimization)
    if (pathwayData[certId]) return;

    setLoadingPathways((prev) => ({ ...prev, [certId]: true }));

    try {
      // Using the localhost:4500 endpoint as requested
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
      toast.error("Failed to generate pathways. Ensure the AI service is running.");
    } finally {
      setLoadingPathways((prev) => ({ ...prev, [certId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 text-foreground flex items-center justify-center">
        <p className="text-xl">Loading your certificates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 text-foregorund">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
        {certificates.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-400">You have not submitted any certificates yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (<CertificateBar key={cert._id} certificate={cert} onClick={() => setSelectedCertificate(cert)} />))}
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