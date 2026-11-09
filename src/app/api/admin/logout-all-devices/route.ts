import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized. Please log in first." }, { status: 401 });
    }

    await connectToDatabase();

    const userEmail = session.user.email?.toLowerCase();
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ message: "Admin user not found." }, { status: 404 });
    }

    // Increment tokenVersion to invalidate all existing JWT session tokens across all devices
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Successfully logged out from all active devices & sessions!",
    });
  } catch (error: any) {
    console.error("API /api/admin/logout-all-devices POST error:", error);
    return NextResponse.json(
      { message: "Failed to logout all devices", error: error.message },
      { status: 500 }
    );
  }
}
