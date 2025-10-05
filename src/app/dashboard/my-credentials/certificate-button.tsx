// "use client";

// import React, { useEffect, useState } from "react";
// import { verifyCertificateOnChain } from "@/lib/server/blockchain";

// interface Certificate {
//   _id: string;
//   course: string;
//   issuer: string;
//   certHash: string; // stored in Mongo
// }

// interface BlockchainData {
//   certHash: string;
//   courseHash: string;
//   issuerHash: string;
//   issuedOn: number;
// }

// export default function MyCertificatesPage() {
//   const [certificates, setCertificates] = useState<Certificate[]>([]);
//   const [blockchainData, setBlockchainData] = useState<Record<string, BlockchainData | null>>({});
//   const [loadingCert, setLoadingCert] = useState(false);
//   const [loadingChain, setLoadingChain] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);

//   const [user, setUser] = useState<{ learnerIdHash: string } | null>(null);

//   // Fetch user and certificates from Mongo
//   useEffect(() => {
//     const fetchUserAndCertificates = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         window.location.href = "/login";
//         return;
//       }

//       try {
//         setLoadingCert(true);
//         const res = await fetch("/api/users/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error("Failed to fetch user data");
//         const data = await res.json();
//         setUser(data.user);
//         setCertificates(data.user.certificates || []);
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch user data");
//       } finally {
//         setLoadingCert(false);
//       }
//     };
//     fetchUserAndCertificates();
//   }, []);

//   const fetchBlockchainData = async (certId: string, certHash: string) => {
    
//     if (!user?.learnerIdHash) {
//       setError("No learnerId found for blockchain verification");
//       return;
//     }

//     setLoadingChain((prev) => ({ ...prev, [certId]: true }));
//     try {
//       console.log("Verifying on chain:", user.learnerIdHash, certHash);
//       const data = await verifyCertificateOnChain(user.learnerIdHash, certHash);
//       setBlockchainData((prev) => ({ ...prev, [certId]: data }));
//     } catch (err) {
//       console.error(err);
//       setBlockchainData((prev) => ({ ...prev, [certId]: null }));
//     } finally {
//       setLoadingChain((prev) => ({ ...prev, [certId]: false }));
//     }
//   };

//   if (loadingCert) return <p>Loading certificates...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <div className="space-y-6">
//       {certificates.map((cert) => (
//         <div key={cert._id} className="border rounded-md p-4 shadow-sm bg-white">
//           <h3 className="font-semibold text-lg">{cert.course}</h3>
//           <p>Issued by: {cert.issuer}</p>
//           <button
//             className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
//             onClick={() => fetchBlockchainData(cert._id, cert.certHash)}
//             disabled={loadingChain[cert._id]}
//           >
//             {loadingChain[cert._id] ? "Fetching blockchain..." : "Show blockchain details"}
//           </button>

//           {blockchainData[cert._id] && (
//             <div className="mt-2 text-sm space-y-1">
//               <p><span className="font-medium">Certificate Hash:</span> {blockchainData[cert._id]?.certHash}</p>
//               <p><span className="font-medium">Course Hash:</span> {blockchainData[cert._id]?.courseHash}</p>
//               <p><span className="font-medium">Issuer Hash:</span> {blockchainData[cert._id]?.issuerHash}</p>
//               <p><span className="font-medium">Issued On:</span> {new Date((blockchainData[cert._id]?.issuedOn || 0) * 1000).toLocaleDateString()}</p>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }
