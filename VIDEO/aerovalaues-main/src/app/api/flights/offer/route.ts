export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { fetchDuffelOfferDetails } from "@/lib/duffel";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get("offerId") || searchParams.get("id") || "";

    if (!offerId) {
      return NextResponse.json({ message: "Missing offerId parameter" }, { status: 400 });
    }

    try {
      const offer = await fetchDuffelOfferDetails(offerId);
      if (!offer) {
        return NextResponse.json({ message: "Offer not found or Duffel not configured" }, { status: 404 });
      }
      return NextResponse.json(offer);
    } catch (err: any) {
      return NextResponse.json({ message: `Duffel error: ${err.message}` }, { status: 502 });
    }
  } catch (error: any) {
    console.error("API flights/offer error:", error);
    return NextResponse.json({ message: "Failed to fetch offer details", error: error.message }, { status: 500 });
  }
}
