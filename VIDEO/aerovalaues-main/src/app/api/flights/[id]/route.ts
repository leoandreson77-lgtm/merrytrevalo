import { NextResponse } from "next/server";
import { cacheGet } from "@/lib/redis";
import { connectToDatabase } from "@/lib/db";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: "Invalid ID parameter" }, { status: 400 });
    }

    // Try Redis lookup first
    const cachedFlight = await cacheGet<any>(`flight:id:${id}`);
    if (cachedFlight) {
      return NextResponse.json(cachedFlight);
    }

    // Check if ID is a valid MongoDB ObjectId
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    if (isObjectId) {
      await connectToDatabase();
      const db = await getDb();
      const flight = await db.collection("flights").findOne({ _id: new ObjectId(id) });
      if (flight) {
        return NextResponse.json({
          ...flight,
          id: flight._id.toString(),
        });
      }
    }

    // Fallback: If it's a Duffel offer ID, fetch from Duffel API
    if (id.startsWith("duffel-")) {
      const rawDuffelOfferId = id.substring("duffel-".length);
      const { fetchDuffelOfferDetails, mapOfferToFlight } = await import("@/lib/duffel");
      try {
        const rawOffer = await fetchDuffelOfferDetails(rawDuffelOfferId);
        if (rawOffer) {
          const slices = rawOffer.slices || [];
          const origin = slices[0]?.origin?.iata_code || "";
          const destination = slices[0]?.destination?.iata_code || "";
          const flight = mapOfferToFlight(rawOffer, origin, destination);
          if (flight) {
            const { cacheSet } = await import("@/lib/redis");
            await cacheSet(`flight:id:${id}`, flight, 3600); // cache for 1 hour
            return NextResponse.json(flight);
          }
        }
      } catch (duffelError: any) {
        console.warn(`Duffel offer fetch failed for ${id}:`, duffelError.message);
        return NextResponse.json({ message: "Flight offer expired or no longer available" }, { status: 404 });
      }
    }

    return NextResponse.json({ message: "Flight not found" }, { status: 404 });
  } catch (error: any) {
    console.error("API flights/:id error:", error);
    return NextResponse.json({ message: "Failed to fetch flight", error: error.message }, { status: 500 });
  }
}
