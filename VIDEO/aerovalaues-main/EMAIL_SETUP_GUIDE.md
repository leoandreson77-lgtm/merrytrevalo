# Email Booking Confirmation Setup Guide

## Overview
The booking system now sends beautiful HTML email confirmations to passengers after they complete a booking. Each email includes complete flight details, passenger information, and travel tips.

## Email Configuration

### Using Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication on your Gmail account**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `.env` file**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

### Using Other Email Providers

#### Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASS=your-ses-smtp-password
```

## Email Features

### What's Included in the Confirmation Email

✅ **Beautiful HTML Design**
- Gradient header with flight icon
- Professional card-based layout
- Mobile-responsive design

✅ **Passenger Information**
- Full name
- Email address
- Phone number
- Passport details

✅ **Complete Flight Details**
- Origin and destination airports
- Departure and arrival times with dates
- Airline name and flight number
- Flight duration
- Number of stops (or "Direct Flight")
- Total price with currency formatting

✅ **Travel Tips**
- Airport arrival time recommendations
- Required documents checklist
- Online check-in reminder

✅ **Visual Flight Route**
- Large airport codes
- Departure/arrival times
- Arrow indicator for direction

## Testing the Email System

### Method 1: Using the Web UI

1. **Start the server** (if not already running)
   ```bash
   npm run dev
   ```

2. **Open browser** to http://localhost:5000

3. **Search for flights**
   - Type "New" in "Where from?" → Select JFK
   - Type "Los" in "Where to?" → Select LAX
   - Pick a future date
   - Click Search

4. **Book a flight**
   - Click "Book Now" on any flight
   - Fill in passenger details (use YOUR real email to receive the confirmation)
   - Click "Complete Booking"

5. **Check your email inbox**
   - Look for email from "AeroVuelos Flight Booking"
   - Subject: "✈️ Flight Booking Confirmation - JFK to LAX"

### Method 2: Using curl

```bash
# First, search for flights to populate cache
curl "http://localhost:5000/api/flights/search?origin=JFK&destination=LAX&date=2026-03-20"

# Then create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": 1,
    "passengerName": "John Doe",
    "email": "your-email@example.com",
    "phone": "+1 (555) 123-4567",
    "passportDetails": "A12345678"
  }'
```

## Troubleshooting

### Email Not Sending

**Issue**: Email credentials not configured
```
[EMAIL] ⚠️ Email credentials not configured - skipping email
```
**Solution**: Update `.env` with your EMAIL_USER and EMAIL_PASS

---

**Issue**: Invalid credentials
```
[EMAIL] ❌ Email configuration error: Invalid login
```
**Solution**: 
- For Gmail: Use App Password, not your regular password
- Verify EMAIL_USER and EMAIL_PASS are correct

---

**Issue**: Connection refused
```
[EMAIL] ❌ Failed to send email: connect ECONNREFUSED
```
**Solution**: Check EMAIL_HOST and EMAIL_PORT settings

### Email Goes to Spam

If confirmation emails land in spam folder:
- Add sender to contacts
- Mark as "Not Spam"
- For production: Setup SPF, DKIM, and DMARC records

### Server Logs

Check terminal for email status:
```
[EMAIL] ✅ Email sent to passenger@example.com - ID: <message-id>
[bookings] 📧 Email result: Sent - Confirmation email sent successfully
```

## Email Preview

The confirmation email includes:

```
┌─────────────────────────────────────────┐
│     ✈️ Booking Confirmed!               │
│  Your flight has been successfully booked│
└─────────────────────────────────────────┘

👤 PASSENGER INFORMATION
Name:     John Doe
Email:    john@example.com
Phone:    +1 (555) 123-4567
Passport: A12345678

✈️ FLIGHT DETAILS
┌─────────────────────────────────────────┐
│  JFK        →        LAX                │
│  Mar 15, 2026       Mar 15, 2026       │
│  16:35              23:59               │
└─────────────────────────────────────────┘

Airline:  AS
Flight:   AS 19
Duration: 10h 24m
Stops:    1 Stop

┌─────────────────────────────────────────┐
│      Total Amount Paid                  │
│         $302.17                         │
│    Taxes and fees included              │
└─────────────────────────────────────────┘

📋 IMPORTANT INFORMATION
• Arrive 2-3 hours before departure
• Bring valid ID and passport
• Check-in online 24 hours before
• Carry this confirmation to airport
```

## Production Recommendations

For production deployment:

1. **Use a dedicated email service**
   - SendGrid (99% deliverability)
   - AWS SES (cost-effective)
   - Mailgun (developer-friendly)

2. **Setup email authentication**
   - SPF records
   - DKIM signing
   - DMARC policy

3. **Add rate limiting**
   - Prevent spam/abuse
   - Queue emails for batch sending

4. **Track email delivery**
   - Bounce handling
   - Open rate tracking
   - Click tracking

5. **Add attachments** (optional)
   - PDF boarding pass
   - QR code ticket
   - Calendar invite (ICS file)

## Support

If you encounter issues:
- Check server logs: `[EMAIL]` and `[bookings]` prefixes
- Verify `.env` configuration
- Test with Gmail first (easiest setup)
- Ensure port 587 is not blocked by firewall

---

**Note**: Email sending happens automatically after successful booking. The booking will still be created even if email fails (graceful degradation).
