// /lib/getUserFromToken.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export type TokenPayload = {
  id: string;
  email: string;
  learnerIdHash?: string;
  isEmployee?: boolean;
  iat?: number;
  exp?: number;
};

export async function getUserFromToken(req: NextRequest): Promise<TokenPayload | null> {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
