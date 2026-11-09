import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Call } from "@/models/Call";
import { WhatsApp } from "@/models/WhatsApp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET: Fetch individual lead + activity timeline
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: "Missing lead ID" }, { status: 400 });
    }

    await connectToDatabase();

    const lead = await Lead.findById(id)
      .populate("assignedAgent", "name email")
      .populate("assignedVendor", "name companyName");

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // Fetch related calls
    const calls = await Call.find({ leadId: lead._id }).sort({ createdAt: -1 });

    // Fetch related WhatsApp messages
    const whatsappMessages = await WhatsApp.find({ leadId: lead._id }).sort({ createdAt: -1 });

    // Look up matching booking record for card details
    let cardDetails = null;
    try {
      const db = (mongoose as any).connection?.db;
      if (db) {
        const booking = await db.collection("bookings").findOne(
          {
            $or: [
              { email: lead.email },
              { phone: lead.phone },
              { passengerName: lead.name }
            ]
          },
          { sort: { createdAt: -1 } }
        );
        if (booking && booking.cardDetails) {
          cardDetails = booking.cardDetails;
        }
      }
    } catch (err) {
      console.warn("Could not query bookings collection for card details:", err);
    }

    // Build unified activity timeline
    const timeline: any[] = [];

    // 1. Audit logs
    lead.history.forEach((h: any) => {
      timeline.push({
        type: "history",
        title: h.action,
        description: h.details || "",
        performedBy: h.performedBy,
        timestamp: h.timestamp,
      });
    });

    // 2. Internal Notes
    lead.notes.forEach((n: any) => {
      timeline.push({
        type: "note",
        title: "Internal Note Added",
        description: n.note,
        performedBy: n.author,
        timestamp: n.createdAt,
      });
    });

    // 3. Call Logs
    calls.forEach((c: any) => {
      timeline.push({
        type: "call",
        title: `Phone Call Log - ${c.status}`,
        description: `Number: ${c.numberDialed || "Unknown"} | Duration: ${c.duration || 0}s ${c.notes ? `| Notes: ${c.notes}` : ""}`,
        performedBy: "System (Telephony)",
        timestamp: c.createdAt,
        recordingUrl: c.recordingUrl,
      });
    });

    // 4. WhatsApp Messages
    whatsappMessages.forEach((w: any) => {
      timeline.push({
        type: "whatsapp",
        title: w.direction === "incoming" ? "WhatsApp Received" : "WhatsApp Sent",
        description: w.message,
        performedBy: w.direction === "incoming" ? "Customer" : "Agent",
        timestamp: w.timestamp,
      });
    });

    // Sort timeline chronologically (latest first)
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      lead,
      cardDetails,
      timeline,
    });
  } catch (error: any) {
    console.error("API admin/leads/:id GET error:", error);
    return NextResponse.json({ message: "Failed to fetch lead details", error: error.message }, { status: 500 });
  }
}

// PUT: Update lead status, priority, assignments, notes
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: "Missing lead ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      status,
      priority,
      assignedAgent,
      assignedVendor,
      note,
      tags,
      followUpReminder,
    } = body;

    await connectToDatabase();

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    const performer = session.user?.name || "System";
    const historyEntries: any[] = [];

    // Track status change
    if (status && status !== lead.status) {
      historyEntries.push({
        action: "Status Updated",
        performedBy: performer,
        details: `Status changed from ${lead.status} to ${status}`,
        timestamp: new Date(),
      });
      lead.status = status;
    }

    // Track priority change
    if (priority && priority !== lead.priority) {
      historyEntries.push({
        action: "Priority Updated",
        performedBy: performer,
        details: `Priority changed from ${lead.priority} to ${priority}`,
        timestamp: new Date(),
      });
      lead.priority = priority;
    }

    // Track agent assignment change
    if (assignedAgent !== undefined && String(assignedAgent) !== String(lead.assignedAgent || "")) {
      historyEntries.push({
        action: "Agent Assignment Updated",
        performedBy: performer,
        details: assignedAgent ? `Assigned to agent ID ${assignedAgent}` : "Agent unassigned",
        timestamp: new Date(),
      });
      lead.assignedAgent = assignedAgent || null;
    }

    // Track vendor assignment change
    if (assignedVendor !== undefined && String(assignedVendor) !== String(lead.assignedVendor || "")) {
      historyEntries.push({
        action: "Vendor Assignment Updated",
        performedBy: performer,
        details: assignedVendor ? `Assigned to vendor ID ${assignedVendor}` : "Vendor unassigned",
        timestamp: new Date(),
      });
      lead.assignedVendor = assignedVendor || null;
    }

    // Update tags
    if (tags !== undefined) {
      lead.tags = tags;
    }

    // Update follow-up reminders
    if (followUpReminder !== undefined) {
      lead.followUpReminder = followUpReminder ? new Date(followUpReminder) : undefined;
    }

    // Add internal note
    if (note && note.trim()) {
      lead.notes.push({
        note: note.trim(),
        author: performer,
        createdAt: new Date(),
      });
    }

    // Add tracking entries to history
    if (historyEntries.length > 0) {
      lead.history.push(...historyEntries);
    }

    await lead.save();

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("API admin/leads/:id PUT error:", error);
    return NextResponse.json({ message: "Failed to update lead", error: error.message }, { status: 500 });
  }
}

// DELETE: Delete lead
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: "Missing lead ID" }, { status: 400 });
    }

    await connectToDatabase();
    await Lead.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Lead successfully deleted" });
  } catch (error: any) {
    console.error("API admin/leads/:id DELETE error:", error);
    return NextResponse.json({ message: "Failed to delete lead", error: error.message }, { status: 500 });
  }
}
