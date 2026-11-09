import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Vendor } from "@/models/Vendor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import crypto from "crypto";

// GET: List all vendors
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    return NextResponse.json(vendors);
  } catch (error: any) {
    console.error("API admin/vendors GET error:", error);
    return NextResponse.json({ message: "Failed to fetch vendors", error: error.message }, { status: 500 });
  }
}

// POST: Create a new vendor and generate API key
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, companyName, commissionRate = 0 } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Missing required fields (name, email)" }, { status: 400 });
    }

    await connectToDatabase();

    // Check duplicate email
    const duplicate = await Vendor.findOne({ email: email.toLowerCase() });
    if (duplicate) {
      return NextResponse.json({ message: "A vendor with this email already exists" }, { status: 400 });
    }

    // Generate apiKey
    const apiKey = `vnd_${crypto.randomBytes(24).toString("hex")}`;

    const vendor = await Vendor.create({
      name,
      email: email.toLowerCase(),
      phone,
      companyName,
      commissionRate: parseFloat(commissionRate),
      apiKey,
      status: "active",
    });

    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error: any) {
    console.error("API admin/vendors POST error:", error);
    return NextResponse.json({ message: "Failed to create vendor", error: error.message }, { status: 500 });
  }
}
