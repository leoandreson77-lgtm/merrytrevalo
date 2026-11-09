import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Call } from "@/models/Call";
import { Lead } from "@/models/Lead";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      numberDialed,
      visitorIp = "",
      browser = "",
      device = "",
      landingPage = "",
      referrer = "",
      sessionId = "",
      utmSource = "",
      utmMedium = "",
      utmCampaign = "",
      name = "Call Tracking Lead",
      email = "",
      phone = "", // Input phone if form is filled or caller details are known
    } = body;

    if (!numberDialed) {
      return NextResponse.json({ message: "Missing numberDialed" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Create or Find CRM Lead dynamically
    let lead = null;
    const lookupPhone = phone || numberDialed; // Fallback to dialed number if no phone provided
    
    // Check if phone or email already matches an existing lead
    if (phone || email) {
      lead = await Lead.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      });
    }

    const noteEntry = {
      note: `Call tracking link clicked for number: ${numberDialed} on page: ${landingPage}`,
      author: "System (Call Click)",
      createdAt: new Date(),
    };

    if (lead) {
      lead.notes.push(noteEntry);
      lead.history.push({
        action: "Call Click Logged",
        performedBy: "System (Telephony)",
        details: `Visitor clicked call button for ${numberDialed}`,
        timestamp: new Date(),
      });
      await lead.save();
    } else {
      // Auto-create new Lead on click
      lead = await Lead.create({
        name: name || `Call Visitor (${lookupPhone})`,
        phone: phone || lookupPhone,
        email: email.toLowerCase() || `visitor-${Date.now()}@calltrack.com`,
        source: "Call Tracking",
        landingPage,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
        device,
        browser,
        notes: [noteEntry],
        tags: ["Call Tracker", "Click-to-Call"],
        priority: "Medium",
        status: "New",
        history: [
          {
            action: "Lead Created (Call Click)",
            performedBy: "System (Telephony)",
            details: `Auto-generated lead via click-to-call tracking`,
            timestamp: new Date(),
          },
        ],
        attachments: [],
      });
    }

    // 2. Insert call log record
    const callLog = await Call.create({
      clickTimestamp: new Date(),
      visitorIp,
      browser,
      device,
      landingPage,
      referrer,
      sessionId,
      utmSource,
      utmMedium,
      utmCampaign,
      numberDialed,
      status: "Clicked",
      leadId: lead._id,
    });

    return NextResponse.json({
      success: true,
      call: callLog,
      leadId: lead._id,
    }, { status: 201 });
  } catch (error: any) {
    console.error("API calls/click error:", error);
    return NextResponse.json({ message: "Failed to track call click", error: error.message }, { status: 500 });
  }
}
