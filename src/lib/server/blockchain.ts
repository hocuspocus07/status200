// src/lib/server/blockchain.ts
import { ethers } from "ethers";

// Private RPC key (do NOT expose to frontend)
const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = "0x5F0893E3D0BF816D3AEd212217fa7BDc7330C92A";

// ✅ Initialize provider and contract (server-side only)
const provider = new ethers.JsonRpcProvider(RPC_URL);

const contractAbi = [
  {
    inputs: [
      { internalType: "bytes32", name: "learnerIdHash", type: "bytes32" },
      { internalType: "bytes32", name: "certHash", type: "bytes32" },
    ],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bytes32", name: "", type: "bytes32" },
      { internalType: "bytes32", name: "", type: "bytes32" },
      { internalType: "bytes32", name: "", type: "bytes32" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider);

export async function verifyCertificateServer(learnerIdHash: string, certHash: string) {
  try {
    const learner = learnerIdHash.startsWith("0x") ? learnerIdHash : "0x" + learnerIdHash;
    const cert = certHash.startsWith("0x") ? certHash : "0x" + certHash;

    const result = await contract.verifyCertificate(learner, cert);

    return {
      certHash: result[0],
      courseHash: result[1],
      issuerHash: result[2],
      issuedOn: Number(result[3]),
    };
  } catch (err: any) {
    console.error("Blockchain verify error:", err);
    throw new Error(err?.message || "Verification failed");
  }
}
