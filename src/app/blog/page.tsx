import React from "react";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
import { Plane, Calendar, User, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Travel Blog & Flight Guides",
  description: "Read the latest flight tips, destination guides, and airline deals from JetWithFly Flights.",
};

interface SearchProps {
  searchParams: { category?: string };
}

export default async function BlogIndexPage({ searchParams }: SearchProps) {
  const categoryFilter = searchParams.category || "";

  let articles: any[] = [];
  try {
    const dbPromise = (async () => {
      await connectToDatabase();
      const query: any = {
        status: "published",
        publishedAt: { $lte: new Date() },
      };
      if (categoryFilter) {
        query.category = categoryFilter;
      }
      return Blog.find(query).sort({ publishedAt: -1 }).lean();
    })();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 1500));
    articles = ((await Promise.race([dbPromise, timeoutPromise])) as any[]) || [];
  } catch {
    articles = [];
  }

  const categories = ["Travel Tips", "Airline News", "Destinations", "Packing Guides"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Announcement Banner */}
      <div className="bg-primary text-white text-center py-2 text-xs font-semibold px-4">
        ✈️ Direct deals matching summer getaways. Book custom flight tickets today!
      </div>

      {/* Navigation */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="JetWithFly" className="h-9 w-auto object-contain" />
          <span className="text-xs font-extrabold bg-slate-100 text-slate-600 px-2 py-1 rounded">BLOG</span>
        </Link>
        <Link href="/" className="text-sm font-bold text-slate-600 hover:text-primary">
          Back to Search
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-black tracking-tight">The {siteConfig.brandName} Explorer</h1>
          <p className="text-slate-500 text-base">Travel updates, airline insights, cheap fare alerts, and destination inspiration from our flight experts.</p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-slate-200 pb-6">
          <Link href="/blog">
            <span
              className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer border transition-all ${
                !categoryFilter
                  ? "bg-primary border-primary text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-350"
              }`}
            >
              All Articles
            </span>
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`}>
              <span
                className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer border transition-all ${
                  categoryFilter === cat
                    ? "bg-primary border-primary text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-350"
                }`}
              >
                {cat}
              </span>
            </Link>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <CardLayout key={String(article._id)} article={article as any} />
          ))}
          {articles.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-bold">
              No published articles found in this category.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-center text-slate-400 text-xs px-6 mt-16">
        <p>&copy; {new Date().getFullYear()} {siteConfig.brandName}. Comparing 500+ airlines for lowest airfares.</p>
      </footer>
    </div>
  );
}

function CardLayout({ article }: { article: any }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        <div className="aspect-video bg-slate-100 relative">
          <img
            src={article.featuredImage || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase bg-primary text-white px-2.5 py-0.5 rounded-md shadow">
            {article.category}
          </span>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {article.author}
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-slate-850 leading-tight hover:text-primary transition-colors">
            <Link href={`/blog/${article.slug}`}>{article.title}</Link>
          </h3>
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{article.seoDescription || article.content.substring(0, 120)}</p>
        </div>
      </div>
      <div className="px-6 pb-6 pt-2">
        <Link href={`/blog/${article.slug}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          Read Article <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
