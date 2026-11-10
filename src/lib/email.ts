import nodemailer from "nodemailer";
import { format } from "date-fns";
import { siteConfig } from "@/lib/site-config";

const SITE_NAME = siteConfig.name;
const BRAND_NAME = siteConfig.brandName;
const SITE_URL = siteConfig.url;
const PHONE = siteConfig.phone;

const EMAIL_USER = siteConfig.supportEmail;
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true" || EMAIL_PORT === 465;
const EMAIL_FROM = process.env.EMAIL_FROM || `"${BRAND_NAME}" <${EMAIL_USER}>`;

// Dynamic configuration helper so environment changes are always fresh
function getSiteEmailConfig() {
  const siteName = siteConfig.name;
  const brandName = siteConfig.brandName;
  const siteUrl = siteConfig.url;
  const phone = siteConfig.phone;

  const user = process.env.EMAIL_USER || EMAIL_USER;
  const pass = process.env.EMAIL_PASS || EMAIL_PASS;
  const host = process.env.EMAIL_HOST || EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || String(EMAIL_PORT), 10);
  const secure = process.env.EMAIL_SECURE === "true" || port === 465;
  const from = process.env.EMAIL_FROM || `"${brandName}" <${user}>`;

  return { siteName, brandName, siteUrl, phone, user, pass, host, port, secure, from };
}

export async function sendMailWithFallback(mailOptions: any) {
  const config = getSiteEmailConfig();

  if (!config.pass) {
    console.warn(`[EMAIL-SIMULATED] EMAIL_PASS is not configured in .env. Email simulated for: ${mailOptions.to}`);
    console.log(`[EMAIL-DETAILS] Subject: "${mailOptions.subject}" | To: ${mailOptions.to}`);
    return { messageId: `simulated-${Date.now()}` };
  }

  // Primary attempt: Configured port
  const transporter1 = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    const info = await transporter1.sendMail({
      from: config.from,
      ...mailOptions,
    });
    console.log(`[EMAIL-SUCCESS] Delivered via ${config.host}:${config.port} to ${mailOptions.to} - ID: ${info.messageId}`);
    return info;
  } catch (err1: any) {
    console.warn(`[EMAIL-WARN] Port ${config.port} failed (${err1.message}). Retrying via alternative port...`);

    // Fallback attempt: Try alternate port (587 STARTTLS if 465 failed, or 465 SSL if 587 failed)
    const port2 = config.port === 465 ? 587 : 465;
    const secure2 = port2 === 465;

    const transporter2 = nodemailer.createTransport({
      host: config.host,
      port: port2,
      secure: secure2,
      requireTLS: !secure2,
      auth: { user: config.user, pass: config.pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    try {
      const info2 = await transporter2.sendMail({
        from: config.from,
        ...mailOptions,
      });
      console.log(`[EMAIL-SUCCESS] Delivered via ${config.host}:${port2} to ${mailOptions.to} - ID: ${info2.messageId}`);
      return info2;
    } catch (err2: any) {
      console.error(`[EMAIL-ERROR] All SMTP attempts failed for ${mailOptions.to}. Port ${config.port}: ${err1.message} | Port ${port2}: ${err2.message}`);
      throw err2;
    }
  }
}

function safeFormatDate(d: any, fmt: string, fallback: string = "N/A"): string {
  try {
    if (!d) return fallback;
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return fallback;
    return format(dateObj, fmt);
  } catch {
    return fallback;
  }
}

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
  const { user } = getSiteEmailConfig();
  const candidates = [
    user,
    ...parseRecipients(process.env.EMAIL_BOOKINGS_TO),
    ...parseRecipients(process.env.EMAIL_OWNER),
    ...parseRecipients(process.env.ADMIN_EMAIL),
  ];

  return Array.from(new Set(candidates.filter(Boolean) as string[]));
}

// ─────────────────────────────────────────────────────────────────
// ADMIN / OWNER EMAIL TEMPLATE (Flight Booking Request)
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
  const { brandName, phone } = getSiteEmailConfig();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); border: 2px solid #1e293b; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; padding: 32px; text-align: center; border-bottom: 4px solid #2563eb; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .header p { margin: 6px 0 0 0; color: #93c5fd; font-size: 14px; font-weight: 600; }
    .alert-badge { display: inline-block; background: #dc2626; color: #ffffff; font-size: 11px; font-weight: 900; padding: 4px 14px; border-radius: 50px; margin-top: 12px; letter-spacing: 1px; text-transform: uppercase; }
    
    .content { padding: 32px; background: #f8fafc; }
    .section { background: #ffffff; padding: 22px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .section h3 { margin: 0 0 16px 0; color: #0f172a; font-size: 15px; font-weight: 900; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .table-grid { width: 100%; border-collapse: collapse; }
    .table-grid td { padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .table-grid tr:last-child td { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; width: 40%; }
    .value { color: #0f172a; font-weight: 800; text-align: right; width: 60%; }
    
    .price-tag { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 22px; border-radius: 16px; text-align: center; margin-top: 24px; }
    .price-tag .amount { font-size: 32px; font-weight: 900; margin: 4px 0; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; background: #0f172a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="alert-badge">ACTION REQUIRED: TICKET DISPATCH</span>
      <h1>✈️ NEW FLIGHT BOOKING REQUEST</h1>
      <p>${brandName} · Booking Desk</p>
    </div>

    <div class="content">
      <!-- PASSENGER DETAILS -->
      <div class="section">
        <h3>👤 Primary Passenger Details</h3>
        <table class="table-grid">
          <tr><td class="label">Full Name:</td><td class="value">${booking.passengerName}</td></tr>
          <tr><td class="label">Contact Email:</td><td class="value" style="color:#2563eb;"><a href="mailto:${booking.email}">${booking.email}</a></td></tr>
          <tr><td class="label">Contact Phone:</td><td class="value" style="font-size:15px; color:#059669;"><a href="tel:${booking.phone}">${booking.phone || "N/A"}</a></td></tr>
          <tr><td class="label">Passport / ID:</td><td class="value">${booking.passportDetails || "P12345678"}</td></tr>
          ${booking.bornOn ? `<tr><td class="label">Date of Birth:</td><td class="value">${booking.bornOn}</td></tr>` : ""}
          ${booking.cabinPreference ? `<tr><td class="label">Cabin Preference:</td><td class="value">${booking.cabinPreference}</td></tr>` : ""}
          ${booking.specialRequests ? `<tr><td class="label">Special Requests:</td><td class="value">${booking.specialRequests}</td></tr>` : ""}
        </table>
      </div>

      <!-- OUTBOUND FLIGHT ITINERARY -->
      <div class="section">
        <h3>✈️ Outbound Flight Details</h3>
        <table class="table-grid">
          <tr><td class="label">Airline:</td><td class="value">${flight.airline || "Airline Partner"} ${flight.flightNumber || ""}</td></tr>
          <tr><td class="label">Route:</td><td class="value" style="color:#2563eb; font-weight:900;">${flight.origin} ➔ ${flight.destination}</td></tr>
          <tr><td class="label">Departure Date:</td><td class="value">${safeFormatDate(departureDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
          <tr><td class="label">Arrival Date:</td><td class="value">${safeFormatDate(arrivalDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
          <tr><td class="label">Stops:</td><td class="value">${flight.stops === 0 ? "Non-Stop" : `${flight.stops} Stop(s)`}</td></tr>
        </table>
      </div>

      <!-- RETURN FLIGHT ITINERARY (IF ROUND TRIP) -->
      ${returnFlight ? `
      <div class="section">
        <h3>🔄 Return Flight Details</h3>
        <table class="table-grid">
          <tr><td class="label">Airline:</td><td class="value">${returnFlight.airline || flight.airline} ${returnFlight.flightNumber || ""}</td></tr>
          <tr><td class="label">Route:</td><td class="value" style="color:#2563eb; font-weight:900;">${returnFlight.origin} ➔ ${returnFlight.destination}</td></tr>
          <tr><td class="label">Departure Date:</td><td class="value">${safeFormatDate(returnDepartureDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
          <tr><td class="label">Arrival Date:</td><td class="value">${safeFormatDate(returnArrivalDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
          <tr><td class="label">Stops:</td><td class="value">${returnFlight.stops === 0 ? "Non-Stop" : `${returnFlight.stops || 0} Stop(s)`}</td></tr>
        </table>
      </div>
      ` : ""}

      <div class="price-tag">
        <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">Total Fare Amount</div>
        <div class="amount">${formattedPrice}</div>
        <div style="font-size:12px; opacity:0.8;">Taxes & Airline Fees Included</div>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${brandName} Admin Control System · Confidential</p>
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
  const { brandName, phone } = getSiteEmailConfig();

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
    .status-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .badge-flex { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .status-badge-green { display: inline-block; background: #d1fae5; color: #047857; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #a7f3d0; }
    .status-badge-blue { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 50px; border: 1px solid #bfdbfe; }
    
    .section { background: #ffffff; padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .section h3 { margin: 0 0 14px 0; color: #1e3a8a; font-size: 15px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .table-grid { width: 100%; border-collapse: collapse; }
    .table-grid td { padding: 9px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .label { color: #64748b; font-weight: 600; width: 45%; }
    .value { color: #0f172a; font-weight: 800; text-align: right; width: 55%; }
    
    .call-banner { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 24px; border-radius: 16px; text-align: center; margin: 24px 0; }
    .call-btn { display: inline-block; background: #ffffff; color: #047857; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 900; font-size: 16px; margin-top: 12px; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ ${brandName} FLIGHT RESERVATION</h1>
      <p>Confirmed Booking Status & Trip Receipt</p>
    </div>

    <div class="content">
      <div class="status-box">
        <div class="badge-flex">
          <span class="status-badge-green">💳 FARE HOLD CONFIRMED</span>
          <span class="status-badge-blue">⏳ BOOKING UNDER PROCESS</span>
        </div>
        <h2 style="font-size:18px; font-weight:900; margin:0 0 6px 0;">Booking Received & Under Process!</h2>
        <p style="font-size:14px; color:#475569; margin:0; line-height:1.5;">
          Dear <strong>${booking.passengerName}</strong>, your flight booking request has been securely received. <strong>Our ticketing team is preparing your e-ticket itinerary and seat assignment. Updates will be emailed directly to ${booking.email}</strong> shortly.
        </p>
      </div>

      <div class="section">
        <h3>👤 Passenger & Trip Summary</h3>
        <table class="table-grid">
          <tr><td class="label">Passenger Name:</td><td class="value">${booking.passengerName}</td></tr>
          <tr><td class="label">Contact Email:</td><td class="value">${booking.email}</td></tr>
          <tr><td class="label">Phone:</td><td class="value">${booking.phone || "N/A"}</td></tr>
          <tr><td class="label">Operating Airline:</td><td class="value">${flight.airline} ${flight.flightNumber || ""}</td></tr>
          <tr><td class="label">Route:</td><td class="value" style="color:#2563eb; font-weight:900;">${flight.origin} ➔ ${flight.destination}</td></tr>
          <tr><td class="label">Departure Date:</td><td class="value">${safeFormatDate(departureDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
          <tr><td class="label">Arrival Date:</td><td class="value">${safeFormatDate(arrivalDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
          <tr><td class="label">Total Paid Fare:</td><td class="value" style="font-size:16px; color:#059669; font-weight:900;">${formattedPrice}</td></tr>
        </table>
      </div>

      <!-- RETURN LEG IF APPLICABLE -->
      ${returnFlight ? `
      <div class="section">
        <h3>🔄 Return Leg Details</h3>
        <table class="table-grid">
          <tr><td class="label">Operating Airline:</td><td class="value">${returnFlight.airline || flight.airline} ${returnFlight.flightNumber || ""}</td></tr>
          <tr><td class="label">Route:</td><td class="value" style="color:#2563eb; font-weight:900;">${returnFlight.origin} ➔ ${returnFlight.destination}</td></tr>
          <tr><td class="label">Departure Date:</td><td class="value">${safeFormatDate(returnDepartureDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
          <tr><td class="label">Arrival Date:</td><td class="value">${safeFormatDate(returnArrivalDate, "EEE, MMM dd, yyyy · hh:mm a")}</td></tr>
        </table>
      </div>
      ` : ""}

      <div class="call-banner">
        <p style="margin:0; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">NEED IMMEDIATE ASSISTANCE OR SEAT ASSIGNMENT?</p>
        <a href="tel:${phone.replace(/\s+/g, '')}" class="call-btn">📞 Call 24/7 Desk: ${phone}</a>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${brandName} · 24/7 Ticketing Support Hotline: ${phone}</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────
// CONTACT US EMAIL NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────
export async function sendContactMessageEmail({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const adminRecipients = getInternalRecipients();

  // 1. Notify Admin Team
  const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#0f172a; padding:20px; color:#1e293b; }
    .card { max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:2px solid #2563eb; }
    .header { background:#1e3a8a; color:#ffffff; padding:24px 30px; }
    .body { padding:30px; background:#f8fafc; }
    .field { margin-bottom:16px; }
    .label { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px; }
    .value { font-size:15px; font-weight:800; color:#0f172a; }
    .msg-box { background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; font-size:14px; line-height:1.6; color:#334155; margin-top:8px; white-space:pre-wrap; }
    .footer { padding:16px 30px; background:#0f172a; text-align:center; font-size:12px; color:#64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin:0; font-size:20px;">📩 New Customer Contact Message</h2>
      <p style="margin:4px 0 0; color:#93c5fd; font-size:13px;">Received on ${BRAND_NAME} Portal</p>
    </div>
    <div class="body">
      <div class="field"><div class="label">Name</div><div class="value">${name}</div></div>
      <div class="field"><div class="label">Email Address</div><div class="value" style="color:#2563eb;"><a href="mailto:${email}">${email}</a></div></div>
      ${phone ? `<div class="field"><div class="label">Phone</div><div class="value"><a href="tel:${phone}">${phone}</a></div></div>` : ""}
      <div class="field"><div class="label">Subject</div><div class="value">${subject || "Customer Inquiry"}</div></div>
      <div class="field">
        <div class="label">Message</div>
        <div class="msg-box">${message}</div>
      </div>
    </div>
    <div class="footer">${BRAND_NAME} Contact Routing</div>
  </div>
</body>
</html>`;

  // 2. Customer Auto-Acknowledgment Email
  const customerHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f1f5f9; padding:20px; color:#1e293b; }
    .card { max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; }
    .header { background:#1e3a8a; color:#ffffff; padding:28px; text-align:center; }
    .body { padding:28px; }
    .footer { padding:18px; text-align:center; font-size:12px; color:#94a3b8; background:#f8fafc; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin:0; font-size:20px;">Thank You for Contacting Us</h2>
      <p style="margin:4px 0 0; color:#bfdbfe; font-size:13px;">${BRAND_NAME} Customer Support</p>
    </div>
    <div class="body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>We have received your message regarding &ldquo;${subject || "Your Inquiry"}&rdquo;. Our travel support specialists are reviewing your request and will get back to you within 2–4 hours.</p>
      <p>If you have an urgent travel booking or need immediate assistance, please call our 24/7 hotline at <strong style="color:#2563eb;">${PHONE}</strong>.</p>
      <p style="margin-top:24px;">Safe Travels,<br><strong>${BRAND_NAME} Team</strong></p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} ${BRAND_NAME} · <a href="${SITE_URL}">${SITE_URL}</a></div>
  </div>
</body>
</html>`;

  const results = [];

  // Send admin notification
  if (adminRecipients.length > 0) {
    try {
      await sendMailWithFallback({
        to: adminRecipients.join(", "),
        replyTo: email,
        subject: `📩 Contact Message: ${name} — ${subject || "Customer Inquiry"}`,
        html: adminHtml,
        text: `New Contact Message from ${name} (${email}):\n\nSubject: ${subject}\n\nMessage:\n${message}`,
      });
      results.push({ type: "admin", success: true });
    } catch (err: any) {
      console.error("Failed to send admin contact email:", err);
      results.push({ type: "admin", success: false, error: err.message });
    }
  }

  // Send customer confirmation
  if (email && email.includes("@")) {
    try {
      await sendMailWithFallback({
        to: email,
        subject: `Message Received — ${BRAND_NAME} Support`,
        html: customerHtml,
        text: `Hello ${name},\n\nWe have received your message and will respond shortly.\nFor urgent help, call: ${PHONE}\n\n${BRAND_NAME}`,
      });
      results.push({ type: "customer", success: true });
    } catch (err: any) {
      console.error("Failed to send customer confirmation email:", err);
      results.push({ type: "customer", success: false, error: err.message });
    }
  }

  return { success: true, results };
}

// ─────────────────────────────────────────────────────────────────
// BOOKING CONFIRMATION DISPATCHER
// ─────────────────────────────────────────────────────────────────
export async function sendBookingConfirmation(booking: any, flight: any) {
  if (String(process.env.DISABLE_BOOKING_EMAILS || "").toLowerCase() === "true") {
    log("⚠️ Email sending disabled by configuration");
    return { success: false, message: "Email sending disabled by configuration" };
  }

  try {
    const safeFlight = flight || { origin: "NYC", destination: "LAX", airline: "Airline Partner", price: 0 };
    const departureDate = safeFlight.departureTime ? new Date(safeFlight.departureTime) : new Date();
    const arrivalDate = safeFlight.arrivalTime ? new Date(safeFlight.arrivalTime) : new Date();
    const returnFlight = safeFlight.returnFlight || null;
    const returnDepartureDate = returnFlight?.departureTime ? new Date(returnFlight.departureTime) : null;
    const returnArrivalDate = returnFlight?.arrivalTime ? new Date(returnFlight.arrivalTime) : null;

    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format((safeFlight.price || 0) / 100);

    const ownerRecipients = getInternalRecipients();
    const customerRecipient = hasValue(booking.email) ? booking.email.trim() : "";
    const sendResults = [];
    const config = getSiteEmailConfig();

    // 1. Send to Owner / Admin
    if (ownerRecipients.length > 0) {
      const ownerHtml = buildAdminBookingHtml({
        booking,
        flight: safeFlight,
        departureDate,
        arrivalDate,
        returnFlight,
        returnDepartureDate,
        returnArrivalDate,
        formattedPrice,
      });

      try {
        const ownerInfo = await sendMailWithFallback({
          to: ownerRecipients.join(", "),
          subject: `🚨 NEW BOOKING: ${booking.passengerName} (${safeFlight.origin} → ${safeFlight.destination}) - ${formattedPrice}`,
          html: ownerHtml,
          text: `NEW FLIGHT BOOKING\n\nPassenger: ${booking.passengerName}\nPhone: ${booking.phone}\nEmail: ${booking.email}\nRoute: ${safeFlight.origin} -> ${safeFlight.destination}\nPrice: ${formattedPrice}`,
        });
        sendResults.push({ recipient: "owner", success: true, messageId: ownerInfo.messageId });
      } catch (ownerError: any) {
        sendResults.push({ recipient: "owner", success: false, message: ownerError.message });
      }
    }

    // 2. Send to Customer
    if (customerRecipient) {
      const customerHtml = buildCustomerBookingHtml({
        booking,
        flight: safeFlight,
        departureDate,
        arrivalDate,
        returnFlight,
        returnDepartureDate,
        returnArrivalDate,
        formattedPrice,
      });

      try {
        const customerInfo = await sendMailWithFallback({
          to: customerRecipient,
          subject: `✈️ Booking Received: ${safeFlight.origin} to ${safeFlight.destination} (${booking.passengerName})`,
          html: customerHtml,
          text: `Booking Received\n\nDear ${booking.passengerName},\nYour flight from ${safeFlight.origin} to ${safeFlight.destination} is being processed.\nSupport: ${config.phone}`,
        });
        sendResults.push({ recipient: "customer", success: true, messageId: customerInfo.messageId });
      } catch (customerError: any) {
        sendResults.push({ recipient: "customer", success: false, message: customerError.message });
      }
    }

    const anySuccess = sendResults.some((r) => r.success);
    return { success: anySuccess, results: sendResults };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────
// PASSWORD RESET EMAIL
// ─────────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f7ff; margin: 0; padding: 20px; }
    .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 32px; text-align: center; }
    .btn { display: inline-block; margin: 24px 0; background: #2563eb; color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 15px; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>🔐 Reset Your Password</h1></div>
    <div class="body">
      <p>You requested a password reset for your ${BRAND_NAME} account.<br>Click the button below to set a new password (expires in 1 hour).</p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <p style="font-size:12px; color:#9ca3af;">If you didn't request this, ignore this email.</p>
    </div>
    <div class="footer">${BRAND_NAME} Security Desk</div>
  </div>
</body>
</html>`;

  try {
    await sendMailWithFallback({
      to: email,
      subject: `🔐 Reset Your ${BRAND_NAME} Password`,
      html,
      text: `Reset your ${BRAND_NAME} password:\n${resetLink}`,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────
// LEAD NOTIFICATION & CUSTOMER CONFIRMATION EMAILS
// ─────────────────────────────────────────────────────────────────
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
  if (owners.length === 0) return { success: false, message: "No recipients configured" };

  const html = `
    <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
      <h2 style="color:#1e3a8a; margin-top:0;">🔔 New Travel Lead Received</h2>
      <p>A new customer travel inquiry has been registered on <strong>${BRAND_NAME}</strong>.</p>
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <tr><td style="padding:8px 0; color:#64748b; font-weight:bold;">Name:</td><td style="font-weight:bold;">${lead.name}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b; font-weight:bold;">Phone:</td><td style="color:#059669; font-weight:bold;">${lead.phone}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b; font-weight:bold;">Email:</td><td style="color:#2563eb;">${lead.email}</td></tr>
        <tr><td style="padding:8px 0; color:#64748b; font-weight:bold;">Route:</td><td>${lead.origin || "—"} ➔ ${lead.destination || "—"}</td></tr>
        ${lead.departureDate ? `<tr><td style="padding:8px 0; color:#64748b; font-weight:bold;">Departure Date:</td><td>${lead.departureDate}</td></tr>` : ""}
        ${lead.cabin ? `<tr><td style="padding:8px 0; color:#64748b; font-weight:bold;">Cabin Class:</td><td>${lead.cabin}</td></tr>` : ""}
        ${lead.source ? `<tr><td style="padding:8px 0; color:#64748b; font-weight:bold;">Source:</td><td>${lead.source}</td></tr>` : ""}
      </table>
      ${lead.notes ? `
        <div style="margin-top:16px; padding:12px; background:#ffffff; border-radius:8px; border:1px solid #cbd5e1;">
          <strong>Notes:</strong><br/>
          <pre style="white-space:pre-wrap; font-family:sans-serif; margin-top:6px; color:#334155;">${lead.notes}</pre>
        </div>` : ""}
      <p style="margin-top:20px; font-size:12px; color:#94a3b8; text-align:center;">${BRAND_NAME} Admin Dispatch</p>
    </div>
  `;

  try {
    await sendMailWithFallback({
      to: owners.join(", "),
      replyTo: lead.email && lead.email.includes("@") ? lead.email : undefined,
      subject: `🔔 New Lead: ${lead.name} — ${lead.origin || "Origin"} ➔ ${lead.destination || "Destination"}`,
      html,
      text: `New Lead: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nRoute: ${lead.origin} -> ${lead.destination}`,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function sendCustomerConfirmationEmail(lead: {
  name: string;
  phone?: string;
  email: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  notes?: string;
}) {
  if (!lead.email || lead.email.includes("@guest.") || lead.email.includes("@forms.")) {
    return { success: false, message: "No customer email provided" };
  }

  const html = `
    <div style="font-family:sans-serif; max-width:540px; margin:0 auto; padding:24px; background:#ffffff; border-radius:16px; border:1px solid #e2e8f0;">
      <h2 style="color:#1e3a8a; margin-top:0;">✈️ Request Received — ${BRAND_NAME}</h2>
      <p>Dear <strong>${lead.name}</strong>,</p>
      <p>Thank you for submitting your travel request for <strong>${lead.origin || "your departure"} ➔ ${lead.destination || "your destination"}</strong>.</p>
      <p>Our travel booking specialists are checking unpublished airline contract fares and will get in touch with you shortly.</p>
      <div style="margin:24px 0; padding:16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; text-align:center;">
        <p style="margin:0; font-size:13px; font-weight:bold; color:#166534;">NEED INSTANT ASSISTANCE?</p>
        <p style="margin:6px 0 0; font-size:18px; font-weight:bold; color:#15803d;">📞 ${PHONE}</p>
      </div>
      <p style="font-size:13px; color:#64748b;">Warm regards,<br/><strong>${BRAND_NAME} Support Team</strong></p>
    </div>
  `;

  try {
    await sendMailWithFallback({
      to: lead.email,
      subject: `✈️ Travel Request Received: ${lead.destination || "Flight Deals"} (${BRAND_NAME})`,
      html,
      text: `Dear ${lead.name},\nYour travel request has been received. Our agents will contact you shortly.\nCall 24/7: ${PHONE}\n\n${BRAND_NAME}`,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────
// VERIFY TRANSPORTER / TEST CONFIG
// ─────────────────────────────────────────────────────────────────
export async function testEmailConfig(customConfig?: any) {
  const config = customConfig || getSiteEmailConfig();

  if (!config.pass) {
    throw new Error("EMAIL_PASS is empty. Please enter your SMTP password or Gmail App Password.");
  }

  try {
    const t = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    await t.verify();
    log("✅ Email configuration is valid");
    return true;
  } catch (error: any) {
    log(`❌ Email configuration error: ${error.message}`);
    throw error;
  }
}
