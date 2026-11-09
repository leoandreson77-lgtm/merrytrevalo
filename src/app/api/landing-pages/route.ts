import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LandingPage } from "@/models/LandingPage";

export const dynamic = "force-dynamic";

// Public endpoint — no auth required
// Returns only published landing pages for the frontend
export async function GET() {
  try {
    await connectToDatabase();
    const pages = await LandingPage.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select("title slug description callPhone createdAt")
      .lean();
    return NextResponse.json(pages, {
      headers: {
        // Cache for 60 seconds in browser, 300s on CDN edge
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("[Public LP API]", error);
    return NextResponse.json([], { status: 200 }); // fail silently on frontend
  }
}
