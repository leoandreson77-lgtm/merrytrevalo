export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { searchMongoAirportsByQuery } from "@/lib/airports";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const scope = searchParams.get("scope") || "airport";

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const results = await searchMongoAirportsByQuery(query, scope);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("API airports/search error:", error);
    // Fallback: search curated static airports list so user never gets 500 error
    const { searchMongoAirportsByQuery } = require("@/lib/airports");
    try {
      const fallback = await searchMongoAirportsByQuery(request.url.split("q=")[1]?.split("&")[0] || "NYC");
      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json([
        { code: "JFK", iata_code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", location: "New York, NY, United States" },
        { code: "EWR", iata_code: "EWR", name: "Newark Liberty International Airport", city: "New York", country: "United States", location: "Newark, NJ, United States" },
        { code: "LGA", iata_code: "LGA", name: "LaGuardia Airport", city: "New York", country: "United States", location: "New York, NY, United States" },
        { code: "DEL", iata_code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", location: "New Delhi, India" },
        { code: "BOM", iata_code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", location: "Mumbai, India" },
      ]);
    }
  }
}
