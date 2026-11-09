export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { searchMongoCountries } from "@/lib/airports";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const results = await searchMongoCountries(query);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("API airports/countries error:", error);
    return NextResponse.json({ message: "Failed to fetch countries", error: error.message }, { status: 500 });
  }
}
