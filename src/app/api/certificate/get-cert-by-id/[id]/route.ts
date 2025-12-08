import { NextResponse, NextRequest } from "next/server";
import user from "@/models/user";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const certId = id;

        const userData = await user.findOne({ "certificates._id": certId });
        const cert = userData?.certificates.find(
            (c: any) => c._id.toString() === certId
        );

        return NextResponse.json(cert);
    } catch {
        return NextResponse.json(
            { message: "Error fetching certificate" },
            { status: 500 }
        );
    }
}