import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // AL AYAAN ANSARI | Roll NO. 23BCS034
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Missing token" }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY is not defined");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    // Verify with Google
    const googleRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const googleData = await googleRes.json();

    if (googleData.success) {
      return NextResponse.json({ success: true, message: "Verified" }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Verification failed" }, { status: 400 });
    }

  } catch (error) {
    console.error("Captcha Error:", error);
    return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
  }
}