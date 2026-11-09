export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Call } from "@/models/Call";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin role required." }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Fetch leads conversion data
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .populate("assignedAgent", "name")
      .populate("assignedVendor", "companyName");

    const leadsData = leads.map((l: any) => ({
      ID: l._id.toString(),
      Name: l.name,
      Email: l.email,
      Phone: l.phone,
      Origin: l.origin || "N/A",
      Destination: l.destination || "N/A",
      Source: l.source,
      Status: l.status,
      Priority: l.priority,
      Agent: l.assignedAgent?.name || "Unassigned",
      Vendor: l.assignedVendor?.companyName || "None",
      Budget: l.budget || 0,
      CreatedDate: l.createdAt.toLocaleDateString(),
    }));

    // 2. Fetch telephony click/call logs
    const calls = await Call.find()
      .sort({ createdAt: -1 })
      .populate("leadId", "name");

    const callsData = calls.map((c: any) => ({
      ID: c._id.toString(),
      NumberDialed: c.numberDialed,
      DurationSeconds: c.duration || 0,
      Status: c.status,
      LinkedLead: c.leadId?.name || "No profile link",
      Ip: c.visitorIp || "N/A",
      Device: c.device || "N/A",
      Timestamp: c.createdAt.toLocaleDateString() + " " + c.createdAt.toLocaleTimeString(),
    }));

    // 3. Fetch bookings and revenue transactions
    const bookings = await Lead.find({ status: "Booked" })
      .sort({ updatedAt: -1 })
      .populate("assignedAgent", "name")
      .populate("assignedVendor", "companyName");

    const bookingsData = bookings.map((b: any) => ({
      ID: b._id.toString(),
      PassengerName: b.name,
      Route: `${b.origin} -> ${b.destination}`,
      Budget: b.budget || 0,
      Agent: b.assignedAgent?.name || "Unassigned",
      Vendor: b.assignedVendor?.companyName || "None",
      DateConfirmed: b.updatedAt.toLocaleDateString(),
    }));

    return NextResponse.json({
      leads: leadsData,
      calls: callsData,
      bookings: bookingsData,
    });
  } catch (error: any) {
    console.error("API admin/reports/data error:", error);
    return NextResponse.json({ message: "Failed to compile reports data", error: error.message }, { status: 500 });
  }
}
