import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WhatsApp } from "@/models/WhatsApp";
import { Lead } from "@/models/Lead";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, message, toNumber } = body;

    if (!leadId || !message || !toNumber) {
      return NextResponse.json({ message: "Missing leadId, message, or toNumber" }, { status: 400 });
    }

    await connectToDatabase();

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // 1. Log outgoing WhatsApp message
    const chatLog = await WhatsApp.create({
      fromNumber: process.env.WHATSAPP_SENDER_NUMBER || "+18005542500",
      toNumber,
      message,
      direction: "outgoing",
      timestamp: new Date(),
      leadId: lead._id,
    });

    // 2. Append history audit to Lead
    lead.history.push({
      action: "WhatsApp Sent",
      performedBy: session.user?.name || "System",
      details: `WhatsApp message dispatched: "${message.substring(0, 60)}${message.length > 60 ? "..." : ""}"`,
      timestamp: new Date(),
    });
    await lead.save();

    // 3. Mock external API dispatch (Twilio WhatsApp API / Meta Cloud API)
    // Under production, fetch("https://api.twilio.com/...", { body: ... }) would run here.
    console.log(`[WhatsApp Sandbox] Message dispatched to ${toNumber}: ${message}`);

    return NextResponse.json({
      success: true,
      message: "WhatsApp message successfully sent and logged.",
      chat: chatLog,
    });
  } catch (error: any) {
    console.error("API admin/whatsapp POST error:", error);
    return NextResponse.json({ message: "Failed to dispatch WhatsApp", error: error.message }, { status: 500 });
  }
}
