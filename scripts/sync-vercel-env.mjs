#!/usr/bin/env node
/**
 * Sync local .env variables directly to Vercel Project Environment Variables.
 * Also removes any old GTM / Google Tag / Google Ads env keys from Vercel.
 *
 * Usage:
 *   VERCEL_TOKEN="your_vercel_token" VERCEL_PROJECT="merrytrevalo" npm run vercel:env
 *
 * Optional:
 *   VERCEL_TEAM_ID="team_xxx"        (if project belongs to a Vercel Team)
 *   VERCEL_SITE_URL="https://merrytrevalo.vercel.app"
 *
 * Create a Vercel Token in 10 seconds: https://vercel.com/account/tokens
 */

import fs from "fs";
import path from "path";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN?.trim();
const VERCEL_PROJECT = (process.env.VERCEL_PROJECT || "merrytrevalo").trim();
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID?.trim();
const VERCEL_SITE_URL = (process.env.VERCEL_SITE_URL || "https://merrytrevalo.vercel.app").trim();

const SKIP_KEYS = new Set([
  "NODE_ENV",
  "PORT",
  "HOST",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT",
  "VERCEL_TEAM_ID",
  "VERCEL_SITE_URL",
]);

const DELETE_KEYS = [
  "NEXT_PUBLIC_GOOGLE_TAG_ENABLED",
  "NEXT_PUBLIC_GOOGLE_TAG_ID",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`.env file not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const result = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!key || SKIP_KEYS.has(key) || DELETE_KEYS.includes(key)) continue;
    result[key] = value;
  }

  // Ensure production Vercel URLs & isolated merrytravelo DB
  result.NEXTAUTH_URL = VERCEL_SITE_URL;
  result.NEXT_PUBLIC_SITE_URL = VERCEL_SITE_URL;
  if (result.MONGODB_URI) {
    result.MONGODB_URI = result.MONGODB_URI.replace(/\/jetwithfly(\?|$)/i, "/merrytravelo$1");
  }
  if (result.DATABASE_URL) {
    result.DATABASE_URL = result.DATABASE_URL.replace(/\/jetwithfly(\?|$)/i, "/merrytravelo$1");
  }

  return result;
}

async function vercelFetch(endpoint, options = {}) {
  const separator = endpoint.includes("?") ? "&" : "?";
  const teamQuery = VERCEL_TEAM_ID ? `${separator}teamId=${encodeURIComponent(VERCEL_TEAM_ID)}` : "";
  const url = `https://api.vercel.com${endpoint}${teamQuery}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Vercel API ${res.status}: ${data?.error?.message || JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  if (!VERCEL_TOKEN) {
    console.error("❌ Missing VERCEL_TOKEN.");
    console.error('   Get one at: https://vercel.com/account/tokens');
    console.error('   Then run:   VERCEL_TOKEN="your_token" npm run vercel:env');
    process.exit(1);
  }

  const envPath = path.resolve(process.cwd(), ".env");
  const envMap = parseEnvFile(envPath);
  const entries = Object.entries(envMap).filter(([, val]) => val !== "");

  console.log(`🚀 Syncing ${entries.length} environment variables to Vercel project "${VERCEL_PROJECT}"...`);

  // 1. Delete legacy GTM / Google Ads variables if present in Vercel
  try {
    const existing = await vercelFetch(`/v9/projects/${encodeURIComponent(VERCEL_PROJECT)}/env`);
    for (const item of existing.envs || []) {
      if (DELETE_KEYS.includes(item.key)) {
        await vercelFetch(
          `/v9/projects/${encodeURIComponent(VERCEL_PROJECT)}/env/${encodeURIComponent(item.id)}`,
          { method: "DELETE" }
        );
        console.log(`🗑️  Removed legacy key: ${item.key}`);
      }
    }
  } catch (err) {
    console.warn(`⚠️  Could not clean legacy keys: ${err.message}`);
  }

  // 2. Upsert all .env variables to Production, Preview, and Development
  const payload = entries.map(([key, value]) => ({
    key,
    value,
    type: key.startsWith("NEXT_PUBLIC_") ? "plain" : "encrypted",
    target: ["production", "preview", "development"],
  }));

  await vercelFetch(
    `/v10/projects/${encodeURIComponent(VERCEL_PROJECT)}/env?upsert=true`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  for (const [key] of entries) {
    console.log(`✅ Synced: ${key}`);
  }

  console.log("\n🎉 All environment variables synced to Vercel!");
  console.log("👉 Trigger a Redeploy in Vercel Dashboard (or push any commit) for the new env vars to take effect.");
}

main().catch((err) => {
  console.error("❌ Sync failed:", err.message);
  process.exit(1);
});
