import { google } from "googleapis";

// Service account credentials from environment
const sheetsAuth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth: sheetsAuth });

function log(message: any) {
  console.log(`[SHEETS] ${new Date().toLocaleTimeString()} - ${message}`);
}

export async function logBookingToSheet(booking: any, flight: any, sheetId: any) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !sheetId) {
    log("⚠️ Google Sheets config missing - skipping log");
    return { success: false, message: "Sheets not configured" };
  }

  try {
    const row = [
      new Date().toISOString(),
      booking.passengerName,
      booking.email,
      booking.phone,
      booking.passportDetails,
      flight.airline,
      flight.flightNumber,
      flight.origin,
      flight.destination,
      flight.departureTime,
      flight.arrivalTime,
      flight.duration,
      flight.stops,
      `$${(flight.price / 100).toFixed(2)}`,
      "Confirmed",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:O",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    } as any);

    log(`✅ Booking logged to Google Sheets - ${booking.passengerName}`);
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
    // Check if headers exist, add if not
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:O1",
    });

    if (!result.data.values || result.data.values.length === 0) {
      const headers = [
        "Timestamp",
        "Passenger Name",
        "Email",
        "Phone",
        "Passport",
        "Airline",
        "Flight",
        "Origin",
        "Destination",
        "Departure",
        "Arrival",
        "Duration",
        "Stops",
        "Price",
        "Status",
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Sheet1!A1:O1",
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      } as any);

      log(`✅ Sheet initialized with headers`);
    }

    return true;
  } catch (error: any) {
    log(`❌ Failed to initialize sheet: ${error.message}`);
    return false;
  }
}
