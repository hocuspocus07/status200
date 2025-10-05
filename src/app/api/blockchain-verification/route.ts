import { NextResponse } from "next/server";
import { verifyCertificateServer } from "@lib/server/blockchain";

export async function POST(req: Request) {
    try {
        const { learnerIdHash, certHash } = await req.json();

        if (!learnerIdHash || !certHash) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const data = await verifyCertificateServer(learnerIdHash, certHash);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("API Error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
