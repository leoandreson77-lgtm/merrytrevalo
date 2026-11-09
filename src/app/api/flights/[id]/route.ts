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

    // Try Redis lookup first (bypass if old cache has invalid destination === origin)
    const cachedFlight = await cacheGet<any>(`flight:id:${id}`);
    if (cachedFlight && cachedFlight.destination !== cachedFlight.origin) {
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
      }
    }

    // Fail-safe: If it's a generated flight offer (e.g. fl-JFK-LAX-0-17415...)
    if (id.startsWith("fl-")) {
      const parts = id.split("-");
      const origin = (parts[1] || "JFK").toUpperCase();
      const destination = (parts[2] || "LAX").toUpperCase();
      const today = new Date().toISOString().split("T")[0];

      const airlines = [
        { name: "Delta Air Lines", code: "DL" },
        { name: "American Airlines", code: "AA" },
        { name: "United Airlines", code: "UA" },
        { name: "British Airways", code: "BA" },
      ];
      const airline = airlines[Math.abs(id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % airlines.length];

      const fallbackFlight = {
        id,
        airline: airline.name,
        airlineCode: airline.code,
        flightNumber: `${airline.code}${Math.floor(100 + Math.random() * 900)}`,
        origin,
        destination,
        departureTime: `${today}T08:30:00.000Z`,
        arrivalTime: `${today}T12:15:00.000Z`,
        price: 24500,
        currency: "USD",
        duration: "4h 45m",
        stops: 0,
        source: "curated",
        amenities: ["Wi-Fi available", "Power outlet available", "In-flight entertainment"],
        luggage: ["Carry-on: 1 bag", "Checked baggage: 1 bag"],
      };

      const { cacheSet } = await import("@/lib/redis");
      await cacheSet(`flight:id:${id}`, fallbackFlight, 3600);
      return NextResponse.json(fallbackFlight);
    }

    // Fallback for demo/numeric flight IDs (e.g. "1", "2")
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId) && numericId > 0) {
      const today = new Date().toISOString().split("T")[0];
      const demoFlight = {
        id: String(numericId),
        airline: "American Airlines",
        airlineCode: "AA",
        flightNumber: `AA${300 + numericId}`,
        origin: "JFK",
        destination: "LAX",
        departureTime: `${today}T09:00:00.000Z`,
        arrivalTime: `${today}T12:30:00.000Z`,
        price: 26800,
        currency: "USD",
        duration: "5h 30m",
        stops: 0,
        source: "curated",
        amenities: ["Wi-Fi available", "In-flight meals", "USB Power"],
        luggage: ["Carry-on: 1 bag", "Checked baggage: 1 bag"],
      };
      return NextResponse.json(demoFlight);
    }

    return NextResponse.json({ message: "Flight not found" }, { status: 404 });
  } catch (error: any) {
    console.error("API flights/:id error:", error);
    return NextResponse.json({ message: "Failed to fetch flight", error: error.message }, { status: 500 });
  }
}
