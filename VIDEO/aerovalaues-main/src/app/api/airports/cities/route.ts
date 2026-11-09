export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { searchMongoCities } from "@/lib/airports";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const results = await searchMongoCities(query);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("API airports/cities error:", error);
    return NextResponse.json({ message: "Failed to fetch cities", error: error.message }, { status: 500 });
  }
}
