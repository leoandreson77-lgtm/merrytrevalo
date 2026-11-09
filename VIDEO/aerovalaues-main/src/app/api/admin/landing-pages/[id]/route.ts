import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LandingPage } from "@/models/LandingPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();

    await connectToDatabase();

    const page = await LandingPage.findByIdAndUpdate(id, body, { new: true });
    if (!page) {
      return NextResponse.json({ message: "Landing page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error("API landing-pages/:id PUT error:", error);
    return NextResponse.json({ message: "Failed to update page", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    await connectToDatabase();

    await LandingPage.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Page successfully deleted" });
  } catch (error: any) {
    console.error("API landing-pages/:id DELETE error:", error);
    return NextResponse.json({ message: "Failed to delete page", error: error.message }, { status: 500 });
  }
}
