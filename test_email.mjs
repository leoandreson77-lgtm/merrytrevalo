// JetWithFly Flights - SMTP Test Script
// Run: node test_email.mjs [recipient_email]

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true" || EMAIL_PORT === 465;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const recipient = process.argv[2] || EMAIL_USER;

console.log("\n==========================================");
console.log("✈️  JetWithFly Flights - Email Configuration Test");
console.log("==========================================");
console.log(`Host:    ${EMAIL_HOST}`);
console.log(`Port:    ${EMAIL_PORT} (${EMAIL_SECURE ? "SSL" : "STARTTLS"})`);
console.log(`User:    ${EMAIL_USER || "NOT SET"}`);
console.log(`Pass:    ${EMAIL_PASS ? "********" : "NOT SET"}`);
console.log(`Target:  ${recipient || "NOT SET"}`);
console.log("==========================================\n");

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS is missing in your .env file.");
  console.error("Please add your SMTP credentials to .env and try again.\n");
  process.exit(1);
}

async function runTest() {
  console.log("⏳ Connecting to SMTP server...");

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    connectionTimeout: 10000,
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP Server Connection Verified Successfully!\n");

    if (recipient) {
      console.log(`⏳ Sending test email to ${recipient}...`);
      const info = await transporter.sendMail({
        from: `"JetWithFly Flights" <${EMAIL_USER}>`,
        to: recipient,
        subject: "✈️ JetWithFly Flights - SMTP Test Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: #2563eb; color: #ffffff; padding: 16px; border-radius: 8px; text-align: center;">
              <h2 style="margin: 0;">SMTP Test Successful!</h2>
            </div>
            <p style="color: #334155; margin-top: 16px;">
              Your backend email configuration for <strong>JetWithFly Flights</strong> is working properly.
            </p>
            <ul style="color: #64748b; font-size: 13px;">
              <li><strong>Host:</strong> ${EMAIL_HOST}</li>
              <li><strong>Port:</strong> ${EMAIL_PORT}</li>
              <li><strong>Sender:</strong> ${EMAIL_USER}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p style="color: #059669; font-weight: bold; margin-top: 20px;">
              ✅ You are ready to send booking confirmations and customer emails!
            </p>
          </div>
        `,
        text: `JetWithFly Flights SMTP Test Successful!\n\nYour backend email configuration is working properly.\nHost: ${EMAIL_HOST}\nPort: ${EMAIL_PORT}\nSender: ${EMAIL_USER}`,
      });

      console.log(`🎉 Email delivered successfully! Message ID: ${info.messageId}`);
    }

    console.log("\n==========================================");
    console.log("✅ All tests passed! Your email setup is ready.");
    console.log("==========================================\n");
  } catch (err) {
    console.error("\n❌ SMTP Test Failed:");
    console.error(err.message || err);
    console.log("\n💡 Common fixes:");
    console.log("1. For Gmail: Use an App Password (not your normal password): https://myaccount.google.com/apppasswords");
    console.log("2. For Hostinger: Use Port 465 (EMAIL_SECURE=true) or Port 587 (EMAIL_SECURE=false)");
    console.log("3. For SendGrid: Host is smtp.sendgrid.net, User is 'apikey', Pass is your SG.xxxx key\n");
  }
}

runTest();
