import { NextResponse } from "next/server";
import { scrapeFlights } from "@/lib/scraper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { html } = body;

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Valid HTML string is required in body",
        },
        { status: 400 }
      );
    }

    const result = await scrapeFlights({
      method: "html",
      html_content: html,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API scraper/html error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
