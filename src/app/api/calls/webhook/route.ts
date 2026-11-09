import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Call } from "@/models/Call";
import { Lead } from "@/models/Lead";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let params: Record<string, string> = {};

    // Twilio submits payloads as application/x-www-form-urlencoded
    if (contentType.includes("form")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        params[key] = String(value);
      });
    } else {
      params = await request.json().catch(() => ({}));
    }

    const callSid = params.CallSid;
    const from = params.From || "";
    const to = params.To || "";
    const callStatus = params.CallStatus || "Completed";
    const recordingUrl = params.RecordingUrl || "";
    const duration = parseInt(params.DialCallDuration || params.CallDuration || "0", 10);

    if (!callSid) {
      return NextResponse.json({ message: "Missing CallSid parameter" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Resolve CRM Lead based on caller phone number
    let lead = await Lead.findOne({ phone: from });

    if (!lead && from) {
      // Auto-create lead for incoming telephony call
      lead = await Lead.create({
        name: `Telephony Caller (${from})`,
        phone: from,
        email: `caller-${Date.now()}@telephony.com`,
        source: "Call Tracking",
        notes: [
          {
            note: `Incoming telephony call received to target number: ${to}`,
            author: "System (Webhook)",
            createdAt: new Date(),
          },
        ],
        tags: ["Inbound Call", "Telephony"],
        priority: "High",
        status: "New",
        history: [
          {
            action: "Lead Created (Telephony)",
            performedBy: "System (Telephony Webhook)",
            details: `Auto-generated lead via inbound call`,
            timestamp: new Date(),
          },
        ],
        attachments: [],
      });
    }

    // 2. Insert or update the Call Log in DB
    let callLog = await Call.findOne({ twilioCallSid: callSid });

    const statusMapping: Record<string, any> = {
      queued: "Clicked",
      ringing: "Ringing",
      "in-progress": "Answered",
      completed: "Completed",
      busy: "Failed",
      failed: "Failed",
      "no-answer": "Missed",
      canceled: "Missed",
    };

    const finalStatus = statusMapping[callStatus.toLowerCase()] || "Completed";

    if (callLog) {
      callLog.status = finalStatus;
      callLog.duration = duration;
      if (recordingUrl) {
        callLog.recordingUrl = recordingUrl;
      }
      if (lead) {
        callLog.leadId = lead._id as any;
      }
      await callLog.save();
    } else {
      callLog = await Call.create({
        twilioCallSid: callSid,
        numberDialed: to,
        duration,
        status: finalStatus,
        recordingUrl,
        clickTimestamp: new Date(),
        leadId: lead ? lead._id : null,
      });
    }

    // Update Lead activity history log
    if (lead) {
      lead.history.push({
        action: `Call ${finalStatus}`,
        performedBy: "System (Telephony)",
        details: `Telephony call reference SID: ${callSid} | Duration: ${duration} seconds | Status: ${callStatus}`,
        timestamp: new Date(),
      });
      await lead.save();
    }

    // Return TwiML response to dial forwarding or play a welcome greeting
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "text/xml");

    // Standard TwiML forwarding structure:
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting you to a travel expert at JetWithFly Flights. Your call may be recorded for quality assurance.</Say>
  <Dial record="record-from-answer" recordingStatusCallback="/api/calls/webhook">
    <!-- Call forwarding destination (Replace with actual target agent number or vendor) -->
    <Number>+18005542500</Number>
  </Dial>
</Response>`;

    return new Response(twiml, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("API calls/webhook error:", error);
    return NextResponse.json({ message: "Webhook processing failed", error: error.message }, { status: 500 });
  }
}
