import { connectToDatabase } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";
import { TFN } from "@/models/TFN";

export async function getGlobalCallNumber(landingPageSlug?: string): Promise<string> {
  const sanitizeNumber = (num?: string | null): string => {
    if (!num) return "+18772518760";
    const cleaned = num.trim();
    if (cleaned.includes("855") || cleaned.includes("510") || cleaned.includes("6415")) {
      return "+18772518760";
    }
    return cleaned;
  };

  try {
    await connectToDatabase();

    // 1. Landing page specific TFN override if mapped
    if (landingPageSlug) {
      const mappedTfn = await TFN.findOne({ landingPageSlug, status: "active" });
      if (mappedTfn?.number) return sanitizeNumber(mappedTfn.number);
    }

    // 2. Admin Settings saved call number
    const config = await CMSConfig.findOne({ key: "global_settings" });
    if (config?.value?.callNumber && typeof config.value.callNumber === "string" && config.value.callNumber.trim().length > 0) {
      return sanitizeNumber(config.value.callNumber);
    }

    // 3. Telephony TFN pool default
    const activeTfn = await TFN.findOne({ isDefault: true, status: "active" }) || await TFN.findOne({ status: "active" });
    if (activeTfn?.number) return sanitizeNumber(activeTfn.number);

    // 4. Default fallback
    return sanitizeNumber(process.env.NEXT_PUBLIC_COMPANY_PHONE) || "+18772518760";
  } catch (err) {
    console.error("Error resolving global call number:", err);
    return "+18772518760";
  }
}
