import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WhatsApp } from "@/models/WhatsApp";
import { Lead } from "@/models/Lead";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let params: Record<string, string> = {};

    if (contentType.includes("form")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        params[key] = String(value);
      });
    } else {
      params = await request.json().catch(() => ({}));
    }

    // Twilio WhatsApp params: From (whatsapp:+123456789), To (whatsapp:+198765432), Body
    const fromRaw = params.From || "";
    const toRaw = params.To || "";
    const body = params.Body || "";

    const from = fromRaw.replace("whatsapp:", "").trim();
    const to = toRaw.replace("whatsapp:", "").trim();

    if (!from || !body) {
      return NextResponse.json({ message: "Missing From or Body parameters" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Find matching lead by sender's phone number
    let lead = await Lead.findOne({ phone: from });

    const firstTimeContact = !lead;

    if (!lead) {
      // Auto-create CRM lead
      lead = await Lead.create({
        name: `WhatsApp Contact (${from})`,
        phone: from,
        email: `wa-${Date.now()}@whatsapp.com`,
        source: "WhatsApp",
        notes: [
          {
            note: `Initial WhatsApp message received: "${body}"`,
            author: "System (WhatsApp Webhook)",
            createdAt: new Date(),
          },
        ],
        tags: ["WhatsApp", "Inbound Chat"],
        priority: "Medium",
        status: "New",
        history: [
          {
            action: "Lead Created (WhatsApp)",
            performedBy: "System (WhatsApp Webhook)",
            details: `Auto-generated lead via inbound WhatsApp text`,
            timestamp: new Date(),
          },
        ],
        attachments: [],
      });
    } else {
      // Log lead update notes
      lead.notes.push({
        note: `WhatsApp Chat received: "${body}"`,
        author: "System (WhatsApp Webhook)",
        createdAt: new Date(),
      });
      lead.history.push({
        action: "WhatsApp Received",
        performedBy: "System (WhatsApp)",
        details: `Message received: "${body.substring(0, 50)}${body.length > 50 ? "..." : ""}"`,
        timestamp: new Date(),
      });
      await lead.save();
    }

    // 2. Log message record
    await WhatsApp.create({
      fromNumber: from,
      toNumber: to,
      message: body,
      direction: "incoming",
      timestamp: new Date(),
      leadId: lead._id,
    });

    // 3. Auto-Greeting Follow Up (Auto greeting templates triggered if first time contact)
    if (firstTimeContact) {
      const autoGreeting = "Hello! Thanks for contacting JetWithFly Flights travel experts. We've received your request and an agent will follow up with custom flight quotes shortly.";
      
      // Save outgoing greeting
      await WhatsApp.create({
        fromNumber: to,
        toNumber: from,
        message: autoGreeting,
        direction: "outgoing",
        templateId: "welcome_greeting_01",
        timestamp: new Date(),
        leadId: lead._id,
      });

      lead.history.push({
        action: "Auto-Greeting Dispatched",
        performedBy: "System (WhatsApp CRM)",
        details: "Dispatched template: welcome_greeting_01",
        timestamp: new Date(),
      });
      await lead.save();

      // In production, execute WhatsApp sandbox API post:
      console.log(`[WhatsApp Sandbox Auto-Reply] Sent greeting to ${from}: "${autoGreeting}"`);
    }

    return NextResponse.json({ success: true, message: "Webhook logged successfully" });
  } catch (error: any) {
    console.error("API whatsapp/webhook error:", error);
    return NextResponse.json({ message: "Webhook process failed", error: error.message }, { status: 500 });
  }
}
