export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase, getDb } from "@/lib/db";
import { Lead } from "@/models/Lead";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const { payment_status, order_id, actually_paid, pay_currency, payment_id } = body;
    console.log(`[NOWPayments Webhook] Received for Order: ${order_id}, Status: ${payment_status}, Paid: ${actually_paid} ${pay_currency}`);

    // Optional IPN Signature verification if NOWPAYMENTS_IPN_KEY is set
    const ipnKey = process.env.NOWPAYMENTS_IPN_KEY;
    const receivedSig = request.headers.get("x-nowpayments-sig");
    if (ipnKey && receivedSig) {
      const hmac = crypto.createHmac("sha512", ipnKey);
      // Sort keys alphabetically as required by NOWPayments IPN spec
      const sortedKeys = Object.keys(body).sort();
      const sortedObj: any = {};
      for (const k of sortedKeys) sortedObj[k] = body[k];
      hmac.update(JSON.stringify(sortedObj));
      const calculatedSig = hmac.digest("hex");
      if (calculatedSig !== receivedSig) {
        console.warn("[NOWPayments Webhook] Invalid IPN signature");
        return NextResponse.json({ message: "Signature mismatch" }, { status: 401 });
      }
    }

    if (!order_id) {
      return NextResponse.json({ message: "Missing order_id" }, { status: 400 });
    }

    await connectToDatabase();
    const db = await getDb();

    // Determine normalized status
    const isPaid = payment_status === "finished" || payment_status === "confirmed";
    const paymentStatusNormalized = isPaid ? "Paid" : payment_status === "failed" ? "Failed" : "Processing";

    // Update Booking in DB
    await db.collection("bookings").updateOne(
      { bookingId: order_id },
      {
        $set: {
          paymentStatus: paymentStatusNormalized,
          nowpaymentsId: payment_id,
          actuallyPaid: actually_paid,
          cryptoCurrency: pay_currency,
          rawWebhookData: body,
          updatedAt: new Date(),
        },
      }
    );

    // Update CRM Lead
    const lead = await Lead.findOne({
      "notes.note": { $regex: order_id, $options: "i" },
    });

    if (lead) {
      if (isPaid) {
        lead.status = "Booked";
        lead.notes.push({
          note: `🎉 Payment SUCCESS via NOWPayments! Amount: ${actually_paid} ${pay_currency}. Transaction ID: ${payment_id}. Order: ${order_id}. Ready for ticket dispatch.`,
          author: "NOWPayments Webhook",
          createdAt: new Date(),
        });
        lead.history.push({
          action: "Payment Confirmed (NOWPayments)",
          performedBy: "Webhook",
          details: `Order: ${order_id}, Status: ${payment_status}`,
          timestamp: new Date(),
        });
        await lead.save();
      }
    }

    return NextResponse.json({ success: true, order_id, paymentStatus: paymentStatusNormalized });
  } catch (error: any) {
    console.error("[NOWPayments Webhook] Error:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
