export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAirportsByCountryCode } from "@/lib/airports";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode") || searchParams.get("country") || "";

    if (!countryCode) {
      return NextResponse.json([]);
    }

    const results = await getAirportsByCountryCode(countryCode);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("API airports/by-country error:", error);
    return NextResponse.json({ message: "Failed to fetch airports by country", error: error.message }, { status: 500 });
  }
}
