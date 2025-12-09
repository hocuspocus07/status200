import { NextRequest, NextResponse } from "next/server";
import user from "@/models/user"; 

export async function POST(req: NextRequest) {
    const { userId, planId, planName, amount } = await req.json(); 

    if (!userId) {
        return NextResponse.json({ error: "Missing user ID in request body" }, { status: 400 });
    }

    try {
        const updatedUser = await user.findOneAndUpdate(
            { _id: userId },
            { 
                isPremium: true,
            },
            { new: true } 
        );

        if (!updatedUser) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: `User subscription upgraded to ${planName}`, 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Upgrade to premium error:", error);
        return NextResponse.json({ error: "Failed to upgrade to premium" }, { status: 500 });
    }
}