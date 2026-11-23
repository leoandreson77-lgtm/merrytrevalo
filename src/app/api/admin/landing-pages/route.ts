import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LandingPage } from "@/models/LandingPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const pages = await LandingPage.find().sort({ createdAt: -1 });
    return NextResponse.json(pages);
  } catch (error: any) {
    console.error("API landing-pages GET error:", error);
    return NextResponse.json({ message: "Failed to fetch pages", error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, category, templateId, description, callPhone, seoTitle, seoDescription, schemaMarkup, blocks = [], isPublished = false } = body;

    if (!title || !slug) {
      return NextResponse.json({ message: "Missing required fields (title, slug)" }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");

    await connectToDatabase();

    const duplicate = await LandingPage.findOne({ slug: cleanSlug });
    if (duplicate) {
      return NextResponse.json({ message: "A page with this slug already exists" }, { status: 400 });
    }

    const newPage = await LandingPage.create({
      title,
      slug: cleanSlug,
      category: category || "changesncancellation",
      templateId: templateId || "flight-changes-desk",
      description,
      callPhone: callPhone || "",
      seoTitle: seoTitle || title,
      seoDescription,
      schemaMarkup,
      blocks,
      isPublished,
    });

    return NextResponse.json({ success: true, page: newPage }, { status: 201 });
  } catch (error: any) {
    console.error("API landing-pages POST error:", error);
    return NextResponse.json({ message: "Failed to create page", error: error.message }, { status: 500 });
  }
}
