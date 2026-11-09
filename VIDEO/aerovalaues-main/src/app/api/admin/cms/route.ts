import { NextResponse } from "next/server";
import { connectToDatabase, getDb } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const COLLECTION = "cms_settings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ _type: "global" });

    if (!doc) {
      return NextResponse.json({});
    }

    const { _id, _type, ...settings } = doc as any;
    return NextResponse.json(settings);
  } catch (err: any) {
    console.error("[CMS GET]", err);
    return NextResponse.json({ message: "Failed to fetch CMS settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await connectToDatabase();
    const db = await getDb();

    await db.collection(COLLECTION).updateOne(
      { _type: "global" },
      { $set: { _type: "global", ...body, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "CMS settings saved successfully." });
  } catch (err: any) {
    console.error("[CMS POST]", err);
    return NextResponse.json({ message: "Failed to save CMS settings" }, { status: 500 });
  }
}
