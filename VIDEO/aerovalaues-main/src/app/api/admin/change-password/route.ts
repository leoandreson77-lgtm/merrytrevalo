import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword, hashPassword } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Please provide both current and new password." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "New password must be at least 6 characters long." }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ message: "New password and confirmation do not match." }, { status: 400 });
    }

    await connectToDatabase();

    const userEmail = session.user.email?.toLowerCase();
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ message: "Admin account not found." }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json({ message: "Incorrect current password. Please try again." }, { status: 400 });
    }

    // Update to new hashed password & invalidates other device sessions
    user.passwordHash = hashPassword(newPassword);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully!",
    });
  } catch (error: any) {
    console.error("API /api/admin/change-password POST error:", error);
    return NextResponse.json(
      { message: "Failed to reset password", error: error.message },
      { status: 500 }
    );
  }
}
