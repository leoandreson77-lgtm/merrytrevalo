export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase, getDb } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Call } from "@/models/Call";
import { Vendor } from "@/models/Vendor";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: Request) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "agent")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const db = await getDb();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Core KPIs
    const totalLeads = await Lead.countDocuments();
    const todaysLeads = await Lead.countDocuments({ createdAt: { $gte: startOfToday } });

    const totalCalls = await Call.countDocuments();
    const todaysCalls = await Call.countDocuments({ createdAt: { $gte: startOfToday } });

    const totalBookings = await Lead.countDocuments({ status: "Booked" });
    const todaysBookings = await Lead.countDocuments({ status: "Booked", updatedAt: { $gte: startOfToday } });

    // Revenue = sum of budget of all booked leads
    const revenueResult = await Lead.aggregate([
      { $match: { status: "Booked" } },
      { $group: { _id: null, total: { $sum: "$budget" } } },
    ]);
    const revenue = revenueResult[0]?.total || 0;

    // Flight searches count
    const flightSearches = await db.collection("searches").countDocuments();

    // Conversion rate = Booked / Total Leads * 100
    const conversionRate = totalLeads > 0 ? parseFloat(((totalBookings / totalLeads) * 100).toFixed(1)) : 0;

    // 2. Active Users (Mock active sessions based on last 5 minutes of searches)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSearches = await db.collection("searches").countDocuments({ timestamp: { $gte: fiveMinutesAgo } });
    const activeUsers = Math.max(12, recentSearches * 2 + 5); // Fallback base active user count

    // 3. Agent Performance
    const agents = await User.find({ role: { $in: ["admin", "agent"] } }).select("name email");
    const agentPerformance = await Promise.all(
      agents.map(async (agent) => {
        const leadsCount = await Lead.countDocuments({ assignedAgent: agent._id });
        const bookedCount = await Lead.countDocuments({ assignedAgent: agent._id, status: "Booked" });
        const conversion = leadsCount > 0 ? parseFloat(((bookedCount / leadsCount) * 100).toFixed(1)) : 0;
        return {
          name: agent.name,
          leads: leadsCount,
          booked: bookedCount,
          conversion,
        };
      })
    );

    // 4. Vendor Performance
    const vendors = await Vendor.find().select("name companyName");
    const vendorPerformance = await Promise.all(
      vendors.map(async (vendor) => {
        const leadsCount = await Lead.countDocuments({ assignedVendor: vendor._id });
        const bookedCount = await Lead.countDocuments({ assignedVendor: vendor._id, status: "Booked" });
        const revResult = await Lead.aggregate([
          { $match: { assignedVendor: vendor._id, status: "Booked" } },
          { $group: { _id: null, total: { $sum: "$budget" } } },
        ]);
        const rev = revResult[0]?.total || 0;
        return {
          name: vendor.name,
          company: vendor.companyName,
          leads: leadsCount,
          booked: bookedCount,
          revenue: rev,
        };
      })
    );

    // 5. Landing Page Performance
    const lpPerformance = await Lead.aggregate([
      { $match: { landingPage: { $nin: [null, ""] } } },
      { $group: { _id: "$landingPage", leads: { $sum: 1 }, booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } } } },
      { $sort: { leads: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", leads: 1, booked: 1 } },
    ]);

    // 6. Campaign & Ads Performance (Google Ads vs Meta Ads)
    const adsPerformance = await Lead.aggregate([
      { $match: { utmSource: { $in: ["google", "facebook", "instagram", "cpc", "meta"] } } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $in: ["$utmSource", ["google", "cpc"]] },
              then: "Google Ads",
              else: "Meta Ads",
            },
          },
          leads: { $sum: 1 },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
        },
      },
    ]);
    const campaignStats = {
      googleLeads: adsPerformance.find((x) => x._id === "Google Ads")?.leads || 0,
      googleBookings: adsPerformance.find((x) => x._id === "Google Ads")?.booked || 0,
      metaLeads: adsPerformance.find((x) => x._id === "Meta Ads")?.leads || 0,
      metaBookings: adsPerformance.find((x) => x._id === "Meta Ads")?.booked || 0,
    };

    // 7. Recent Activities
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name status createdAt source");
    const recentActivities: any[] = recentLeads.map((l) => ({
      type: "lead",
      description: `New lead created: ${l.name} via ${l.source}`,
      time: l.createdAt,
      status: l.status,
    }));

    const recentCalls = await Call.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("leadId", "name");
    recentCalls.forEach((c) => {
      recentActivities.push({
        type: "call",
        description: `Call clicked from number ${c.numberDialed || "Unknown"} (Status: ${c.status})`,
        time: c.createdAt,
        status: c.status,
      });
    });

    recentActivities.sort((a, b) => b.time.getTime() - a.time.getTime());

    // 8. Lead Analytics Chart Data (Leads generated in last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await Lead.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
      const booked = await Lead.countDocuments({ status: "Booked", updatedAt: { $gte: startOfDay, $lte: endOfDay } });

      chartData.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        Leads: count,
        Bookings: booked,
      });
    }

    return NextResponse.json({
      kpis: {
        totalLeads,
        todaysLeads,
        totalCalls,
        todaysCalls,
        totalBookings,
        todaysBookings,
        revenue,
        flightSearches,
        conversionRate,
        activeUsers,
      },
      agentPerformance,
      vendorPerformance,
      lpPerformance,
      campaignStats,
      recentActivities: recentActivities.slice(0, 8),
      chartData,
    });
  } catch (error: any) {
    console.error("API admin/dashboard/stats error:", error);
    return NextResponse.json({ message: "Failed to fetch stats", error: error.message }, { status: 500 });
  }
}
