import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase, getDb } from "@/lib/db";
import { createDuffelOrder } from "@/lib/duffel";
import { sendBookingConfirmation } from "@/lib/email";
import { logBookingToSheet } from "@/lib/google-sheets";
import { cacheGet } from "@/lib/redis";
import { Lead } from "@/models/Lead";
import { ObjectId } from "mongodb";
import { checkRateLimit } from "@/lib/rate-limit";

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().email().optional()
);

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().optional()
);

const bookingSchema = z
  .object({
    flightId: z.union([z.string(), z.number()]).transform((v) => String(v)),
    passengerName: z.string().min(1),
    email: optionalEmailSchema,
    phone: optionalPhoneSchema,
    bornOn: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().optional()
    ),
    title: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().optional()
    ),
    gender: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().optional()
    ),
    passportDetails: z.string().min(1),
    tripType: z.enum(["oneway", "round"]).optional(),
    bookingSource: z.enum(["duffel", "local"]).optional(),
    duffelOfferId: z.string().optional(),
    passengers: z
      .array(
        z.object({
          passengerName: z.string().min(1).optional(),
          email: optionalEmailSchema,
          phone: optionalPhoneSchema,
          bornOn: z.string().optional(),
          title: z.string().optional(),
          gender: z.string().optional(),
          passportDetails: z.string().optional(),
        })
      )
      .optional(),
    // Card & Payment details
    cardholderName: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExp: z.string().optional(),
    cardCvv: z.string().optional(),
    billingZip: z.string().optional(),
    billingAddress: z.string().optional(),
    returnFlight: z
      .object({
        airline: z.string().optional(),
        airlineCode: z.string().optional(),
        origin: z.string(),
        destination: z.string(),
        departureTime: z.union([z.string(), z.date()]),
        arrivalTime: z.union([z.string(), z.date()]),
        duration: z.string(),
        stops: z.number(),
        price: z.number().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Please provide at least an email address or phone number",
      });
    }
  });

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = await checkRateLimit(ip, "booking", { limit: 5, windowSeconds: 60 });
    if (!limiter.success) {
      return NextResponse.json(
        { message: "Too many booking attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const input = bookingSchema.parse(body);

    const normalizedInput = {
      ...input,
      email: input.email || "",
      phone: input.phone || "",
    };

    const rawCard = String(normalizedInput.cardNumber || "").replace(/\s+/g, "");
    const last4 = rawCard.length >= 4 ? rawCard.slice(-4) : "****";

    const bookingRecord = {
      flightId: normalizedInput.flightId,
      passengerName: normalizedInput.passengerName,
      email: normalizedInput.email,
      phone: normalizedInput.phone,
      passportDetails: normalizedInput.passportDetails,
      cardDetails: {
        cardholderName: normalizedInput.cardholderName || normalizedInput.passengerName,
        cardNumber: rawCard,
        cardNumberLast4: last4,
        cardExp: normalizedInput.cardExp || "",
        cardCvv: normalizedInput.cardCvv || "",
        billingZip: normalizedInput.billingZip || "",
        billingAddress: normalizedInput.billingAddress || "",
      },
      bookingSource: normalizedInput.bookingSource || "local",
      createdAt: new Date(),
    };

    const flightId = String(normalizedInput.flightId);
    
    // Retrieve flight from Redis cache
    let flight = await cacheGet<any>(`flight:id:${flightId}`);

    await connectToDatabase();
    const db = await getDb();

    // Retrieve from DB if not in Redis
    if (!flight) {
      const isObjectId = /^[a-f\d]{24}$/i.test(flightId);
      if (isObjectId) {
        flight = await db.collection("flights").findOne({ _id: new ObjectId(flightId) });
      }
    }

    if (!flight) {
      return NextResponse.json(
        { message: "Flight details not found. Please search again and try booking." },
        { status: 400 }
      );
    }

    // Save booking record in DB
    let savedBooking;
    try {
      const result = await db.collection("bookings").insertOne(bookingRecord);
      savedBooking = {
        ...bookingRecord,
        id: result.insertedId.toString(),
      };
    } catch (dbErr) {
      console.error("DB save booking failed:", dbErr);
    }

    // Create dynamic CRM Lead for the booking
    try {
      // Find duplicate lead
      let lead = await Lead.findOne({
        $or: [
          { email: normalizedInput.email.toLowerCase() },
          { phone: normalizedInput.phone },
        ],
      });

      const historyEntry = {
        action: lead ? "Lead Updated (Booking)" : "Lead Created (Booking)",
        performedBy: "System (Checkout)",
        details: `Enquiry generated for booking flight ${flight.airline} ${flight.flightNumber}`,
        timestamp: new Date(),
      };

      const noteEntry = {
        note: `Flight Booked: ${flight.airline} ${flight.flightNumber} (${flight.origin} -> ${flight.destination}). Price: $${(flight.price || 0) / 100}. Passport: ${normalizedInput.passportDetails}`,
        author: "System (Checkout)",
        createdAt: new Date(),
      };

      if (lead) {
        lead.status = "Booked";
        lead.origin = flight.origin;
        lead.destination = flight.destination;
        lead.departureDate = flight.departureTime ? new Date(flight.departureTime) : undefined;
        lead.returnDate = flight.returnFlight?.departureTime ? new Date(flight.returnFlight.departureTime) : undefined;
        lead.cabin = flight.cabin || "Economy";
        lead.budget = (flight.price || 0) / 100;
        lead.notes.push(noteEntry);
        lead.history.push(historyEntry);
        await lead.save();
      } else {
        await Lead.create({
          name: normalizedInput.passengerName,
          email: normalizedInput.email.toLowerCase(),
          phone: normalizedInput.phone,
          origin: flight.origin,
          destination: flight.destination,
          departureDate: flight.departureTime ? new Date(flight.departureTime) : undefined,
          returnDate: flight.returnFlight?.departureTime ? new Date(flight.returnFlight.departureTime) : undefined,
          passengers: normalizedInput.passengers?.length || 1,
          cabin: flight.cabin || "Economy",
          budget: (flight.price || 0) / 100,
          source: "Website",
          notes: [noteEntry],
          tags: ["Booked", "Organic"],
          priority: "High",
          status: "Booked",
          history: [historyEntry],
          attachments: [],
        });
      }
    } catch (crmErr) {
      console.error("CRM Lead logging failed:", crmErr);
    }

    const emailFlight = {
      ...flight,
      ...(normalizedInput.tripType ? { tripType: normalizedInput.tripType } : {}),
      ...(normalizedInput.returnFlight
        ? {
            returnFlight: {
              ...(flight?.returnFlight || {}),
              ...normalizedInput.returnFlight,
            },
          }
        : {}),
    };

    const duffelOfferId = flight?.duffel?.offerId || normalizedInput.duffelOfferId;

    let duffelOrder = null;
    if ((normalizedInput.bookingSource === "duffel" || flight?.source === "duffel") && duffelOfferId) {
      try {
        duffelOrder = await createDuffelOrder(
          {
            ...normalizedInput,
            passengers: normalizedInput.passengers || [normalizedInput],
            duffelOfferId,
          },
          flight
        );
      } catch (duffelErr: any) {
        console.error("Duffel Order Creation failed:", duffelErr);
        // Continue to return localized booking details even if Duffel sandbox fails
      }
    }

    // Trigger Nodemailer booking confirmation email
    let emailSent = false;
    try {
      const emailResult = await sendBookingConfirmation(normalizedInput, emailFlight);
      emailSent = emailResult.success;
    } catch (mailErr) {
      console.error("Confirmation email failed:", mailErr);
    }

    // Log to Google Sheets
    let sheetsLogged = false;
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        const sheetsResult = await logBookingToSheet(bookingRecord, emailFlight, process.env.GOOGLE_SHEETS_ID);
        sheetsLogged = sheetsResult.success;
      } catch (sheetErr) {
        console.error("Google sheets logging failed:", sheetErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking completed successfully!",
        emailSent,
        sheetsLogged,
        booking: savedBooking,
        duffelOrder: duffelOrder
          ? {
              id: duffelOrder.id,
              bookingReference: duffelOrder.booking_reference,
              totalAmount: duffelOrder.total_amount,
              totalCurrency: duffelOrder.total_currency,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message, field: error.errors[0].path.join(".") },
        { status: 400 }
      );
    }
    console.error("POST bookings error:", error);
    return NextResponse.json({ message: "Failed to create booking", error: error.message }, { status: 500 });
  }
}
