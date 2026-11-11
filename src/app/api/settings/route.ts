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
    const defaults = { callNumber: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18555106415", callLabel: "Call Now" };
    const settingsValue = config?.value ? { ...defaults, ...config.value } : defaults;
    
    // If config has stale 877 number or empty, update to +18555106415
    if (!settingsValue.callNumber || settingsValue.callNumber.includes("877")) {
      const activeTfn = await TFN.findOne({ isDefault: true, status: "active" }) 
        || await TFN.findOne({ status: "active" });
      settingsValue.callNumber = activeTfn?.number || process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18555106415";
    }

    return NextResponse.json(settingsValue);
  } catch (error: any) {
    return NextResponse.json({ callNumber: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18555106415", callLabel: "Call Now" });
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
