export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { testEmailConfig, sendMailWithFallback } from "@/lib/email";
import { connectToDatabase } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const testRecipient = body.to || body.user || process.env.EMAIL_USER;

    let activePass = (body.pass && body.pass !== "••••••••••••") ? body.pass : process.env.EMAIL_PASS;
    
    // If password is blank or masked, check database CMSConfig
    if (!activePass || activePass === "••••••••••••") {
      try {
        await connectToDatabase();
        const doc = await CMSConfig.findOne({ key: "env_settings" }).lean();
        if (doc?.value?.emailPass && doc.value.emailPass !== "••••••••••••") {
          activePass = doc.value.emailPass;
        }
      } catch (dbErr) {
        console.warn("Could not retrieve emailPass from CMSConfig:", dbErr);
      }
    }

    const cleanPass = activePass ? String(activePass).replace(/\s+/g, "") : "";

    const customConfig = body.host && body.user ? {
      host: body.host,
      port: parseInt(String(body.port || "587"), 10),
      secure: body.secure === true || body.port === 465 || body.port === "465",
      user: body.user,
      pass: cleanPass,
      from: body.from || process.env.EMAIL_FROM || `JetWithFly Flights <${body.user}>`,
    } : undefined;

    // 1. Verify connection credentials
    await testEmailConfig(customConfig);

    // 2. Dispatch actual test email using the same verified credentials
    if (testRecipient && body.sendActualMail !== false) {
      const activeHost = customConfig?.host || process.env.EMAIL_HOST || "smtp.gmail.com";
      const activePort = customConfig?.port || process.env.EMAIL_PORT || 587;
      const activeUser = customConfig?.user || process.env.EMAIL_USER || "support@jetwithfly.com";

      const info = await sendMailWithFallback({
        to: testRecipient,
        subject: `🧪 Test Email from ${process.env.NEXT_PUBLIC_BRAND_NAME || "JetWithFly Flights"}`,
        html: `
          <div style="font-family:sans-serif; padding:24px; background:#f8fafc; border-radius:12px; max-width:600px; margin:0 auto; border:1px solid #e2e8f0;">
            <div style="background:#2563eb; color:#ffffff; padding:16px 20px; border-radius:8px; margin-bottom:20px;">
              <h2 style="margin:0; font-size:20px;">🎉 SMTP Configuration Verified!</h2>
              <p style="margin:4px 0 0; opacity:0.9; font-size:13px;">Your backend email settings are working properly.</p>
            </div>
            <p style="color:#334155; font-size:14px; line-height:1.5;">This email confirms that your outgoing mail server is connected and delivering emails successfully.</p>
            <ul style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px 24px; color:#475569; font-size:13px; line-height:1.8;">
              <li><strong>SMTP Host:</strong> ${activeHost}</li>
              <li><strong>SMTP Port:</strong> ${activePort}</li>
              <li><strong>Sender User:</strong> ${activeUser}</li>
              <li><strong>Delivered To:</strong> ${testRecipient}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
            <p style="color:#94a3b8; font-size:11px; margin-top:20px; text-align:center;">JetWithFly Flights automated email verification system.</p>
          </div>
        `,
        text: `SMTP Configuration Verified! Outgoing emails are working properly on ${activeHost}:${activePort} for ${activeUser}.`,
      }, customConfig);

      return NextResponse.json({
        success: true,
        message: `Verification successful! Test email delivered to ${testRecipient}. (Message ID: ${info.messageId})`,
        messageId: info.messageId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "SMTP connection verified successfully!",
    });
  } catch (error: any) {
    let message = error.message || "Failed to verify SMTP settings";

    if (message.includes("535") || message.includes("BadCredentials") || message.includes("Username and Password not accepted")) {
      message = "Invalid login credentials (535 BadCredentials). Please ensure you are using a 16-character Google App Password (not your normal account password) and that 2-Step Verification is active.";
    }

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
