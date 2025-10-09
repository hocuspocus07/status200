// src/lib/server/blockchain.ts
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// Private RPC key (do NOT expose to frontend)
const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;



const abiPath = path.join(process.cwd(),"src","lib","server", "contractAbi.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

interface CertificateData {
  learnerIdHash: string;
  certUrl: string;
  courseName: string;
  issuingBody: string;
  issuedOn: number; // Timestamp
}



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


export async function addCertificateToBlockchain({
  learnerIdHash,
  certUrl,
  courseName,
  issuingBody,
  issuedOn,
}: CertificateData) {
  try {
    // Hash certificate info
    const certHash = ethers.keccak256(ethers.toUtf8Bytes(certUrl));
    const courseIdHash = ethers.keccak256(ethers.toUtf8Bytes(courseName));
    const issuerIdHash = ethers.keccak256(ethers.toUtf8Bytes(issuingBody));

    // Call smart contract
    const tx = await contract.addCertificate(
      learnerIdHash,
      certHash,
      courseIdHash,
      issuerIdHash,
      issuedOn
    );

    const receipt = await tx.wait();
    console.log("Blockchain tx receipt:", receipt);
    
    // Return the transaction hash and other data
    return { success: true, txHash: receipt.hash, certHash };
  } catch (error: any) {
    console.error("Blockchain helper error:", error);
    return { success: false, error: error.message };
  }
}