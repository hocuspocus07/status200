// app/api/blockchain/add-certificate/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

// Load ABI
const abiPath = path.join(process.cwd(), "contractAbi.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Ethers setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi, wallet);

interface BlockchainRequestBody {
  certUrl: string;      // Cloudinary PDF/Certificate URL
  courseName: string;
  issuingBody: string;
  issuedOn: number;     // Timestamp
}

export async function POST(req: NextRequest) {
  try {
    const body: BlockchainRequestBody = await req.json();

    // Extract learnerIdHash from JWT
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized: no token" }, { status: 401 });

    let learnerIdHash: string;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      learnerIdHash = decoded.learnerIdHash; // Stored in JWT
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Hash certificate info
    const certHash = ethers.keccak256(ethers.toUtf8Bytes(body.certUrl));
    const courseIdHash = ethers.keccak256(ethers.toUtf8Bytes(body.courseName));
    const issuerIdHash = ethers.keccak256(ethers.toUtf8Bytes(body.issuingBody));

    // Call smart contract
    const tx = await contract.addCertificate(
      learnerIdHash,
      certHash,
      courseIdHash,
      issuerIdHash,
      body.issuedOn
    );

    const receipt = await tx.wait();

    return NextResponse.json({
      message: "Certificate added to blockchain",
      txHash: receipt.transactionHash,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Blockchain API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
