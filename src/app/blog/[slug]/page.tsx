import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
import { Plane, Calendar, User, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";

interface PageProps {
  params: { slug: string };
}

// Generate dynamic metadata for blog SEO tags indexing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectToDatabase();
  const article = await Blog.findOne({ slug: params.slug, status: "Published" });
  if (!article) return {};

  return {
    title: `${article.title} | ${siteConfig.brandName} Blog`,
    description: article.seoDescription || article.content.substring(0, 150),
    openGraph: {
      title: article.title,
      description: article.seoDescription || article.content.substring(0, 150),
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  await connectToDatabase();
  const article = await Blog.findOne({ slug: params.slug, status: "Published" });

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Announcement */}
      <div className="bg-primary text-white text-center py-2 text-xs font-semibold px-4">
        ✈️ Live Operational Dashboard. Check out cheap tickets now!
      </div>

      {/* Navigation */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="SkySwift" className="h-9 w-auto object-contain" />
        </Link>
        <Link href="/blog" className="flex items-center gap-1.5 text-xs font-bold text-slate-650 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> All Articles
        </Link>
      </nav>

      {/* Main post layout */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-4">
          <span className="text-[10px] font-extrabold uppercase bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full w-max block">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-850 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase pt-2 border-b border-slate-200 pb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(article.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {article.author}
            </span>
          </div>
        </div>

        {/* Cover Photo */}
        {article.featuredImage && (
          <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-sm bg-slate-100">
            <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content text */}
        <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
          {article.content}
        </article>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-center text-slate-400 text-xs px-6 mt-16">
        <p>&copy; {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
