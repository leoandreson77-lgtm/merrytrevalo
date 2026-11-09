import { NextResponse } from "next/server";
import { scrapeMultipleFlights } from "@/lib/scraper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { flights = [], method = "serpapi" } = body;

    if (!Array.isArray(flights) || flights.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "flights array is required and must not be empty",
        },
        { status: 400 }
      );
    }

    const credentials = {
      oxylabs_username: process.env.OXYLABS_USERNAME,
      oxylabs_password: process.env.OXYLABS_PASSWORD,
      serpapi_key: process.env.SERPAPI_KEY,
    };

    const results = await scrapeMultipleFlights(flights, method, credentials);
    return NextResponse.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error: any) {
    console.error("API scraper/batch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
