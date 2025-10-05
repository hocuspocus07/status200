"use client";

import React, { useEffect, useState } from "react";

interface Certificate {
  _id: string;
  course: string;
  issuer: string;
  certHash: string;
}

interface BlockchainData {
  certHash: string;
  courseHash: string;
  issuerHash: string;
  issuedOn: number;
}

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [blockchainData, setBlockchainData] = useState<Record<string, BlockchainData | null>>({});
  const [loadingChain, setLoadingChain] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<{ learnerIdHash: string } | null>(null);

  useEffect(() => {
    setUser({ learnerIdHash: "8B968EB9A0CD90755F702A152FB8BF813939760B94236AD29093449B7B04E864" });
    setCertificates([
      {
        _id: "1",
        course: "React Basics",
        issuer: "MyInstitute",
        certHash: "6B185E13F92562769407E3C8E7B10B5C157116CB9E9EE8485E1A3E60FCA72806",
      },
    ]);
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
    } finally {
      setLoadingChain((prev) => ({ ...prev, [certHash]: false }));
    }
  };

  return (
    <div className="space-y-6 bg-black min-h-screen p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">My Certificates</h1>
      {certificates.map((cert) => (
        <div key={cert._id} className="border border-white rounded-lg p-6 shadow-md bg-gray-900">
          <h3 className="font-semibold text-xl mb-1">{cert.course}</h3>
          <p className="text-gray-300 mb-2">Issued by: {cert.issuer}</p>

          <button
            className={`mt-2 px-4 py-2 rounded font-medium ${
              loadingChain[cert.certHash] ? "bg-gray-700 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"
            }`}
            onClick={() => fetchBlockchainData(user?.learnerIdHash || "", cert.certHash)}
            disabled={loadingChain[cert.certHash]}
          >
            {loadingChain[cert.certHash] ? "Fetching blockchain..." : "Show blockchain details"}
          </button>

          {blockchainData[cert.certHash] && (
            <div className="mt-4 p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-2">
              <p><span className="font-medium">Certificate Hash:</span> {blockchainData[cert.certHash]?.certHash}</p>
              <p><span className="font-medium">Course Hash:</span> {blockchainData[cert.certHash]?.courseHash}</p>
              <p><span className="font-medium">Issuer Hash:</span> {blockchainData[cert.certHash]?.issuerHash}</p>
              <p><span className="font-medium">Issued On:</span> {new Date((blockchainData[cert.certHash]?.issuedOn || 0) * 1000).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
