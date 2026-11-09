import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
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

    const article = await Blog.findByIdAndUpdate(id, body, { new: true });
    if (!article) {
      return NextResponse.json({ message: "Blog article not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, blog: article });
  } catch (error: any) {
    console.error("API admin/blog/:id PUT error:", error);
    return NextResponse.json({ message: "Failed to update blog", error: error.message }, { status: 500 });
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

    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Blog article deleted" });
  } catch (error: any) {
    console.error("API admin/blog/:id DELETE error:", error);
    return NextResponse.json({ message: "Failed to delete blog", error: error.message }, { status: 500 });
  }
}
