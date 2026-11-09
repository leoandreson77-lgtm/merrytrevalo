export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const email = "samm.aali12@gmail.com";
    const password = "Sameer123";
    const passwordHash = hashPassword(password);

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      existingUser.passwordHash = passwordHash;
      existingUser.role = "admin";
      existingUser.status = "active";
      await existingUser.save();
      return NextResponse.json({
        success: true,
        message: `Admin user ${email} password updated to: ${password}`,
      });
    } else {
      const newAdmin = new User({
        name: "Admin",
        email: email.toLowerCase(),
        passwordHash: passwordHash,
        role: "admin",
        status: "active",
      });
      await newAdmin.save();
      return NextResponse.json({
        success: true,
        message: `New Admin user ${email} created with password: ${password}`,
      });
    }
  } catch (error: any) {
    console.error("Temp reset error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
