import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Form } from "@/models/Form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const forms = await Form.find().sort({ createdAt: -1 });
    return NextResponse.json(forms);
  } catch (error: any) {
    console.error("API admin/forms GET error:", error);
    return NextResponse.json({ message: "Failed to fetch forms", error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, fields = [], submitButtonText = "Submit", redirectUrl = "" } = body;

    if (!title) {
      return NextResponse.json({ message: "Form title is required" }, { status: 400 });
    }

    await connectToDatabase();

    const form = await Form.create({
      title,
      description,
      fields,
      submitButtonText,
      redirectUrl,
    });

    return NextResponse.json({ success: true, form }, { status: 201 });
  } catch (error: any) {
    console.error("API admin/forms POST error:", error);
    return NextResponse.json({ message: "Failed to create form", error: error.message }, { status: 500 });
  }
}
