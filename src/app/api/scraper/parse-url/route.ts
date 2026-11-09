export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { parseGoogleFlightsURL } from "@/lib/scraper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") || "";

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "url query parameter is required",
        },
        { status: 400 }
      );
    }

    const result = parseGoogleFlightsURL(url);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API scraper/parse-url error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
