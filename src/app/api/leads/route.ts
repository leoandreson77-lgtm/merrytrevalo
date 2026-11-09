import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { Vendor } from "@/models/Vendor";
import { sendLeadNotificationEmail, sendCustomerConfirmationEmail } from "@/lib/email";

// Public endpoint - no auth required - called when user submits booking form
export async function POST(request: Request) {
  try {
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
      notes,
      tags = [],
      priority = "High",
      source = "Flight Search",
    } = body;

    if (!name || !phone || !email) {
      return NextResponse.json(
        { message: "Missing required fields (name, phone, email)" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Round-Robin Agent Assignment
    let assignedAgentId = null;
    const activeAgents = await User.find({ role: "agent", status: "active" }).sort({ _id: 1 });
    if (activeAgents.length > 0) {
      const lastAssignedLead = await Lead.findOne({ assignedAgent: { $ne: null } })
        .sort({ createdAt: -1 })
        .select("assignedAgent");
      if (lastAssignedLead?.assignedAgent) {
        const lastIndex = activeAgents.findIndex(
          (a: any) => a._id.toString() === lastAssignedLead.assignedAgent!.toString()
        );
        assignedAgentId = (activeAgents[(lastIndex + 1) % activeAgents.length] as any)._id;
      } else {
        assignedAgentId = (activeAgents[0] as any)._id;
      }
    }

    // Round-Robin Vendor Assignment
    let assignedVendorId = null;
    const activeVendors = await Vendor.find({ status: "active" }).sort({ _id: 1 });
    if (activeVendors.length > 0) {
      const lastVendorLead = await Lead.findOne({ assignedVendor: { $ne: null } })
        .sort({ createdAt: -1 })
        .select("assignedVendor");
      if (lastVendorLead?.assignedVendor) {
        const lastIndex = activeVendors.findIndex(
          (v: any) => v._id.toString() === lastVendorLead.assignedVendor!.toString()
        );
        assignedVendorId = (activeVendors[(lastIndex + 1) % activeVendors.length] as any)._id;
      } else {
        assignedVendorId = (activeVendors[0] as any)._id;
      }
    }

    const lead = new Lead({
      name,
      phone,
      email,
      origin,
      destination,
      departureDate: departureDate ? new Date(departureDate) : undefined,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      passengers: passengers ? Number(passengers) : 1,
      cabin,
      budget: budget ? Number(budget) : undefined,
      source,
      notes: notes ? [{ note: notes, author: "System (Booking Form)", createdAt: new Date() }] : [],
      tags,
      priority,
      status: "New",
      assignedAgent: assignedAgentId,
      assignedVendor: assignedVendorId,
      history: [
        {
          action: "Lead Created",
          performedBy: "System",
          details: `Auto-generated from booking form submission. Route: ${origin} → ${destination}`,
          timestamp: new Date(),
        },
      ],
    });

    await lead.save();

    // 1. Send full details email to Admin/Owner
    try {
      await sendLeadNotificationEmail({
        name,
        phone,
        email,
        origin,
        destination,
        departureDate: departureDate ? new Date(departureDate).toDateString() : undefined,
        cabin,
        source,
        notes,
        priority,
      });
    } catch (e) {
      console.warn("Admin lead email notification failed:", e);
    }

    // 2. Send deal lock confirmation email to Customer
    try {
      await sendCustomerConfirmationEmail({
        name,
        phone,
        email,
        origin,
        destination,
        departureDate: departureDate ? new Date(departureDate).toDateString() : undefined,
        notes,
      });
    } catch (e) {
      console.warn("Customer confirmation email failed:", e);
    }

    return NextResponse.json(
      { message: "Lead created successfully", leadId: (lead._id as any).toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API leads POST error:", error);
    return NextResponse.json(
      { message: "Failed to create lead", error: error.message },
      { status: 500 }
    );
  }
}
