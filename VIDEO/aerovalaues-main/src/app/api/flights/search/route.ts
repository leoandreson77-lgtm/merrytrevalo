export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { fetchDuffelFlights } from "@/lib/duffel";
import { cacheGet, cacheSet } from "@/lib/redis";
import { connectToDatabase } from "@/lib/db";
import { getDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

function parseTravelerCount(value: any, min = 0, max = 12) {
  const parsed = parseInt(String(value ?? min), 10);
  if (isNaN(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}

function parsePassengers(value: any) {
  const parsed = parseInt(String(value || "1"), 10);
  if (isNaN(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 12);
}

function packageDiscountMultiplier(packageType: string, passengers: number) {
  if (packageType === "family" && passengers >= 4) return 0.9;
  if (packageType === "couple" && passengers >= 2) return 0.95;
  return 1;
}

function enrichFareForTrip(flight: any, options: { tripType: string; packageType: string; passengers: number; returnDate?: string }) {
  const basePrice = Number(flight?.price || 0);
  const discountMultiplier = packageDiscountMultiplier(options.packageType, options.passengers);
  const discountedPerAdultPrice = Math.max(0, Math.round(basePrice * discountMultiplier));
  const estimatedTotalPrice = Math.max(0, Math.round(discountedPerAdultPrice * options.passengers));

  return {
    ...flight,
    price: discountedPerAdultPrice,
    estimatedTotalPrice,
    tripType: options.tripType,
    packageType: options.packageType,
    passengers: options.passengers,
    ...(options.returnDate ? { returnDate: options.returnDate } : {}),
  };
}

export async function GET(request: Request) {
  try {
    // Enforce search rate limit based on client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = await checkRateLimit(ip, "search", { limit: 30, windowSeconds: 60 });
    if (!limiter.success) {
      return NextResponse.json(
        { message: "Too many flight search requests. Please wait a minute before querying again." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const date = searchParams.get("date") || "";
    const returnDate = searchParams.get("returnDate") || undefined;
    const tripType = searchParams.get("tripType") === "oneway" ? "oneway" : "round";
    const packageType = searchParams.get("package") === "family" ? "family" : searchParams.get("package") === "couple" ? "couple" : "solo";
    const adults = parseTravelerCount(searchParams.get("adults"), 1, 9);
    const children = parseTravelerCount(searchParams.get("children"), 0, 8);
    const infants = parseTravelerCount(searchParams.get("infants"), 0, adults);
    const passengers = parsePassengers(searchParams.get("passengers") || (adults + children + infants));
    const travelClass = searchParams.get("travelClass") || "Economy";

    if (!origin || !destination || !date) {
      return NextResponse.json({ message: "Missing query parameters" }, { status: 400 });
    }

    // Cache key
    const cacheKey = `flights:search:${origin}:${destination}:${date}:${returnDate || ""}:${tripType}:${travelClass}:${adults}:${children}:${infants}`;
    const cachedResults = await cacheGet<any[]>(cacheKey);

    if (cachedResults) {
      // Return cached results directly
      return NextResponse.json(cachedResults);
    }

    // Log search event in CRM stats (non-blocking)
    try {
      await connectToDatabase();
      const db = await getDb();
      await db.collection("searches").insertOne({
        origin,
        destination,
        date,
        returnDate: returnDate || null,
        tripType,
        packageType,
        adults,
        children,
        infants,
        passengers,
        travelClass,
        timestamp: new Date(),
      });
    } catch (dbErr) {
      console.error("Failed to log search event to database:", dbErr);
    }

    // Fetch from Duffel
    let flights: any[] = [];
    try {
      flights = await fetchDuffelFlights(origin, destination, date, {
        adults,
        children,
        infants,
        travelClass,
        returnDate,
      });
    } catch (err) {
      console.error("Duffel search error:", err);
      // Fallback: return empty list rather than hard crash
      flights = [];
    }

    // Enrich flights
    const enrichedFlights = flights.map((flight) =>
      enrichFareForTrip(flight, {
        tripType,
        packageType,
        passengers,
        returnDate,
      })
    );

    // Save to Cache (5 mins cache)
    if (enrichedFlights.length > 0) {
      await cacheSet(cacheKey, enrichedFlights, 300);
      
      // Cache individual flights in Redis for dynamic book lookups (1 hour)
      for (const flight of enrichedFlights) {
        await cacheSet(`flight:id:${flight.id}`, flight, 3600);
      }
    }

    return NextResponse.json(enrichedFlights);
  } catch (error: any) {
    console.error("API flights/search error:", error);
    return NextResponse.json({ message: "Failed to fetch flights", error: error.message }, { status: 500 });
  }
}
