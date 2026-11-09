import { NextResponse } from "next/server";
import { scrapeFlights } from "@/lib/scraper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, method = "serpapi", departure, arrival, outbound_date, return_date } = body;

    if (!url && !departure) {
      return NextResponse.json(
        {
          success: false,
          message: "Either a Google Flights URL or flight parameters (departure, arrival, outbound_date) are required",
        },
        { status: 400 }
      );
    }

    const scrapingOptions = {
      url,
      method,
      departure,
      arrival,
      outbound_date,
      return_date,
      oxylabs_username: process.env.OXYLABS_USERNAME,
      oxylabs_password: process.env.OXYLABS_PASSWORD,
      serpapi_key: process.env.SERPAPI_KEY,
    };

    const result = await scrapeFlights(scrapingOptions);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API scraper/google-flights error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
