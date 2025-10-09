"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

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
  transaction_hash?: string; // ✅ 1. Added transaction_hash field
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

// --- HELPER COMPONENTS ---
const getStatusProps = (cert: Certificate) => {
  if (cert.is_verified) {
    return { text: 'Verified', className: 'bg-green-800 text-green-200' };
  }
  if (cert.reasons_for_failure && cert.reasons_for_failure.length > 0) {
    return { text: 'Failed', className: 'bg-red-800 text-red-200' };
  }
  return { text: 'Pending', className: 'bg-yellow-800 text-yellow-200' };
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
    <div className="flex flex-col sm:flex-row">
      <dt className="w-full sm:w-1/3 font-medium text-gray-400">{label}</dt>
      <dd className="w-full sm:w-2/3 text-white">{value}</dd>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-cyan-400">{certificate.course}</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none hover:text-white">&times;</button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Certificate Details Section */}
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
          
          {/* Blockchain section */}
          {certificate.blockchain_certificate_hash && (
            <div>
              <hr className="border-gray-700 my-6" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Blockchain Verification</h3>
                <button
                  className={`w-full px-4 py-2 rounded font-medium transition-colors ${loadingChain ? "bg-gray-700 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
                  onClick={onFetchBlockchain}
                  disabled={loadingChain}
                >
                  {loadingChain ? "Verifying on Blockchain..." : "Verify on Blockchain"}
                </button>
                {blockchainData && (
                  <div className="mt-4 p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-2 text-xs break-words font-mono">
                    <p><span className="font-medium text-gray-400">Certificate Hash:</span> {blockchainData.certHash}</p>
                    <p><span className="font-medium text-gray-400">Course Hash:</span> {blockchainData.courseHash}</p>
                    <p><span className="font-medium text-gray-400">Issuer Hash:</span> {blockchainData.issuerHash}</p>
                    <p><span className="font-medium text-gray-400">Issued On:</span> {new Date(blockchainData.issuedOn * 1000).toLocaleString()}</p>
                  </div>
                )}
                {/* ✅ 2. Added PolygonScan transaction link */}
                {certificate.transaction_hash && (
                  <a
                    href={`https://amoy.polygonscan.com/tx/${certificate.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block w-full text-center px-4 py-2 rounded font-medium transition-colors bg-gray-600 text-white hover:bg-gray-500"
                  >
                    View Transaction on PolygonScan
                  </a>
                )}
              </div>
            </div>
          )}
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
  const [blockchainData, setBlockchainData] = useState<Record<string, BlockchainData | null>>({});
  const [loadingChain, setLoadingChain] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<{ learnerIdHash: string } | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token"); // ⚠️ Use your actual token key
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
      <div className="bg-black min-h-screen p-6 text-white flex items-center justify-center">
        <p className="text-xl">Loading your certificates...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen p-4 sm:p-6 text-white">
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
          onFetchBlockchain={() => handleFetchBlockchain(selectedCertificate)}
          blockchainData={selectedCertificate.blockchain_certificate_hash ? blockchainData[selectedCertificate.blockchain_certificate_hash] : null}
          loadingChain={selectedCertificate.blockchain_certificate_hash ? !!loadingChain[selectedCertificate.blockchain_certificate_hash] : false}
        />
      )}
    </div>
  );
}