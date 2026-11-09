import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { readdir, stat, unlink } from "fs/promises";
import { join } from "path";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    
    let filesList: any[] = [];
    try {
      const files = await readdir(uploadDir);
      filesList = await Promise.all(
        files.map(async (file) => {
          const stats = await stat(join(uploadDir, file));
          return {
            name: file,
            size: stats.size,
            createdAt: stats.birthtime,
            url: `/uploads/${file}`,
          };
        })
      );
    } catch {
      // If folder doesn't exist yet, return empty
      filesList = [];
    }

    // Sort newest first
    filesList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(filesList);
  } catch (error: any) {
    console.error("API admin/media GET error:", error);
    return NextResponse.json({ message: "Failed to list media", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file") || "";

    if (!fileName) {
      return NextResponse.json({ message: "Missing file query parameter" }, { status: 400 });
    }

    // Prevent directory traversal attacks
    const cleanName = fileName.replace(/\.\./g, "").replace(/\//g, "").replace(/\\/g, "");
    const filePath = join(process.cwd(), "public", "uploads", cleanName);

    try {
      await unlink(filePath);
      return NextResponse.json({ success: true, message: "File successfully deleted." });
    } catch (err: any) {
      return NextResponse.json({ message: "File not found or delete failed", error: err.message }, { status: 404 });
    }
  } catch (error: any) {
    console.error("API admin/media DELETE error:", error);
    return NextResponse.json({ message: "Delete failed", error: error.message }, { status: 500 });
  }
}
