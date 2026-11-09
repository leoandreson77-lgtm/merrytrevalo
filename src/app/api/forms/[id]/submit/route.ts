import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Form } from "@/models/Form";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { Vendor } from "@/models/Vendor";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendLeadNotificationEmail, sendCustomerConfirmationEmail } from "@/lib/email";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = await checkRateLimit(ip, "form_submit", { limit: 10, windowSeconds: 60 });
    if (!limiter.success) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const formId = params.id;
    const body = await request.json();

    if (!formId) {
      return NextResponse.json({ message: "Missing form ID" }, { status: 400 });
    }

    await connectToDatabase();

    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ message: "Form configuration not found" }, { status: 404 });
    }

    // Parse fields mapping submitted values to Lead properties
    let name = "Enquiry Visitor";
    let email = "";
    let phone = "";
    let origin = "";
    let destination = "";
    let departureDate: Date | undefined;
    let returnDate: Date | undefined;
    let cabin = "Economy";
    let budget: number | undefined;
    let passengers = 1;

    const notesList: string[] = [];

    // Map fields
    for (const field of form.fields) {
      const val = body[field.id];
      if (val === undefined || val === null || String(val).trim() === "") continue;

      const cleanLabel = field.label.toLowerCase();

      // Check heuristics for mapping fields
      if (field.type === "email" || cleanLabel.includes("email")) {
        email = String(val).trim().toLowerCase();
      } else if (field.type === "phone" || cleanLabel.includes("phone") || cleanLabel.includes("mobile") || cleanLabel.includes("contact")) {
        phone = String(val).trim();
      } else if (cleanLabel.includes("name") || cleanLabel.includes("passenger")) {
        name = String(val).trim();
      } else if (cleanLabel.includes("origin") || cleanLabel.includes("from") || cleanLabel.includes("departure airport")) {
        origin = String(val).trim().toUpperCase();
      } else if (cleanLabel.includes("destination") || cleanLabel.includes("to") || cleanLabel.includes("arrival airport")) {
        destination = String(val).trim().toUpperCase();
      } else if (field.type === "date" || cleanLabel.includes("departure date") || cleanLabel.includes("travel date")) {
        departureDate = new Date(String(val));
      } else if (cleanLabel.includes("return date") || cleanLabel.includes("rt date")) {
        returnDate = new Date(String(val));
      } else if (cleanLabel.includes("cabin") || cleanLabel.includes("class")) {
        cabin = String(val).trim();
      } else if (cleanLabel.includes("budget") || cleanLabel.includes("price")) {
        budget = parseFloat(String(val).replace(/[^0-9.]/g, ""));
      } else if (cleanLabel.includes("passenger count") || cleanLabel.includes("passengers") || cleanLabel.includes("travelers")) {
        passengers = parseInt(String(val), 10) || 1;
      } else {
        notesList.push(`${field.label}: ${val}`);
      }
    }

    if (!email && !phone) {
      return NextResponse.json(
        { message: "Please provide either email or phone number in form inputs." },
        { status: 400 }
      );
    }

    // Apply auto-assignment Round Robin logic for new lead
    let assignedAgentId = null;
    let assignedVendorId = null;

    const activeAgents = await User.find({ role: "agent", status: "active" }).sort({ _id: 1 });
    if (activeAgents.length > 0) {
      const lastAssignedLead = await Lead.findOne({ assignedAgent: { $ne: null } })
        .sort({ createdAt: -1 })
        .select("assignedAgent");

      if (lastAssignedLead && lastAssignedLead.assignedAgent) {
        const lastAgentIndex = activeAgents.findIndex(
          (a: any) => a._id.toString() === lastAssignedLead.assignedAgent!.toString()
        );
        const nextAgentIndex = (lastAgentIndex + 1) % activeAgents.length;
        assignedAgentId = (activeAgents[nextAgentIndex] as any)._id;
      } else {
        assignedAgentId = (activeAgents[0] as any)._id;
      }
    }

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

    const noteEntry = {
      note: `Form submitted: "${form.title}"\nCollected Inputs:\n` + notesList.join("\n"),
      author: "System (Form Builder)",
      createdAt: new Date(),
    };

    const historyEntry = {
      action: "Lead Created (Form)",
      performedBy: "System (Forms)",
      details: `Form "${form.title}" submitted. Mapped via round-robin.`,
      timestamp: new Date(),
    };

    // Save lead to MongoDB
    const lead = await Lead.create({
      name,
      phone: phone || "N/A",
      email: email || `visitor-${Date.now()}@forms.com`,
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabin,
      budget,
      source: "Contact Forms",
      landingPage: form.title,
      notes: [noteEntry],
      tags: ["Form Submission", form.title],
      priority: "Medium",
      assignedAgent: assignedAgentId,
      assignedVendor: assignedVendorId,
      status: assignedAgentId ? "Assigned" : "New",
      history: [historyEntry],
      attachments: [],
    });

    // 1. Send full details email to Admin/Owner
    try {
      await sendLeadNotificationEmail({
        name,
        phone: phone || "N/A",
        email: email || "N/A",
        origin,
        destination,
        departureDate: departureDate ? new Date(departureDate).toDateString() : undefined,
        cabin,
        source: `Form Submission (${form.title})`,
        notes: notesList.join("\n"),
        priority: "Medium",
      });
    } catch (e) {
      console.warn("Admin form email notification failed:", e);
    }

    // 2. Send deal lock confirmation email to Customer
    if (email) {
      try {
        await sendCustomerConfirmationEmail({
          name,
          phone: phone || "N/A",
          email,
          origin,
          destination,
          departureDate: departureDate ? new Date(departureDate).toDateString() : undefined,
          notes: notesList.join("\n"),
        });
      } catch (e) {
        console.warn("Customer form confirmation email failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully!",
      leadId: lead._id,
      redirectUrl: form.redirectUrl || null,
    });
  } catch (error: any) {
    console.error("API forms/:id/submit error:", error);
    return NextResponse.json({ message: "Failed to submit form", error: error.message }, { status: 500 });
  }
}
