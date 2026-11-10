export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";

function getDynamicEnv(key: string, fallback: string = ""): string {
  return (process.env as Record<string, string | undefined>)[key] || fallback;
}

function setProcessEnv(key: string, value: string) {
  (process.env as Record<string, string | undefined>)[key] = value;
}

function updateEnvFile(updates: Record<string, string>) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf-8");
    }

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null) continue;
      // Skip placeholder passwords
      if (key === "EMAIL_PASS" && value === "••••••••••••") continue;

      const escapedValue = String(value).replace(/"/g, '\\"');
      const formattedLine = `${key}="${escapedValue}"`;
      const regex = new RegExp(`^${key}=.*$`, "m");

      if (regex.test(content)) {
        content = content.replace(regex, formattedLine);
      } else {
        content += (content.endsWith("\n") || content.length === 0 ? "" : "\n") + formattedLine + "\n";
      }
    }

    fs.writeFileSync(envPath, content, "utf-8");
  } catch (err) {
    console.warn("Could not write directly to .env file:", err);
  }
}

// GET: Retrieve current system ENV & Integration configurations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let dbEnv: Record<string, any> = {};
    try {
      await connectToDatabase();
      const doc = await CMSConfig.findOne({ key: "env_settings" }).lean();
      if (doc?.value && typeof doc.value === "object") {
        dbEnv = doc.value;
      }
    } catch (err) {
      console.warn("Could not load env_settings from database:", err);
    }

    const config = {
      // SMTP Email
      emailHost: dbEnv.emailHost || process.env.EMAIL_HOST || "smtp.gmail.com",
      emailPort: dbEnv.emailPort || process.env.EMAIL_PORT || "587",
      emailSecure: dbEnv.emailSecure !== undefined ? Boolean(dbEnv.emailSecure) : (process.env.EMAIL_SECURE === "true" || process.env.EMAIL_PORT === "465"),
      emailUser: dbEnv.emailUser || process.env.EMAIL_USER || "",
      emailPass: (dbEnv.emailPass && dbEnv.emailPass !== "••••••••••••") || process.env.EMAIL_PASS ? "••••••••••••" : "",
      hasEmailPass: Boolean(dbEnv.emailPass || process.env.EMAIL_PASS),
      emailFrom: dbEnv.emailFrom || process.env.EMAIL_FROM || "",
      emailBookingsTo: dbEnv.emailBookingsTo || process.env.EMAIL_BOOKINGS_TO || "",
      emailOwner: dbEnv.emailOwner || process.env.EMAIL_OWNER || "",
      disableBookingEmails: dbEnv.disableBookingEmails !== undefined ? Boolean(dbEnv.disableBookingEmails) : (process.env.DISABLE_BOOKING_EMAILS === "true"),

      // Google Tag & Tracking
      googleTagEnabled: getDynamicEnv("NEXT_PUBLIC_GOOGLE_TAG_ENABLED") === "true" || Boolean(getDynamicEnv("NEXT_PUBLIC_GOOGLE_TAG_ID")),
      googleTagId: getDynamicEnv("NEXT_PUBLIC_GOOGLE_TAG_ID"),
      gtmId: getDynamicEnv("NEXT_PUBLIC_GTM_ID"),
      googleAdsId: getDynamicEnv("NEXT_PUBLIC_GOOGLE_ADS_ID"),
      customHeadScript: getDynamicEnv("CUSTOM_HEAD_SCRIPT"),

      // Site Identity & Phone
      siteName: getDynamicEnv("NEXT_PUBLIC_SITE_NAME", "JetWithFly"),
      brandName: getDynamicEnv("NEXT_PUBLIC_BRAND_NAME", "JetWithFly Flights"),
      siteUrl: getDynamicEnv("NEXT_PUBLIC_SITE_URL", "https://jetwithfly.com"),
      companyPhone: getDynamicEnv("NEXT_PUBLIC_COMPANY_PHONE", "+1 877 371 7356"),
      supportEmail: getDynamicEnv("NEXT_PUBLIC_SUPPORT_EMAIL", "support@jetwithfly.com"),

      // APIs & Keys
      duffelToken: process.env.DUFFEL_ACCESS_TOKEN || "",
      amadeusClientId: process.env.AMADEUS_CLIENT_ID || "",
      amadeusClientSecret: process.env.AMADEUS_CLIENT_SECRET || "",
      googleSheetsId: process.env.GOOGLE_SHEETS_ID || "",
    };

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("GET /api/admin/env error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Save and apply updated ENV & Integration configurations
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const envUpdates: Record<string, string> = {};

    // 1. SMTP Email
    if (body.emailHost !== undefined) {
      setProcessEnv("EMAIL_HOST", body.emailHost);
      envUpdates.EMAIL_HOST = body.emailHost;
    }
    if (body.emailPort !== undefined) {
      setProcessEnv("EMAIL_PORT", String(body.emailPort));
      envUpdates.EMAIL_PORT = String(body.emailPort);
    }
    if (body.emailSecure !== undefined) {
      setProcessEnv("EMAIL_SECURE", String(body.emailSecure));
      envUpdates.EMAIL_SECURE = String(body.emailSecure);
    }
    if (body.emailUser !== undefined) {
      setProcessEnv("EMAIL_USER", body.emailUser);
      envUpdates.EMAIL_USER = body.emailUser;
    }
    if (body.emailPass && body.emailPass !== "••••••••••••") {
      setProcessEnv("EMAIL_PASS", body.emailPass);
      envUpdates.EMAIL_PASS = body.emailPass;
    } else {
      // Preserve existing password from database or process.env
      try {
        await connectToDatabase();
        const existing = await CMSConfig.findOne({ key: "env_settings" }).lean();
        if (existing?.value?.emailPass && existing.value.emailPass !== "••••••••••••") {
          body.emailPass = existing.value.emailPass;
        } else if (process.env.EMAIL_PASS) {
          body.emailPass = process.env.EMAIL_PASS;
        }
      } catch {}
    }
    if (body.emailFrom !== undefined) {
      setProcessEnv("EMAIL_FROM", body.emailFrom);
      envUpdates.EMAIL_FROM = body.emailFrom;
    }
    if (body.emailBookingsTo !== undefined) {
      setProcessEnv("EMAIL_BOOKINGS_TO", body.emailBookingsTo);
      envUpdates.EMAIL_BOOKINGS_TO = body.emailBookingsTo;
    }
    if (body.emailOwner !== undefined) {
      setProcessEnv("EMAIL_OWNER", body.emailOwner);
      envUpdates.EMAIL_OWNER = body.emailOwner;
    }
    if (body.disableBookingEmails !== undefined) {
      setProcessEnv("DISABLE_BOOKING_EMAILS", String(body.disableBookingEmails));
      envUpdates.DISABLE_BOOKING_EMAILS = String(body.disableBookingEmails);
    }

    // 2. Google Tag & Tracking
    if (body.googleTagEnabled !== undefined) {
      setProcessEnv("NEXT_PUBLIC_GOOGLE_TAG_ENABLED", String(body.googleTagEnabled));
      envUpdates.NEXT_PUBLIC_GOOGLE_TAG_ENABLED = String(body.googleTagEnabled);
    }
    if (body.googleTagId !== undefined) {
      setProcessEnv("NEXT_PUBLIC_GOOGLE_TAG_ID", body.googleTagId);
      envUpdates.NEXT_PUBLIC_GOOGLE_TAG_ID = body.googleTagId;
    }
    if (body.gtmId !== undefined) {
      setProcessEnv("NEXT_PUBLIC_GTM_ID", body.gtmId);
      envUpdates.NEXT_PUBLIC_GTM_ID = body.gtmId;
    }
    if (body.googleAdsId !== undefined) {
      setProcessEnv("NEXT_PUBLIC_GOOGLE_ADS_ID", body.googleAdsId);
      envUpdates.NEXT_PUBLIC_GOOGLE_ADS_ID = body.googleAdsId;
    }
    if (body.customHeadScript !== undefined) {
      setProcessEnv("CUSTOM_HEAD_SCRIPT", body.customHeadScript);
      envUpdates.CUSTOM_HEAD_SCRIPT = body.customHeadScript;
    }

    // 3. Branding & Phone
    if (body.siteName !== undefined) {
      setProcessEnv("NEXT_PUBLIC_SITE_NAME", body.siteName);
      envUpdates.NEXT_PUBLIC_SITE_NAME = body.siteName;
    }
    if (body.brandName !== undefined) {
      setProcessEnv("NEXT_PUBLIC_BRAND_NAME", body.brandName);
      envUpdates.NEXT_PUBLIC_BRAND_NAME = body.brandName;
    }
    if (body.siteUrl !== undefined) {
      setProcessEnv("NEXT_PUBLIC_SITE_URL", body.siteUrl);
      envUpdates.NEXT_PUBLIC_SITE_URL = body.siteUrl;
    }
    if (body.companyPhone !== undefined) {
      setProcessEnv("NEXT_PUBLIC_COMPANY_PHONE", body.companyPhone);
      envUpdates.NEXT_PUBLIC_COMPANY_PHONE = body.companyPhone;
    }
    if (body.supportEmail !== undefined) {
      setProcessEnv("NEXT_PUBLIC_SUPPORT_EMAIL", body.supportEmail);
      envUpdates.NEXT_PUBLIC_SUPPORT_EMAIL = body.supportEmail;
    }

    // 4. APIs & Keys
    if (body.duffelToken !== undefined) {
      setProcessEnv("DUFFEL_ACCESS_TOKEN", body.duffelToken);
      envUpdates.DUFFEL_ACCESS_TOKEN = body.duffelToken;
    }
    if (body.amadeusClientId !== undefined) {
      setProcessEnv("AMADEUS_CLIENT_ID", body.amadeusClientId);
      envUpdates.AMADEUS_CLIENT_ID = body.amadeusClientId;
    }
    if (body.amadeusClientSecret !== undefined) {
      setProcessEnv("AMADEUS_CLIENT_SECRET", body.amadeusClientSecret);
      envUpdates.AMADEUS_CLIENT_SECRET = body.amadeusClientSecret;
    }
    if (body.googleSheetsId !== undefined) {
      setProcessEnv("GOOGLE_SHEETS_ID", body.googleSheetsId);
      envUpdates.GOOGLE_SHEETS_ID = body.googleSheetsId;
    }

    // Write to .env file on disk
    updateEnvFile(envUpdates);

    // Save to CMSConfig in database (non-blocking)
    try {
      await connectToDatabase();
      await CMSConfig.findOneAndUpdate(
        { key: "env_settings" },
        { $set: { value: body, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn("Could not save env_settings to CMSConfig collection:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Environment and tracking configurations saved and applied successfully!",
    });
  } catch (error: any) {
    console.error("POST /api/admin/env error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
