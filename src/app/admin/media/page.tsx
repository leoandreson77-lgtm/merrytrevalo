"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Images,
  Upload,
  RefreshCw,
  Copy,
  Trash2,
  FileImage,
  FolderOpen,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  name: string;
  size: number;
  createdAt: string;
  url: string;
}

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Fetch media files list
  const { data: media, isLoading, refetch } = useQuery<MediaItem[]>({
    queryKey: ["mediaFiles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to list media files");
      return res.json();
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload request failed");

      toast({ title: "Upload Success", description: "File uploaded to static assets." });
      queryClient.invalidateQueries({ queryKey: ["mediaFiles"] });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast({ title: "URL Copied", description: "Copied absolute URL to clipboard." });
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/admin/media?file=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted", description: "Successfully removed file." });
      queryClient.invalidateQueries({ queryKey: ["mediaFiles"] });
    } catch {
      toast({ title: "Delete Failed", description: "Failed to delete file.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <Images className="w-6 h-6 text-primary" />
            Media & Asset Library
          </h1>
          <p className="text-slate-400 text-sm">Upload images, icons, and testimonials attachments served statically from static folders.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>

          {/* Hidden File Input */}
          <Label className="cursor-pointer bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload File"}
            <input
              type="file"
              disabled={uploading}
              onChange={handleUpload}
              className="hidden"
              accept="image/*,application/pdf"
            />
          </Label>
        </div>
      </div>

      {/* Grid of Files */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-slate-850 bg-slate-900/50 h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {media?.map((file, i) => (
            <Card key={i} className="border-slate-850 bg-slate-900/40 hover:bg-slate-900/70 transition-all duration-300 group overflow-hidden flex flex-col justify-between">
              {/* Preview Box */}
              <div className="aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden shrink-0 h-28 border-b border-slate-850">
                {file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <FileImage className="w-10 h-10 text-slate-650" />
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleCopyUrl(file.url)} className="hover:bg-slate-800 text-white rounded-lg">
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(file.name)} className="hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-200 truncate" title={file.name}>
                  {file.name.substring(file.name.indexOf("_") + 1)}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {(file.size / 1024).toFixed(0)} KB | {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
          {(!media || media.length === 0) && (
            <div className="col-span-full py-16 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
              <FolderOpen className="w-12 h-12 text-slate-700" />
              <p>No media files uploaded yet. Drag or select upload button above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
