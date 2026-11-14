import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET: Fetch all blog articles (Draft or Published)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const isPublishedOnly = searchParams.get("publishedOnly") === "true";

    const query: any = {};
    if (category) {
      query.category = category;
    }

    if (isPublishedOnly) {
      query.status = "published";
      // Ensure publish date has passed
      query.publishedAt = { $lte: new Date() };
    }

    const blogs = await Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });
    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error("API admin/blog GET error:", error);
    return NextResponse.json({ message: "Failed to fetch blogs", error: error.message }, { status: 500 });
  }
}

// POST: Register a new blog article
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, author, summary, category = "Travel Tips", thumbnail, status = "draft", publishedAt } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ message: "Missing required fields (title, slug, content)" }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");

    await connectToDatabase();

    const duplicate = await Blog.findOne({ slug: cleanSlug });
    if (duplicate) {
      return NextResponse.json({ message: "An article with this slug already exists" }, { status: 400 });
    }

    const article = await Blog.create({
      title,
      slug: cleanSlug,
      content,
      author: author || session.user?.name || "MerryTravelo Expert",
      summary,
      category,
      thumbnail,
      status,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    });

    return NextResponse.json({ success: true, blog: article }, { status: 201 });
  } catch (error: any) {
    console.error("API admin/blog POST error:", error);
    return NextResponse.json({ message: "Failed to create article", error: error.message }, { status: 500 });
  }
}
