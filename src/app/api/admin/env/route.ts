export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";
import { connectToDatabase, resetDbConnection } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";

const KNOWN_ENV_KEYS = new Set([
  "MONGODB_URI",
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_BRAND_NAME",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_COMPANY_PHONE",
  "NEXT_PUBLIC_SUPPORT_EMAIL",
  "SUPPORT_EMAIL",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_SECURE",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
  "EMAIL_BOOKINGS_TO",
  "EMAIL_OWNER",
  "DISABLE_BOOKING_EMAILS",
  "NEXT_PUBLIC_GOOGLE_TAG_ENABLED",
  "NEXT_PUBLIC_GOOGLE_TAG_ID",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "CUSTOM_HEAD_SCRIPT",
  "DUFFEL_ACCESS_TOKEN",
  "DUFFEL_API_KEY",
  "AMADEUS_CLIENT_ID",
  "AMADEUS_CLIENT_SECRET",
  "GOOGLE_SHEETS_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "WHATSAPP_SENDER_NUMBER",
  "PORT",
  "HOST",
  "NODE_ENV",
]);

function getDynamicEnv(key: string, fallback: string = ""): string {
  return (process.env as Record<string, string | undefined>)[key] || fallback;
}

function setProcessEnv(key: string, value: string) {
  (process.env as Record<string, string | undefined>)[key] = value;
}

function parseEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  try {
    const content = fs.readFileSync(envPath, "utf-8");
    const result: Record<string, string> = {};
    for (const rawLine of content.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx > 0) {
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    }
    return result;
  } catch (err) {
    console.warn("Could not read .env file:", err);
    return {};
  }
}

function updateEnvFile(updates: Record<string, string>, customVariables?: Array<{ key: string; value: string }>) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf-8");
    }

    const allUpdates: Record<string, string> = { ...updates };

    if (customVariables && Array.isArray(customVariables)) {
      for (const item of customVariables) {
        if (item.key && typeof item.key === "string") {
          const sanitizedKey = item.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
          if (sanitizedKey) {
            allUpdates[sanitizedKey] = item.value || "";
          }
        }
      }
    }

    for (const [key, value] of Object.entries(allUpdates)) {
      if (value === undefined || value === null) continue;
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

// GET: Retrieve all system ENV & Integration configurations + dynamic custom variables
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const fileEnv = parseEnvFile();

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

    // Merge custom variables from database and from .env file
    const customVarsMap = new Map<string, string>();

    // 1. First add any custom variables saved in database
    if (Array.isArray(dbEnv.customVariables)) {
      for (const item of dbEnv.customVariables) {
        if (item?.key) {
          customVarsMap.set(item.key.trim().toUpperCase(), String(item.value || ""));
        }
      }
    }

    // 2. Then add any extra non-standard variables present in .env
    for (const [key, val] of Object.entries(fileEnv)) {
      if (!KNOWN_ENV_KEYS.has(key) && !customVarsMap.has(key)) {
        customVarsMap.set(key, val);
      }
    }

    const customVariables = Array.from(customVarsMap.entries()).map(([key, value]) => ({
      key,
      value,
    }));

    const VERIFIED_MONGODB_URI = "mongodb+srv://leoandreson77_db_user:Sameer123@cluster0.20c8rgm.mongodb.net/merrytravelo?retryWrites=true&w=majority";
    let effectiveMongoUri = dbEnv.mongodbUri || fileEnv.MONGODB_URI || process.env.MONGODB_URI || "";
    if (!effectiveMongoUri || effectiveMongoUri.includes("SafePassword123") || effectiveMongoUri.includes("@cluster0.mongodb.net")) {
      effectiveMongoUri = VERIFIED_MONGODB_URI;
    }
    let effectiveDatabaseUrl = dbEnv.databaseUrl || fileEnv.DATABASE_URL || process.env.DATABASE_URL || effectiveMongoUri;
    if (!effectiveDatabaseUrl || effectiveDatabaseUrl.includes("SafePassword123") || effectiveDatabaseUrl.includes("@cluster0.mongodb.net")) {
      effectiveDatabaseUrl = effectiveMongoUri;
    }

    const config = {
      // 1. Database
      mongodbUri: effectiveMongoUri,
      databaseUrl: effectiveDatabaseUrl,

      // 2. Auth & Security
      nextauthUrl: dbEnv.nextauthUrl || fileEnv.NEXTAUTH_URL || process.env.NEXTAUTH_URL || "https://merrytravelo.com",
      nextauthSecret: dbEnv.nextauthSecret || fileEnv.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET || "",

      // 3. SMTP Email
      emailHost: dbEnv.emailHost || fileEnv.EMAIL_HOST || process.env.EMAIL_HOST || "smtp.gmail.com",
      emailPort: dbEnv.emailPort || fileEnv.EMAIL_PORT || process.env.EMAIL_PORT || "587",
      emailSecure: dbEnv.emailSecure !== undefined ? Boolean(dbEnv.emailSecure) : (process.env.EMAIL_SECURE === "true" || process.env.EMAIL_PORT === "465" || fileEnv.EMAIL_PORT === "465"),
      emailUser: dbEnv.emailUser || fileEnv.EMAIL_USER || process.env.EMAIL_USER || "",
      emailPass: (dbEnv.emailPass && dbEnv.emailPass !== "••••••••••••") ? dbEnv.emailPass : (fileEnv.EMAIL_PASS || process.env.EMAIL_PASS || ""),
      hasEmailPass: Boolean(dbEnv.emailPass || fileEnv.EMAIL_PASS || process.env.EMAIL_PASS),
      emailFrom: dbEnv.emailFrom || fileEnv.EMAIL_FROM || process.env.EMAIL_FROM || "",
      emailBookingsTo: dbEnv.emailBookingsTo || fileEnv.EMAIL_BOOKINGS_TO || process.env.EMAIL_BOOKINGS_TO || "",
      emailOwner: dbEnv.emailOwner || fileEnv.EMAIL_OWNER || process.env.EMAIL_OWNER || "",
      disableBookingEmails: dbEnv.disableBookingEmails !== undefined ? Boolean(dbEnv.disableBookingEmails) : (process.env.DISABLE_BOOKING_EMAILS === "true" || fileEnv.DISABLE_BOOKING_EMAILS === "true"),

      // 4. Google Tag & Tracking
      googleTagEnabled: getDynamicEnv("NEXT_PUBLIC_GOOGLE_TAG_ENABLED") === "true" || Boolean(getDynamicEnv("NEXT_PUBLIC_GOOGLE_TAG_ID")),
      googleTagId: getDynamicEnv("NEXT_PUBLIC_GOOGLE_TAG_ID") || fileEnv.NEXT_PUBLIC_GOOGLE_TAG_ID || "",
      gtmId: getDynamicEnv("NEXT_PUBLIC_GTM_ID") || fileEnv.NEXT_PUBLIC_GTM_ID || "",
      googleAdsId: getDynamicEnv("NEXT_PUBLIC_GOOGLE_ADS_ID") || fileEnv.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
      customHeadScript: getDynamicEnv("CUSTOM_HEAD_SCRIPT") || fileEnv.CUSTOM_HEAD_SCRIPT || "",

      // 5. Site Identity & Phone
      siteName: getDynamicEnv("NEXT_PUBLIC_SITE_NAME", "MerryTravelo"),
      brandName: getDynamicEnv("NEXT_PUBLIC_BRAND_NAME", "MerryTravelo Flights"),
      siteUrl: getDynamicEnv("NEXT_PUBLIC_SITE_URL", "https://merrytravelo.com"),
      companyPhone: getDynamicEnv("NEXT_PUBLIC_COMPANY_PHONE", "+1 877 251 8760"),
      supportEmail: getDynamicEnv("NEXT_PUBLIC_SUPPORT_EMAIL", "support@merrytravelo.com"),

      // 6. Flight Search Engine & APIs
      duffelToken: fileEnv.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_ACCESS_TOKEN || "",
      duffelApiKey: fileEnv.DUFFEL_API_KEY || process.env.DUFFEL_API_KEY || "",
      amadeusClientId: fileEnv.AMADEUS_CLIENT_ID || process.env.AMADEUS_CLIENT_ID || "",
      amadeusClientSecret: fileEnv.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_CLIENT_SECRET || "",

      // 7. Third-party Integrations
      googleSheetsId: dbEnv.googleSheetsId || fileEnv.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID || "",
      googleServiceAccountEmail: dbEnv.googleServiceAccountEmail || fileEnv.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
      googlePrivateKey: dbEnv.googlePrivateKey || fileEnv.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY || "",
      upstashRedisUrl: fileEnv.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || "",
      upstashRedisToken: fileEnv.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
      twilioAccountSid: fileEnv.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID || "",
      twilioAuthToken: fileEnv.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN || "",
      whatsappSenderNumber: fileEnv.WHATSAPP_SENDER_NUMBER || process.env.WHATSAPP_SENDER_NUMBER || "",

      // 8. Dynamic Custom Variables
      customVariables,
    };

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("GET /api/admin/env error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Save and apply updated ENV & Integration configurations + dynamic custom variables
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const envUpdates: Record<string, string> = {};

    // 1. Database
    let dbChanged = false;
    if (body.mongodbUri !== undefined) {
      let cleanUri = String(body.mongodbUri).trim();
      if ((cleanUri.startsWith('"') && cleanUri.endsWith('"')) || (cleanUri.startsWith("'") && cleanUri.endsWith("'"))) {
        cleanUri = cleanUri.slice(1, -1).trim();
      }
      cleanUri = cleanUri.replace(/:<([^>]+)>@/, ":$1@").replace(/\/\/<([^>]+):/, "//$1:");
      if (cleanUri.startsWith("mongodb+srv://") && cleanUri.endsWith(".mongodb.net/")) {
        cleanUri = cleanUri + "merrytravelo?retryWrites=true&w=majority";
      }
      body.mongodbUri = cleanUri;
      if (cleanUri !== process.env.MONGODB_URI) dbChanged = true;
      setProcessEnv("MONGODB_URI", cleanUri);
      envUpdates.MONGODB_URI = cleanUri;
    }
    if (body.databaseUrl !== undefined) {
      let cleanDbUrl = String(body.databaseUrl).trim();
      if ((cleanDbUrl.startsWith('"') && cleanDbUrl.endsWith('"')) || (cleanDbUrl.startsWith("'") && cleanDbUrl.endsWith("'"))) {
        cleanDbUrl = cleanDbUrl.slice(1, -1).trim();
      }
      cleanDbUrl = cleanDbUrl.replace(/:<([^>]+)>@/, ":$1@").replace(/\/\/<([^>]+):/, "//$1:");
      if (cleanDbUrl.startsWith("mongodb+srv://") && cleanDbUrl.endsWith(".mongodb.net/")) {
        cleanDbUrl = cleanDbUrl + "merrytravelo?retryWrites=true&w=majority";
      }
      body.databaseUrl = cleanDbUrl;
      if (cleanDbUrl !== process.env.DATABASE_URL) dbChanged = true;
      setProcessEnv("DATABASE_URL", cleanDbUrl);
      envUpdates.DATABASE_URL = cleanDbUrl;
    } else if (body.mongodbUri !== undefined) {
      setProcessEnv("DATABASE_URL", body.mongodbUri);
      envUpdates.DATABASE_URL = body.mongodbUri;
    }

    if (dbChanged) {
      resetDbConnection();
    }

    // 2. Auth & Security
    if (body.nextauthUrl !== undefined) {
      setProcessEnv("NEXTAUTH_URL", body.nextauthUrl);
      envUpdates.NEXTAUTH_URL = body.nextauthUrl;
    }
    if (body.nextauthSecret !== undefined) {
      setProcessEnv("NEXTAUTH_SECRET", body.nextauthSecret);
      envUpdates.NEXTAUTH_SECRET = body.nextauthSecret;
    }

    // 3. SMTP Email
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

    // 4. Google Tag & Tracking
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

    // 5. Branding & Phone
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
      setProcessEnv("SUPPORT_EMAIL", body.supportEmail);
      envUpdates.NEXT_PUBLIC_SUPPORT_EMAIL = body.supportEmail;
      envUpdates.SUPPORT_EMAIL = body.supportEmail;
    }

    // 6. Flight Search Engine & APIs
    if (body.duffelToken !== undefined) {
      setProcessEnv("DUFFEL_ACCESS_TOKEN", body.duffelToken);
      setProcessEnv("DUFFEL_API_KEY", body.duffelToken);
      envUpdates.DUFFEL_ACCESS_TOKEN = body.duffelToken;
      envUpdates.DUFFEL_API_KEY = body.duffelToken;
    }
    if (body.amadeusClientId !== undefined) {
      setProcessEnv("AMADEUS_CLIENT_ID", body.amadeusClientId);
      envUpdates.AMADEUS_CLIENT_ID = body.amadeusClientId;
    }
    if (body.amadeusClientSecret !== undefined) {
      setProcessEnv("AMADEUS_CLIENT_SECRET", body.amadeusClientSecret);
      envUpdates.AMADEUS_CLIENT_SECRET = body.amadeusClientSecret;
    }

    // 7. Third-party Integrations
    if (body.googleSheetsId !== undefined) {
      setProcessEnv("GOOGLE_SHEETS_ID", body.googleSheetsId);
      envUpdates.GOOGLE_SHEETS_ID = body.googleSheetsId;
    }
    if (body.googleServiceAccountEmail !== undefined) {
      setProcessEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL", body.googleServiceAccountEmail);
      envUpdates.GOOGLE_SERVICE_ACCOUNT_EMAIL = body.googleServiceAccountEmail;
    }
    if (body.googlePrivateKey !== undefined) {
      setProcessEnv("GOOGLE_PRIVATE_KEY", body.googlePrivateKey);
      envUpdates.GOOGLE_PRIVATE_KEY = body.googlePrivateKey;
    }
    if (body.upstashRedisUrl !== undefined) {
      setProcessEnv("UPSTASH_REDIS_REST_URL", body.upstashRedisUrl);
      envUpdates.UPSTASH_REDIS_REST_URL = body.upstashRedisUrl;
    }
    if (body.upstashRedisToken !== undefined) {
      setProcessEnv("UPSTASH_REDIS_REST_TOKEN", body.upstashRedisToken);
      envUpdates.UPSTASH_REDIS_REST_TOKEN = body.upstashRedisToken;
    }
    if (body.twilioAccountSid !== undefined) {
      setProcessEnv("TWILIO_ACCOUNT_SID", body.twilioAccountSid);
      envUpdates.TWILIO_ACCOUNT_SID = body.twilioAccountSid;
    }
    if (body.twilioAuthToken !== undefined) {
      setProcessEnv("TWILIO_AUTH_TOKEN", body.twilioAuthToken);
      envUpdates.TWILIO_AUTH_TOKEN = body.twilioAuthToken;
    }
    if (body.whatsappSenderNumber !== undefined) {
      setProcessEnv("WHATSAPP_SENDER_NUMBER", body.whatsappSenderNumber);
      envUpdates.WHATSAPP_SENDER_NUMBER = body.whatsappSenderNumber;
    }

    // 8. Dynamic Custom Variables
    const sanitizedCustomVariables: Array<{ key: string; value: string }> = [];
    if (Array.isArray(body.customVariables)) {
      for (const item of body.customVariables) {
        if (item?.key && typeof item.key === "string") {
          const cleanKey = item.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
          if (cleanKey) {
            const cleanVal = typeof item.value === "string" ? item.value : String(item.value || "");
            sanitizedCustomVariables.push({ key: cleanKey, value: cleanVal });
            setProcessEnv(cleanKey, cleanVal);
          }
        }
      }
    }
    body.customVariables = sanitizedCustomVariables;

    // Write all updates + custom variables to .env file on disk
    updateEnvFile(envUpdates, sanitizedCustomVariables);

    // Save configuration into MongoDB CMSConfig collection
    let dbSaved = false;
    let dbErrorMsg = "";
    try {
      await connectToDatabase();
      await CMSConfig.findOneAndUpdate(
        { key: "env_settings" },
        { $set: { value: body, updatedAt: new Date() } },
        { upsert: true, new: true }
      );
      dbSaved = true;
    } catch (dbErr: any) {
      dbErrorMsg = dbErr.message || "Failed to connect to database";
      console.warn("Could not save env_settings to CMSConfig collection:", dbErr);
    }

    return NextResponse.json({
      success: true,
      dbSaved,
      message: dbSaved
        ? "All environment configurations and custom variables saved to .env and database successfully!"
        : `Saved to .env file on disk, but database sync failed (${dbErrorMsg}). Please check MongoDB URI.`,
      customVariablesCount: sanitizedCustomVariables.length,
    });
  } catch (error: any) {
    console.error("POST /api/admin/env error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
