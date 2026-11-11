import { connectToDatabase } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";
import { TFN } from "@/models/TFN";

export async function getGlobalCallNumber(landingPageSlug?: string): Promise<string> {
  try {
    await connectToDatabase();

    // 1. Landing page specific TFN override if mapped
    if (landingPageSlug) {
      const mappedTfn = await TFN.findOne({ landingPageSlug, status: "active" });
      if (mappedTfn?.number) return mappedTfn.number;
    }

    // 2. Admin Settings saved call number
    const config = await CMSConfig.findOne({ key: "global_settings" });
    if (config?.value?.callNumber && typeof config.value.callNumber === "string" && config.value.callNumber.trim().length > 0) {
      return config.value.callNumber.trim();
    }

    // 3. Telephony TFN pool default
    const activeTfn = await TFN.findOne({ isDefault: true, status: "active" }) || await TFN.findOne({ status: "active" });
    if (activeTfn?.number) return activeTfn.number;

    // 4. Default fallback
    return process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18555106415";
  } catch (err) {
    console.error("Error resolving global call number:", err);
    return process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18555106415";
  }
}
