"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Settings,
  Calendar,
  Globe,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  author: string;
  summary?: string;
  content: string;
  category: string;
  thumbnail?: string;
  status: string;
  publishedAt: string;
}

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);

  // Fetch all articles
  const { data: blogs, isLoading, refetch } = useQuery<BlogItem[]>({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error("Failed to fetch articles");
      return res.json();
    },
  });

  // Create article Mutation
  const createBlogMutation = useMutation({
    mutationFn: async (newBlog: any) => {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlog),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save article");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Article Saved", description: "Your post is saved in drafts." });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (err: any) => {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    },
  });

  // Toggle Publish Status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status toggle failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Article visibility state changed." });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const handleCreateBlog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    createBlogMutation.mutate({
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt as string) : new Date(),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted", description: "Article deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    } catch {
      toast({ title: "Error", description: "Delete request failed.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Blog CMS Publisher
          </h1>
          <p className="text-slate-400 text-sm">Write travel articles, configure ISR rendering schedules, and target categories tagging.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>

          {/* Add Article Dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Write Article
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Write Travel Story</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Write details for static rendering. Scheduled dates dictate publishing triggers.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBlog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <Label>Article Title *</Label>
                    <Input required name="title" placeholder="Top 10 flights hacks for summer..." className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Slug Path (lower alphanumeric) *</Label>
                    <Input required name="slug" placeholder="top-10-flight-hacks-summer" className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select name="category" defaultValue="Travel Tips">
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 text-white border-slate-800">
                        {["Travel Tips", "Airline News", "Destinations", "Packing Guides"].map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Author</Label>
                    <Input name="author" placeholder="Flightitude.com Expert" className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Summary Description</Label>
                    <Input name="summary" placeholder="Quick one-liner summary describing the article..." className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Thumbnail Cover Image URL (e.g. /uploads/...)</Label>
                    <Input name="thumbnail" placeholder="/uploads/162810_cover.jpg" className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Scheduler Publishing Date</Label>
                    <Input name="publishedAt" type="datetime-local" className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Article Content (HTML markup / Raw text) *</Label>
                    <Textarea required name="content" placeholder="Type article content..." rows={8} className="bg-slate-900 border-slate-800 font-sans" />
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full">Initialize Article</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Blog Table */}
      <div className="border border-slate-850 bg-slate-900/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/60">
            <TableRow className="border-slate-850 hover:bg-transparent">
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Article Details</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Slug / Path</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Category</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Publish Date</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-slate-850/50">
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-slate-800 mb-1" />
                    <Skeleton className="h-3 w-40 bg-slate-800" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 bg-slate-800" /></TableCell>
                </TableRow>
              ))
            ) : blogs?.map((blog) => (
              <TableRow key={blog._id} className="border-slate-850/50 hover:bg-slate-900/30">
                <TableCell>
                  <div className="font-bold text-slate-100">{blog.title}</div>
                  <div className="text-xs text-slate-500">By: {blog.author}</div>
                </TableCell>
                <TableCell>
                  <Link href={`/blog/${blog.slug}`} target="_blank">
                    <span className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      /blog/{blog.slug}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="font-semibold text-slate-350 text-xs">
                  {blog.category}
                </TableCell>
                <TableCell className="text-xs text-slate-400">
                  {new Date(blog.publishedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePublishMutation.mutate({ id: blog._id, status: blog.status === "published" ? "draft" : "published" })}
                    className={`h-7 px-2.5 rounded-full text-xs font-black flex items-center gap-1 ${
                      blog.status === "published"
                        ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {blog.status === "published" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {blog.status === "published" ? "Published" : "Draft"}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/blog/${blog.slug}`} target="_blank">
                      <Button size="icon" variant="ghost" className="hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(blog._id)}
                      className="hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
