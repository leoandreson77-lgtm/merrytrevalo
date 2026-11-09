import { NextResponse } from "next/server";
import { connectToDatabase, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const PREDEFINED_ROUTES = [
  {
    title: "Cheap Flights to Paris",
    slug: "cheap-flights-to-paris",
    originCode: "NYC",
    originName: "New York, USA",
    destCode: "PAR",
    destName: "Paris, France",
    seat: "12A",
    gate: "B3",
    priceOff: "Save 40%",
  },
  {
    title: "Cheap Flights to London",
    slug: "cheap-flights-to-london",
    originCode: "NYC",
    originName: "New York, USA",
    destCode: "LON",
    destName: "London, UK",
    seat: "14C",
    gate: "A15",
    priceOff: "Save 35%",
  },
  {
    title: "Cheap Flights to Delhi",
    slug: "cheap-flights-to-delhi",
    originCode: "NYC",
    originName: "New York, USA",
    destCode: "DEL",
    destName: "Delhi, India",
    seat: "08D",
    gate: "C2",
    priceOff: "Save 45%",
  },
  {
    title: "Cheap Flights to Tokyo",
    slug: "cheap-flights-to-tokyo",
    originCode: "LAX",
    originName: "Los Angeles, USA",
    destCode: "NRT",
    destName: "Tokyo, Japan",
    seat: "16F",
    gate: "D8",
    priceOff: "Save 30%",
  },
  {
    title: "Cheap Flights to Rome",
    slug: "cheap-flights-to-rome",
    originCode: "MIA",
    originName: "Miami, USA",
    destCode: "FCO",
    destName: "Rome, Italy",
    seat: "11A",
    gate: "B9",
    priceOff: "Save 40%",
  },
  {
    title: "Cheap Flights to Dubai",
    slug: "cheap-flights-to-dubai",
    originCode: "NYC",
    originName: "New York, USA",
    destCode: "DXB",
    destName: "Dubai, UAE",
    seat: "07B",
    gate: "A4",
    priceOff: "Save 38%",
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    const db = await getDb();
    const doc = await db.collection("cms_settings").findOne({ _type: "global" });
    const routes = doc?.popularRoutes ?? PREDEFINED_ROUTES;
    return NextResponse.json(routes);
  } catch (err: any) {
    return NextResponse.json(PREDEFINED_ROUTES);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const indexStr = searchParams.get("index");

    await connectToDatabase();
    const db = await getDb();
    const doc = await db.collection("cms_settings").findOne({ _type: "global" });
    let routes = doc?.popularRoutes ?? PREDEFINED_ROUTES;

    if (slug) {
      routes = routes.filter((r: any) => r.slug !== slug && r._id !== slug);
    } else if (indexStr !== null) {
      const idx = parseInt(indexStr, 10);
      if (!isNaN(idx) && idx >= 0 && idx < routes.length) {
        routes.splice(idx, 1);
      }
    }

    await db.collection("cms_settings").updateOne(
      { _type: "global" },
      { $set: { popularRoutes: routes, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Route deleted successfully", routes });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Failed to delete route" }, { status: 500 });
  }
}

