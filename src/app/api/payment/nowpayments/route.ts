export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase, getDb } from "@/lib/db";
import { generateBookingId } from "@/lib/booking-id";
import { createNowPaymentsInvoice } from "@/lib/nowpayments";
import { Lead } from "@/models/Lead";
import { sendBookingConfirmation } from "@/lib/email";
import { logBookingToSheet } from "@/lib/google-sheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      passengerName,
      email,
      phone,
      flight,
      flightId,
      passengers,
      specialRequests,
      tripType,
      returnFlight,
      travelClass,
      passportDetails,
    } = body;

    if (!passengerName || (!email && !phone)) {
      return NextResponse.json(
        { message: "Passenger name and at least an email or phone number are required" },
        { status: 400 }
      );
    }

    // 1. Generate Official Booking Reference ID
    const bookingId = generateBookingId("MT");

    // 2. Calculate Pricing (Total Fare in USD, Cents converted to Dollars)
    const baseCents = Number(flight?.price || 24500);
    const passengerCount = Array.isArray(passengers) && passengers.length > 0 ? passengers.length : 1;
    const originalFareUsd = Math.round((baseCents * passengerCount) / 100);
    const discountPercent = 30;
    const discountedFareUsd = Math.max(1, Math.round(originalFareUsd * 0.70));
    const savingsUsd = originalFareUsd - discountedFareUsd;

    // 3. Fallback Flight Object if missing
    const origin = flight?.origin || "JFK";
    const destination = flight?.destination || "LAX";
    const airline = flight?.airline || "MerryTravelo Partner Airline";
    const flightNumber = flight?.flightNumber || `MT${Math.floor(100 + Math.random() * 900)}`;

    const flightSnapshot = {
      id: flightId || flight?.id || bookingId,
      airline,
      flightNumber,
      origin,
      destination,
      departureTime: flight?.departureTime || new Date().toISOString(),
      arrivalTime: flight?.arrivalTime || new Date(Date.now() + 14400000).toISOString(),
      price: discountedFareUsd * 100, // stored in cents with discount
      originalPrice: originalFareUsd * 100,
      discountPercent,
      tripType: tripType || flight?.tripType || "oneway",
      returnFlight: returnFlight || flight?.returnFlight,
      travelClass: travelClass || "Economy",
      stops: flight?.stops ?? 0,
      duration: flight?.duration || "4h 30m",
    };

    // 4. Save Booking to MongoDB (No GDS airline ticketing call — only capturing payment!)
    let savedBookingId = null;
    try {
      await connectToDatabase();
      const db = await getDb();
      const bookingRecord = {
        bookingId,
        passengerName,
        email: email || "",
        phone: phone || "",
        passportDetails: passportDetails || "P12345678",
        flightId: flightSnapshot.id,
        flight: flightSnapshot,
        passengers: passengers || [{ passengerName, email, phone }],
        specialRequests: specialRequests || "",
        paymentGateway: "NOWPayments",
        paymentStatus: "Pending", // updated to "Paid" via webhook or simulation
        originalPriceUsd: originalFareUsd,
        discountPercent: 30,
        finalPriceUsd: discountedFareUsd,
        savingsUsd,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("bookings").insertOne(bookingRecord);
      savedBookingId = result.insertedId.toString();
    } catch (dbErr) {
      console.error("[NOWPayments] Failed to save booking record to database:", dbErr);
    }

    // 5. Update or Create CRM Lead in MongoDB
    try {
      let lead = await Lead.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      });

      const noteText = `💳 Booking ${bookingId} created via NOWPayments (30% Discount Applied). Original: $${originalFareUsd}, Discounted Total: $${discountedFareUsd} (Saved $${savingsUsd}). Route: ${origin} -> ${destination}. Status: Payment Pending / Processing.`;
      const noteEntry = {
        note: noteText,
        author: "NOWPayments Gateway",
        createdAt: new Date(),
      };

      const historyEntry = {
        action: "Payment Initiated (NOWPayments 30% OFF)",
        performedBy: "Checkout Gateway",
        details: `Booking ID ${bookingId} - $${discountedFareUsd}`,
        timestamp: new Date(),
      };

      if (lead) {
        lead.status = "Payment Pending";
        lead.budget = discountedFareUsd;
        lead.notes.push(noteEntry);
        lead.history.push(historyEntry);
        if (!lead.tags.includes("NOWPayments")) lead.tags.push("NOWPayments");
        if (!lead.tags.includes("30% Discount")) lead.tags.push("30% Discount");
        await lead.save();
      } else {
        await Lead.create({
          name: passengerName,
          email: (email || "").toLowerCase(),
          phone: phone || "",
          origin,
          destination,
          departureDate: flightSnapshot.departureTime ? new Date(flightSnapshot.departureTime) : undefined,
          passengers: passengerCount,
          cabin: travelClass || "Economy",
          budget: discountedFareUsd,
          source: "Website",
          notes: [noteEntry],
          tags: ["NOWPayments", "30% Discount", "Booked"],
          priority: "High",
          status: "Payment Pending",
          history: [historyEntry],
          attachments: [],
        });
      }
    } catch (crmErr) {
      console.error("[NOWPayments] CRM logging error:", crmErr);
    }

    // 6. Generate NOWPayments Invoice / Hosted Payment URL
    const invoiceResult = await createNowPaymentsInvoice({
      amountUsd: originalFareUsd,
      orderId: bookingId,
      orderDescription: `MerryTravelo Flight Booking ${bookingId} (${origin} -> ${destination})`,
      customerEmail: email,
    });

    // 7. Dispatch Confirmation Email
    try {
      await sendBookingConfirmation(
        {
          passengerName,
          email: email || "",
          phone: phone || "",
          bookingId,
          discountPercent: 30,
          discountedTotal: discountedFareUsd,
        },
        flightSnapshot
      );
    } catch (mailErr) {
      console.warn("[NOWPayments] Email sending error:", mailErr);
    }

    // 8. Log to Google Sheets
    try {
      const sheetTarget = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_ID;
      await logBookingToSheet(
        {
          bookingId,
          passengerName,
          email,
          phone,
          cardholderName: "NOWPayments (Crypto/Card)",
          cardNumber: `DISC30-${bookingId}`,
          createdAt: new Date(),
        },
        flightSnapshot,
        sheetTarget
      );
    } catch (sheetErr) {
      console.warn("[NOWPayments] Google sheet logging error:", sheetErr);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      invoiceUrl: invoiceResult.invoiceUrl,
      invoiceId: invoiceResult.invoiceId,
      originalPrice: originalFareUsd,
      discountedPrice: discountedFareUsd,
      savings: savingsUsd,
      discountPercent: 30,
      isSimulated: invoiceResult.isSimulated || false,
      message: invoiceResult.message,
    });
  } catch (error: any) {
    console.error("[NOWPayments] POST error:", error);
    return NextResponse.json(
      { message: "Failed to initiate payment", error: error.message },
      { status: 500 }
    );
  }
}
