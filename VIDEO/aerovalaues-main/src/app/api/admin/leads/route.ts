import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { Vendor } from "@/models/Vendor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sendLeadNotificationEmail } from "@/lib/email";

// GET: List leads with search, filters, pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const source = searchParams.get("source") || "";
    const agentId = searchParams.get("agentId") || "";
    const vendorId = searchParams.get("vendorId") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query: any = {};

    // Search query matches name, phone, email, origin, destination
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { origin: searchRegex },
        { destination: searchRegex },
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (agentId) query.assignedAgent = agentId;
    if (vendorId) query.assignedVendor = vendorId;

    // Execute query with populate
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("assignedAgent", "name email")
      .populate("assignedVendor", "name companyName");

    const totalLeads = await Lead.countDocuments(query);
    const totalPages = Math.ceil(totalLeads / limit);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        totalLeads,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("API admin/leads GET error:", error);
    return NextResponse.json({ message: "Failed to fetch leads", error: error.message }, { status: 500 });
  }
}

// POST: Create a manual lead and apply round-robin assignment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      email,
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabin,
      budget,
      source = "Manual Entry",
      notes,
      tags = [],
      priority = "Medium",
    } = body;

    if (!name || !phone || !email) {
      return NextResponse.json({ message: "Missing required fields (name, phone, email)" }, { status: 400 });
    }

    await connectToDatabase();

    // Round-Robin Assignment Logic
    let assignedAgentId = null;
    let assignedVendorId = null;
    
    // Find all active agents
    const activeAgents = await User.find({ role: "agent", status: "active" }).sort({ _id: 1 });
    
    if (activeAgents.length > 0) {
      // Find the last assigned lead that had an agent
      const lastAssignedLead = await Lead.findOne({ assignedAgent: { $ne: null } })
        .sort({ createdAt: -1 })
        .select("assignedAgent");

      if (lastAssignedLead && lastAssignedLead.assignedAgent) {
        // Find next agent in sequence
        const lastAgentIndex = activeAgents.findIndex(
          (a: any) => a._id.toString() === lastAssignedLead.assignedAgent!.toString()
        );
        const nextAgentIndex = (lastAgentIndex + 1) % activeAgents.length;
        assignedAgentId = (activeAgents[nextAgentIndex] as any)._id;
      } else {
        assignedAgentId = (activeAgents[0] as any)._id;
      }
    }

    // Auto-assign round robin vendors (if any active vendors exist)
    const activeVendors = await Vendor.find({ status: "active" }).sort({ _id: 1 });
    if (activeVendors.length > 0) {
      const lastAssignedVendorLead = await Lead.findOne({ assignedVendor: { $ne: null } })
        .sort({ createdAt: -1 })
        .select("assignedVendor");

      if (lastAssignedVendorLead && lastAssignedVendorLead.assignedVendor) {
        const lastVendorIndex = activeVendors.findIndex(
          (v: any) => v._id.toString() === lastAssignedVendorLead.assignedVendor!.toString()
        );
        const nextVendorIndex = (lastVendorIndex + 1) % activeVendors.length;
        assignedVendorId = (activeVendors[nextVendorIndex] as any)._id;
      } else {
        assignedVendorId = (activeVendors[0] as any)._id;
      }
    }

    const noteList = [];
    if (notes) {
      noteList.push({
        note: notes,
        author: session.user?.name || "System",
        createdAt: new Date(),
      });
    }

    const historyEntry = {
      action: "Lead Created (Manual)",
      performedBy: session.user?.name || "System",
      details: "Manual entry generated",
      timestamp: new Date(),
    };

    if (assignedAgentId) {
      const agent = activeAgents.find((a: any) => a._id.toString() === assignedAgentId!.toString());
      historyEntry.details += `. Auto-assigned to agent: ${agent?.name || "Unknown"}`;
    }
    if (assignedVendorId) {
      const vendor = activeVendors.find((v: any) => v._id.toString() === assignedVendorId!.toString());
      historyEntry.details += `. Auto-assigned to vendor: ${vendor?.name || "Unknown"}`;
    }

    const newLead = await Lead.create({
      name,
      phone,
      email: email.toLowerCase(),
      origin,
      destination,
      departureDate: departureDate ? new Date(departureDate) : undefined,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      passengers: passengers ? parseInt(passengers, 10) : 1,
      cabin: cabin || "Economy",
      budget: budget ? parseFloat(budget) : undefined,
      source,
      notes: noteList,
      tags,
      priority,
      assignedAgent: assignedAgentId,
      assignedVendor: assignedVendorId,
      status: assignedAgentId ? "Assigned" : "New",
      history: [historyEntry],
      attachments: [],
    });

    // Fire-and-forget email notification to admin/owner (same as public route)
    sendLeadNotificationEmail({
      name,
      phone,
      email,
      origin,
      destination,
      departureDate: departureDate ? new Date(departureDate).toDateString() : undefined,
      cabin: cabin || "Economy",
      source,
      notes,
      priority,
    }).catch((e) => console.warn("[Admin Lead] Email notification failed:", e));

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error: any) {
    console.error("API admin/leads POST error:", error);
    return NextResponse.json({ message: "Failed to create lead", error: error.message }, { status: 500 });
  }
}
