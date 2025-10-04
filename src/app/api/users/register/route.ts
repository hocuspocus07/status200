import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, password} = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate UUID for learnerId
    const uuid = uuidv4();

    // Compute keccak256 hash for blockchain learnerId
    const learnerIdHash = ethers.keccak256(ethers.toUtf8Bytes(uuid));
    console.log("Generated learnerId (UUID):", uuid);
    console.log("Computed learnerId (keccak256):", learnerIdHash);

    const user = await User.create({
      name,
      email,
      password_hash,
      learnerId: uuid,
      blockchainId: learnerIdHash
    });
  const token = jwt.sign({ id: user._id, email: user.emaillearnerIdHash, learnerIdHash: user.learnerIdHash}, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    }, { status: 201 });

  } catch (error: unknown) {
    if(error instanceof Error){
      console.error("Register error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
