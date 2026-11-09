export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sendContactMessageEmail } from "@/lib/email";
import { connectToDatabase, getDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limiter = await checkRateLimit(ip, "contact", { limit: 5, windowSeconds: 60 });
    if (!limiter.success) {
      return NextResponse.json(
        { message: "Too many messages sent. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    // Save contact inquiry to database for CRM leads tracking
    try {
      await connectToDatabase();
      const db = await getDb();
      await db.collection("contact_messages").insertOne({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone || "").trim(),
        subject: String(subject || "").trim(),
        message: String(message).trim(),
        ip,
        createdAt: new Date(),
      });
    } catch (dbErr) {
      console.warn("Could not record contact message in DB:", dbErr);
    }

    // Dispatch emails via backend Nodemailer
    const emailResult = await sendContactMessageEmail({
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : undefined,
      subject: subject ? String(subject).trim() : undefined,
      message: String(message).trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting us! Our team has received your message and will reply shortly.",
      emailResult,
    });
  } catch (error: any) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to process contact message." },
      { status: 500 }
    );
  }
}
