import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Client } from "@/models/Client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const clients = await Client.find().sort({ createdAt: -1 });
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      name, email, phone, forwardNumber, ratePerCall,
      minDuration, maxCallsPerDay, allowedHoursStart,
      allowedHoursEnd, allowedTimezone, notes,
    } = body;

    if (!name || !forwardNumber) {
      return NextResponse.json({ message: "Name and forward number required" }, { status: 400 });
    }

    await connectToDatabase();
    const client = await Client.create({
      name, email, phone, forwardNumber,
      ratePerCall: parseFloat(ratePerCall) || 28,
      minDuration: parseInt(minDuration) || 60,
      maxCallsPerDay: parseInt(maxCallsPerDay) || 100,
      allowedHoursStart: allowedHoursStart || "08:00",
      allowedHoursEnd: allowedHoursEnd || "20:00",
      allowedTimezone: allowedTimezone || "America/New_York",
      notes,
    });

    return NextResponse.json({ success: true, client }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
