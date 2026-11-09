import nodemailer from "nodemailer";
import { format } from "date-fns";

const isProduction = process.env.NODE_ENV === "production";

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

function log(message) {
  console.log(`[EMAIL] ${new Date().toLocaleTimeString()} - ${message}`);
}

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseRecipients(value) {
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

  return [...new Set(candidates)];
}

// Mask passport numbers for privacy when included in emails/logs
function maskPassport(value) {
  const v = String(value || "").trim();
  if (!v) return "Not provided";
  if (v.length <= 4) return "****";
  const last = v.slice(-2);
  return `****${last}`;
}

function buildBookingEmailHtml({
  title,
  subtitle,
  noticeTitle,
  noticeMessage,
  closingText,
  booking,
  flight,
  departureDate,
  arrivalDate,
  returnFlight,
  returnDepartureDate,
  returnArrivalDate,
  formattedPrice,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .section {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h2 {
      margin-top: 0;
      color: #667eea;
      font-size: 18px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #6b7280;
    }
    .value {
      color: #111827;
      font-weight: 500;
    }
    .flight-route {
      text-align: center;
      padding: 20px;
      background: #f3f4f6;
      border-radius: 8px;
      margin: 20px 0;
    }
    .route-cities {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin: 15px 0;
    }
    .city {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
    }
    .arrow {
      color: #667eea;
      font-size: 24px;
    }
    .price-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .price-box .label {
      color: rgba(255,255,255,0.9);
      font-size: 14px;
      margin-bottom: 5px;
    }
    .price-box .amount {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>${subtitle}</p>
  </div>

  <div class="content">
      <div class="section">
      <h2>Passenger Information</h2>
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">${booking.passengerName}</span>
      </div>
      <div class="info-row">
        <span class="label">Email:</span>
        <span class="value">${hasValue(booking.email) ? booking.email : "Not provided"}</span>
      </div>
      <div class="info-row">
        <span class="label">Phone:</span>
        <span class="value">${hasValue(booking.phone) ? booking.phone : "Not provided"}</span>
      </div>
      <div class="info-row">
        <span class="label">Passport:</span>
        <span class="value">${maskPassport(booking.passportDetails)}</span>
      </div>
    </div>

    <div class="section">
      <h2>Flight Details</h2>

      <div class="flight-route">
        <div class="route-cities">
          <div>
            <div class="city">${flight.origin}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
              ${format(departureDate, "MMM dd, yyyy")}
            </div>
            <div style="font-size: 20px; font-weight: bold; margin-top: 5px;">
              ${format(departureDate, "HH:mm")}
            </div>
          </div>
          <div class="arrow">→</div>
          <div>
            <div class="city">${flight.destination}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
              ${format(arrivalDate, "MMM dd, yyyy")}
            </div>
            <div style="font-size: 20px; font-weight: bold; margin-top: 5px;">
              ${format(arrivalDate, "HH:mm")}
            </div>
          </div>
        </div>
      </div>

      <div class="info-row">
        <span class="label">Airline:</span>
        <span class="value">${flight.airline}</span>
      </div>
      <div class="info-row">
        <span class="label">Flight Number:</span>
        <span class="value">${flight.flightNumber}</span>
      </div>
      <div class="info-row">
        <span class="label">Duration:</span>
        <span class="value">${flight.duration}</span>
      </div>
      <div class="info-row">
        <span class="label">Stops:</span>
        <span class="value">${flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}</span>
      </div>

      ${returnFlight && returnDepartureDate && returnArrivalDate
        ? `
      <h2 style="margin-top: 20px;">Return Flight Details</h2>

      <div class="flight-route">
        <div class="route-cities">
          <div>
            <div class="city">${returnFlight.origin}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
              ${format(returnDepartureDate, "MMM dd, yyyy")}
            </div>
            <div style="font-size: 20px; font-weight: bold; margin-top: 5px;">
              ${format(returnDepartureDate, "HH:mm")}
            </div>
          </div>
          <div class="arrow">→</div>
          <div>
            <div class="city">${returnFlight.destination}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
              ${format(returnArrivalDate, "MMM dd, yyyy")}
            </div>
            <div style="font-size: 20px; font-weight: bold; margin-top: 5px;">
              ${format(returnArrivalDate, "HH:mm")}
            </div>
          </div>
        </div>
      </div>

      <div class="info-row">
        <span class="label">Return Airline:</span>
        <span class="value">${returnFlight.airline || flight.airline}</span>
      </div>
      <div class="info-row">
        <span class="label">Return Duration:</span>
        <span class="value">${returnFlight.duration}</span>
      </div>
      <div class="info-row">
        <span class="label">Return Stops:</span>
        <span class="value">${returnFlight.stops === 0 ? "Direct Flight" : `${returnFlight.stops} Stop${returnFlight.stops > 1 ? "s" : ""}`}</span>
      </div>`
        : ""}
    </div>

    <div class="price-box">
      <div class="label">Fare Amount</div>
      <div class="amount">${formattedPrice}</div>
      <div style="font-size: 14px; opacity: 0.9;">Taxes and fees included</div>
    </div>

    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px;">${noticeTitle}</h3>
      <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">${noticeMessage}</p>
      <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Support: +1 877 371 7356 | support@jetwithfly.com</p>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #6b7280; margin-bottom: 10px;">${closingText}</p>
    </div>
  </div>

  <div class="footer">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p style="margin-top: 10px;">© ${new Date().getFullYear()} JetWithFly Flights. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

function buildBookingEmailText({
  title,
  subtitle,
  noticeTitle,
  noticeMessage,
  closingText,
  booking,
  flight,
  departureDate,
  arrivalDate,
  returnFlight,
  returnDepartureDate,
  returnArrivalDate,
  formattedPrice,
}) {
  return `
${title}
${subtitle}

Passenger:
- Name: ${booking.passengerName}
- Email: ${hasValue(booking.email) ? booking.email : "Not provided"}
- Phone: ${hasValue(booking.phone) ? booking.phone : "Not provided"}
- Passport: ${booking.passportDetails}
 - Passport: ${maskPassport(booking.passportDetails)}

Flight Details:
- Route: ${flight.origin} -> ${flight.destination}
- Airline: ${flight.airline}
- Flight Number: ${flight.flightNumber}
- Departure: ${format(departureDate, "MMM dd, yyyy HH:mm")}
- Arrival: ${format(arrivalDate, "MMM dd, yyyy HH:mm")}
- Duration: ${flight.duration}
- Stops: ${flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
- Fare: ${formattedPrice}

${returnFlight && returnDepartureDate && returnArrivalDate
  ? `Return Flight Details:
- Route: ${returnFlight.origin} -> ${returnFlight.destination}
- Airline: ${returnFlight.airline || flight.airline}
- Departure: ${format(returnDepartureDate, "MMM dd, yyyy HH:mm")}
- Arrival: ${format(returnArrivalDate, "MMM dd, yyyy HH:mm")}
- Duration: ${returnFlight.duration}
- Stops: ${returnFlight.stops === 0 ? "Direct Flight" : `${returnFlight.stops} Stop${returnFlight.stops > 1 ? "s" : ""}`}
`
  : ""}

${noticeTitle}
${noticeMessage}

${closingText}

Support: +1 877 371 7356 | support@jetwithfly.com
JetWithFly Flights
  `.trim();
}

async function sendTemplateMail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: `"JetWithFly Flights" <${process.env.EMAIL_USER}>`,
    replyTo: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
}

export async function sendBookingConfirmation(booking, flight) {
  // Allow disabling booking-related emails via environment for enquiry-only mode
  if (String(process.env.DISABLE_BOOKING_EMAILS || "").toLowerCase() === "true") {
    log("⚠️ Email sending disabled by configuration (DISABLE_BOOKING_EMAILS=true)");
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
    }).format(flight.price / 100);

    const ownerRecipients = getInternalRecipients();
    const customerRecipient = hasValue(booking.email) ? booking.email.trim() : "";

    if (ownerRecipients.length === 0 && !customerRecipient) {
      log("⚠️ No email recipient available - skipping email send");
      return { success: false, message: "No recipient email available" };
    }

    const sendResults = [];

    if (ownerRecipients.length > 0) {
      const ownerHtml = buildBookingEmailHtml({
        title: "New Flight Query Received",
        subtitle: "A customer submitted a booking query",
        noticeTitle: "Owner Action Required",
        noticeMessage: "Please contact the customer using the email or phone details above.",
        closingText: "Handle this query promptly to complete the booking.",
        booking,
        flight,
        departureDate,
        arrivalDate,
        returnFlight,
        returnDepartureDate,
        returnArrivalDate,
        formattedPrice,
      });

      const ownerText = buildBookingEmailText({
        title: "New Flight Query Received",
        subtitle: "A customer submitted a booking query",
        noticeTitle: "Owner Action Required",
        noticeMessage: "Please contact the customer using the email or phone details above.",
        closingText: "Handle this query promptly to complete the booking.",
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
          subject: `Query: ${flight.origin} to ${flight.destination} - ${booking.passengerName}`,
          html: ownerHtml,
          text: ownerText,
        });

        log(`✅ Owner query email sent to ${ownerRecipients.join(", ")} - ID: ${ownerInfo.messageId}`);
        sendResults.push({ recipient: "owner", success: true, messageId: ownerInfo.messageId });
      } catch (ownerError) {
        log(`❌ Failed to send owner query email: ${ownerError.message}`);
        sendResults.push({ recipient: "owner", success: false, message: ownerError.message });
      }
    } else {
      log("❌ Owner recipient is not configured");
      sendResults.push({ recipient: "owner", success: false, message: "Owner recipient is not configured" });
    }

    if (customerRecipient) {
      const customerHtml = buildBookingEmailHtml({
        title: "Query Received Successfully",
        subtitle: "Thank you for contacting JetWithFly Flights",
        noticeTitle: "We Will Contact You Back",
        noticeMessage: "Our team will contact you shortly to confirm your booking details.",
        closingText: "Thank you for your patience and trust.",
        booking,
        flight,
        departureDate,
        arrivalDate,
        returnFlight,
        returnDepartureDate,
        returnArrivalDate,
        formattedPrice,
      });

      const customerText = buildBookingEmailText({
        title: "Query Received Successfully",
        subtitle: "Thank you for contacting JetWithFly Flights",
        noticeTitle: "We Will Contact You Back",
        noticeMessage: "Our team will contact you shortly to confirm your booking details.",
        closingText: "Thank you for your patience and trust.",
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
          subject: `We received your query: ${flight.origin} to ${flight.destination}`,
          html: customerHtml,
          text: customerText,
        });

        log(`✅ Customer email sent to ${customerRecipient} - ID: ${customerInfo.messageId}`);
        sendResults.push({ recipient: "customer", success: true, messageId: customerInfo.messageId });
      } catch (customerError) {
        log(`❌ Failed to send customer email: ${customerError.message}`);
        sendResults.push({ recipient: "customer", success: false, message: customerError.message });
      }
    }

    const ownerResult = sendResults.find((result) => result.recipient === "owner");
    if (!ownerResult?.success) {
      return {
        success: false,
        message: ownerResult?.message || "Failed to send owner query email",
        results: sendResults,
      };
    }

    const sentCount = sendResults.filter((result) => result.success).length;

    return {
      success: true,
      message: `Sent ${sentCount} email${sentCount > 1 ? "s" : ""}`,
      results: sendResults,
    };
  } catch (error) {
    log(`❌ Failed to send email: ${error.message}`);
    console.error(error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

// Test email configuration
export async function testEmailConfig() {
  try {
    await transporter.verify();
    log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    log(`❌ Email configuration error: ${error.message}`);
    return false;
  }
}
