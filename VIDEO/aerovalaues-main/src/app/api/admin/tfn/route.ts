import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TFN } from "@/models/TFN";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const tfns = await TFN.find().populate("clientId", "name").sort({ createdAt: -1 });
    return NextResponse.json(tfns);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { number, friendlyName, status, clientId, landingPageSlug, campaign, isDefault } = body;

    if (!number) return NextResponse.json({ message: "Number required" }, { status: 400 });

    await connectToDatabase();

    // If setting as default, unset previous default
    if (isDefault) await TFN.updateMany({}, { isDefault: false });

    const tfn = await TFN.create({
      number, friendlyName, status: status || "standby",
      clientId: clientId || null,
      landingPageSlug: landingPageSlug || "",
      campaign: campaign || "",
      isDefault: isDefault || false,
    });

    return NextResponse.json({ success: true, tfn }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, status, isDefault, clientId, friendlyName, campaign } = body;

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await connectToDatabase();

    // Only 1 active TFN at a time — auto set others to standby
    if (status === "active") {
      await TFN.updateMany({ _id: { $ne: id } }, { status: "standby" });
    }

    if (isDefault) await TFN.updateMany({ _id: { $ne: id } }, { isDefault: false });

    const tfn = await TFN.findByIdAndUpdate(
      id,
      { status, isDefault, clientId, friendlyName, campaign },
      { new: true }
    );

    return NextResponse.json({ success: true, tfn });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
