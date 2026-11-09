export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { testEmailConfig, sendMailWithFallback } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const testRecipient = body.to || process.env.EMAIL_USER;

    const customConfig = body.host && body.user ? {
      host: body.host,
      port: parseInt(String(body.port || "587"), 10),
      secure: body.secure === true || body.port === 465 || body.port === "465",
      user: body.user,
      pass: body.pass || process.env.EMAIL_PASS,
    } : undefined;

    await testEmailConfig(customConfig);

    if (testRecipient && body.sendActualMail !== false) {
      const info = await sendMailWithFallback({
        to: testRecipient,
        subject: `🧪 Test Email from ${process.env.NEXT_PUBLIC_BRAND_NAME || "SkySwift Flights"}`,
        html: `
          <div style="font-family:sans-serif; padding:20px; background:#f8fafc; border-radius:12px;">
            <h2 style="color:#2563eb;">SMTP Configuration Verified!</h2>
            <p>Your backend email settings are working properly.</p>
            <ul>
              <li><strong>Host:</strong> ${process.env.EMAIL_HOST || "smtp.gmail.com"}</li>
              <li><strong>Port:</strong> ${process.env.EMAIL_PORT || "587"}</li>
              <li><strong>User:</strong> ${process.env.EMAIL_USER || "Not set"}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
        `,
        text: "SMTP Configuration Verified! Your backend email settings are working properly.",
      });

      return NextResponse.json({
        success: true,
        message: `Verification successful! Test email delivered to ${testRecipient}.`,
        messageId: info.messageId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "SMTP connection verified successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify SMTP settings" },
      { status: 500 }
    );
  }
}
