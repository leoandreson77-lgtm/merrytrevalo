import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";
import { TFN } from "@/models/TFN";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

const SETTINGS_KEY = "global_settings";

// GET: Fetch settings (public - used by frontend for call button)
export async function GET() {
  try {
    await connectToDatabase();
    
    const config = await CMSConfig.findOne({ key: SETTINGS_KEY });
    const rawEnvPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || "";
    const defaultPhone = rawEnvPhone && !rawEnvPhone.replace(/\D/g, "").includes("8555106415")
      ? rawEnvPhone
      : "+18772518760";

    const defaults = {
      callNumber: defaultPhone,
      callLabel: "Call Now",
    };
    const settingsValue: Record<string, any> = config?.value ? { ...defaults, ...config.value } : { ...defaults };

    // Google Ads and Tag Manager IDs
    settingsValue.googleTagId = "GTM-5T6F2H67";
    settingsValue.gtmId = "GTM-MM6FPFM5";
    settingsValue.googleAdsId = "AW-18576835283";
    settingsValue.googleAdsSendTo = "AW-18576835283/pdU-CKH4lbwdENOFkJpF";

    // If config has empty or stale phone, update to active TFN or default
    if (!settingsValue.callNumber || String(settingsValue.callNumber).replace(/\D/g, "").includes("8555106415") || String(settingsValue.callNumber).includes("855")) {
      const activeTfn = await TFN.findOne({ isDefault: true, status: "active" }) 
        || await TFN.findOne({ status: "active" });
      const candidate = activeTfn?.number || defaultPhone;
      settingsValue.callNumber = String(candidate).includes("855") ? defaultPhone : candidate;
    }

    if (String(settingsValue.callNumber).includes("855")) {
      settingsValue.callNumber = "+18772518760";
    }

    return NextResponse.json(settingsValue);
  } catch (error: any) {
    return NextResponse.json({
      callNumber: "+18772518760",
      callLabel: "Call Now",
      googleTagId: null,
      gtmId: null,
      googleAdsId: null,
      googleAdsSendTo: null,
    });
  }
}

// POST: Update settings (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const config = await CMSConfig.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { value: body } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Settings saved", value: config.value });
  } catch (error: any) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ message: "Failed to save settings", error: error.message }, { status: 500 });
  }
}
