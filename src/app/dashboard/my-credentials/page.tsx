"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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
}
interface BlockchainData {
  certHash: string;
  courseHash: string;
  issuerHash: string;
  issuedOn: number;
}

const CertificateModal = ({ 
  certificate, 
  onClose,
  onFetchBlockchain,
  blockchainData,
  loadingChain,
  user
}: {
  certificate: Certificate | null;
  onClose: () => void;
  onFetchBlockchain: (learnerIdHash: string, certHash: string) => void;
  blockchainData: Record<string, BlockchainData | null>;
  loadingChain: Record<string, boolean>;
  user: { learnerIdHash: string } | null;
}) => {
  if (!certificate) return null;
  
  const certHash = certificate.blockchain_certificate_hash;
  const isBlockchainLoading = certHash ? loadingChain[certHash] : false;
  const chainData = certHash ? blockchainData[certHash] : null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">{certificate.course}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side: Image */}
            <div className="w-full">
              {certificate.bucket_image_url ? (
                <img 
                  src={certificate.bucket_image_url} 
                  alt={`Certificate for ${certificate.course}`}
                  className="rounded-md w-full object-contain border border-gray-700"
                />
              ) : (
                <div className="rounded-md w-full h-64 flex items-center justify-center bg-gray-800 border border-gray-700">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Right side: Details */}
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="font-semibold text-lg text-white mb-2">Certificate Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Recipient:</strong> {certificate.issued_to}</p>
                  <p><strong>Issued by:</strong> {certificate.issued_by}</p>
                  <p><strong>Date Passed:</strong> {new Date(certificate.passed_at).toLocaleDateString()}</p>
                  {certificate.nsqf_level && <p><strong>NSQF Level:</strong> {certificate.nsqf_level}</p>}
                  <p><strong>Status:</strong> 
                     <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                        certificate.is_verified 
                        ? 'bg-green-800 text-green-200' 
                        : certificate.reasons_for_failure && certificate.reasons_for_failure.length > 0 
                        ? 'bg-red-800 text-red-200' 
                        : 'bg-yellow-800 text-yellow-200'
                      }`}>
                        {certificate.is_verified ? 'Verified' : certificate.reasons_for_failure && certificate.reasons_for_failure.length > 0 ? 'Failed' : 'Pending'}
                    </span>
                  </p>
                   <p><strong>Official Link:</strong> 
                    <a href={certificate.verification_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-2">
                        Verify Externally
                    </a>
                  </p>
                </div>
              </div>

              {/* Display failure reasons if any */}
              {certificate.reasons_for_failure && certificate.reasons_for_failure.length > 0 && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-sm">
                    <p className="font-semibold text-red-300">Verification Failed:</p>
                    <ul className="list-disc list-inside text-red-400">
                        {certificate.reasons_for_failure.map((reason, index) => <li key={index}>{reason}</li>)}
                    </ul>
                </div>
              )}

              {/* Blockchain verification section */}
              {certHash && (
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-semibold text-lg text-white mb-2">Blockchain Verification</h4>
                  <button
                    className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                      isBlockchainLoading
                        ? "bg-gray-700 cursor-not-allowed" 
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                    onClick={() => onFetchBlockchain(user?.learnerIdHash || "", certHash)}
                    disabled={isBlockchainLoading}
                  >
                    {isBlockchainLoading ? "Verifying on Blockchain..." : "Verify on Blockchain"}
                  </button>

                  {chainData && (
                    <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded-lg space-y-2 text-xs break-words">
                      <p><span className="font-medium">Certificate Hash:</span> {chainData.certHash}</p>
                      <p><span className="font-medium">Course Hash:</span> {chainData.courseHash}</p>
                      <p><span className="font-medium">Issuer Hash:</span> {chainData.issuerHash}</p>
                      <p><span className="font-medium">Issued On (Timestamp):</span> {new Date(chainData.issuedOn * 1000).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  const [blockchainData, setBlockchainData] = useState<Record<string, BlockchainData | null>>({});
  const [loadingChain, setLoadingChain] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<{ learnerIdHash: string } | null>(null);

  useEffect(() => {
    setUser({ learnerIdHash: "8B968EB9A0CD90755F702A152FB8BF813939760B94236AD29093449B7B04E864" });

    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/certificate/get');
        if (!response.ok) throw new Error('Failed to fetch certificates');
        const data = await response.json();
        setCertificates(data.certificates);
      } catch (error) {
        toast.error("Could not load your certificates. Please try again later.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const fetchBlockchainData = async (learnerIdHash: string, certHash: string) => {
    setLoadingChain((prev) => ({ ...prev, [certHash]: true }));
    try {
      const res = await fetch("/api/blockchain-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerIdHash: "0x" + learnerIdHash, certHash: "0x" + certHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch blockchain data");
      setBlockchainData((prev) => ({ ...prev, [certHash]: data }));
    } catch (err) {
      console.error(err);
      setBlockchainData((prev) => ({ ...prev, [certHash]: null }));
      toast.error("Failed to verify on blockchain.");
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
    <div className="space-y-8 bg-black min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">My Certificates</h1>

      {certificates.length === 0 ? (
        <p className="text-gray-400">You have not submitted any certificates yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div 
              key={cert._id} 
              className="border border-gray-700 rounded-lg p-6 shadow-lg bg-gray-900 space-y-3 cursor-pointer hover:border-cyan-400 transition-colors"
              onClick={() => setSelectedCertificate(cert)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-xl text-cyan-400 flex-1 pr-2">{cert.course}</h3>
                <div className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full ${
                  cert.is_verified 
                  ? 'bg-green-800 text-green-200' 
                  : cert.reasons_for_failure && cert.reasons_for_failure.length > 0 
                  ? 'bg-red-800 text-red-200' 
                  : 'bg-yellow-800 text-yellow-200'
                }`}>
                  {cert.is_verified ? 'Verified' : cert.reasons_for_failure && cert.reasons_for_failure.length > 0 ? 'Failed' : 'Pending'}
                </div>
              </div>
              <p className="text-sm text-gray-300">Issued by: <span className="font-medium">{cert.issued_by}</span></p>
              <p className="text-sm text-gray-400">Recipient: {cert.issued_to}</p>
            </div>
          ))}
        </div>
      )}
      
      <CertificateModal 
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        onFetchBlockchain={fetchBlockchainData}
        blockchainData={blockchainData}
        loadingChain={loadingChain}
        user={user}
      />
    </div>
  );
}

