export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Vendor } from "@/models/Vendor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    let vendorId = (session.user as any).vendorId;

    // Admin can scope search by passing vendorId query parameter
    if (role === "admin") {
      const { searchParams } = new URL(request.url);
      vendorId = searchParams.get("vendorId");
    }

    if (!vendorId) {
      return NextResponse.json({ message: "Missing vendor mapping for this account" }, { status: 400 });
    }

    await connectToDatabase();

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const query = { assignedVendor: new ObjectId(vendorId) };

    const totalLeads = await Lead.countDocuments(query);
    const todaysLeads = await Lead.countDocuments({ ...query, createdAt: { $gte: startOfToday } });
    const totalBookings = await Lead.countDocuments({ ...query, status: "Booked" });

    // Revenue
    const revenueResult = await Lead.aggregate([
      { $match: { assignedVendor: new ObjectId(vendorId), status: "Booked" } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]);
    const revenue = revenueResult[0]?.total || 0;

    // Calculate commission
    const commission = (revenue * (vendor.commissionRate || 0)) / 100;

    // Conversion rate
    const conversionRate = totalLeads > 0 ? parseFloat(((totalBookings / totalLeads) * 100).toFixed(1)) : 0;

    // Recent leads
    const recentLeads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email phone status budget createdAt");

    // Monthly data for charts
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const count = await Lead.countDocuments({
        assignedVendor: new ObjectId(vendorId),
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const bookedCount = await Lead.countDocuments({
        assignedVendor: new ObjectId(vendorId),
        status: "Booked",
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      chartData.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        Leads: count,
        Bookings: bookedCount,
      });
    }

    return NextResponse.json({
      vendor: {
        name: vendor.name,
        company: vendor.companyName,
        commissionRate: vendor.commissionRate,
        apiKey: vendor.apiKey,
      },
      stats: {
        totalLeads,
        todaysLeads,
        totalBookings,
        revenue,
        commission,
        conversionRate,
      },
      recentLeads,
      chartData,
    });
  } catch (error: any) {
    console.error("API vendor/stats GET error:", error);
    return NextResponse.json({ message: "Failed to fetch stats", error: error.message }, { status: 500 });
  }
}
