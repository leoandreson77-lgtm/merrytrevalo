"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MousePointerClick, Plus, RefreshCw, Eye, Trash2,
  Check, X, Code, Globe, Phone, Sparkles, Zap,
  LayoutTemplate, ChevronRight, Pencil, ArrowUp, ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Types ── */
interface LandingPageItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  callPhone?: string;
  seoTitle?: string;
  seoDescription?: string;
  schemaMarkup?: string;
  isPublished: boolean;
  createdAt: string;
  blocks: any[];
}

/* ── Templates ── */
const TEMPLATES = [
  {
    id: "boarding-pass",
    name: "🎫 Boarding Pass",
    desc: "Psychologically compelling boarding-pass ticket layout",
    gradient: "from-slate-900 via-blue-950 to-slate-900",
    preview: ["🎫 Interactive Boarding Pass", "✈️ Dynamic Route Cards", "🤝 Partners & Logos", "💡 Why Us Features", "👥 Live customer reviews", "❓ FAQ", "📝 Contact Query Form"],
    blocks: ["boarding_pass_hero", "boarding_pass_routes", "partners", "features", "testimonials", "faq", "form"],
    ctaText: "Claim Boarding Pass",
  },
  {
    id: "flight-deals",
    name: "✈️ Flight Deals",
    desc: "Best for cheap flights & deals landing pages",
    gradient: "from-blue-600 to-violet-600",
    preview: ["🦸 Hero with call button", "✈️ Dynamic Route Cards", "🛫 Airline logos", "💡 Why Us Features", "⭐ Reviews", "❓ FAQ", "📝 Contact Query Form"],
    blocks: ["hero", "boarding_pass_routes", "partners", "features", "testimonials", "faq", "form"],
    ctaText: "Call for Best Fares",
  },
  {
    id: "luxury-travel",
    name: "👑 Luxury Travel",
    desc: "Premium first class & business class campaigns",
    gradient: "from-amber-500 to-orange-600",
    preview: ["💎 Premium hero", "✈️ Dynamic Route Cards", "🛫 Airline logos", "🥂 Luxury features", "⭐ Elite reviews", "📞 VIP call strip", "📝 Contact Query Form"],
    blocks: ["hero", "boarding_pass_routes", "partners", "features", "testimonials", "faq", "form"],
    ctaText: "Call Our VIP Desk",
  },
  {
    id: "budget-explorer",
    name: "🎒 Budget Explorer",
    desc: "For budget travelers & student deals",
    gradient: "from-green-500 to-teal-600",
    preview: ["🎯 Price-focused hero", "✈️ Dynamic Route Cards", "🛫 Airline logos", "💸 Savings breakdown", "👥 Traveler reviews", "❓ FAQ", "📝 Contact Query Form"],
    blocks: ["hero", "boarding_pass_routes", "partners", "features", "testimonials", "faq", "form"],
    ctaText: "Get Cheapest Price",
  },
  {
    id: "business-class",
    name: "💼 Business Class",
    desc: "Corporate travel & business booking pages",
    gradient: "from-slate-600 to-slate-800",
    preview: ["🏢 Corporate hero", "✈️ Dynamic Route Cards", "🛫 Airline logos", "✅ Business features", "💬 Corporate reviews", "📞 Direct call", "📝 Contact Query Form"],
    blocks: ["hero", "boarding_pass_routes", "partners", "features", "testimonials", "faq", "form"],
    ctaText: "Call Business Team",
  },
  {
    id: "airlines-helpdesk",
    name: "📞 Airlines Connection & Help Desk",
    desc: "Optimized for reservations, cancellations, flight changes, & premium class upgrades",
    gradient: "from-blue-900 via-indigo-950 to-slate-900",
    preview: ["✈️ Multi-Airline Support", "⚡ Zero Hold Time Indicator", "🛠️ Changes & Cancellations Desk", "👑 Premium Cabin Upgrades", "👥 Trustpilot & Live Reviews", "❓ Travel FAQ", "📝 Request Call Back Form"],
    blocks: ["boarding_pass_hero", "boarding_pass_routes", "partners", "features", "testimonials", "faq", "form"],
    ctaText: "Call Reservation Support",
  },
];

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  editingPage: LandingPageItem | null;
  onSave: (updatedPage: any) => void;
  isSaving: boolean;
}

/* ── Standalone Edit Dialog Component to Prevent Input Focus Loss ── */
function EditLandingPageDialog({ isOpen, onOpenChange, editingPage, onSave, isSaving }: EditDialogProps) {
  const [editBlocks, setEditBlocks] = useState<any[]>([]);

  useEffect(() => {
    if (editingPage) {
      setEditBlocks(JSON.parse(JSON.stringify(editingPage.blocks || [])));
    } else {
      setEditBlocks([]);
    }
  }, [editingPage]);

  if (!editingPage) return null;

  const updateBlock = (idx: number, field: string, value: any) => {
    setEditBlocks((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], content: { ...updated[idx].content, [field]: value } };
      return updated;
    });
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    setEditBlocks((prev) => {
      const updated = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= updated.length) return prev;
      [updated[idx], updated[target]] = [updated[target], updated[idx]];
      return updated;
    });
  };

  const removeBlock = (idx: number) => {
    setEditBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const addBlock = (type: string) => {
    setEditBlocks((prev) => [...prev, { type, content: {} }]);
  };

  const BLOCK_LABELS: Record<string, string> = {
    hero: "✈️ Hero",
    boarding_pass_hero: "🎫 Boarding Pass Hero",
    partners: "🤝 Partners",
    testimonials: "⭐ Testimonials",
    faq: "❓ FAQ",
    features: "💡 Features",
    form: "📝 Form",
    routes_table: "🗺️ Routes Table",
    boarding_pass_routes: "🎫 Route Cards",
    cta: "📣 CTA",
    reviews: "💬 Reviews",
    videos: "🎬 Videos",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Pencil className="w-5 h-5 text-primary" />
            Edit Landing Page
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Update all settings, content blocks, and sections for this landing page.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = Object.fromEntries(fd.entries());

            onSave({
              _id: editingPage._id,
              title: data.title,
              slug: data.slug,
              callPhone: data.callPhone,
              description: data.description,
              seoTitle: data.seoTitle,
              seoDescription: data.seoDescription,
              blocks: editBlocks,
            });
          }}
          className="space-y-4 mt-2"
        >
          {/* Page Details */}
          <div className="space-y-1">
            <Label className="text-slate-300">Page Title *</Label>
            <Input required name="title" defaultValue={editingPage.title} placeholder="e.g. Cheap Flights to Paris" className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-slate-300">URL Slug *</Label>
              <Input required name="slug" defaultValue={editingPage.slug} placeholder="cheap-flights-paris" className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-green-400" /> Call Phone Number
              </Label>
              <Input name="callPhone" defaultValue={editingPage.callPhone || ""} placeholder="+18772518760" className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-slate-300">Page Description / Subtitle</Label>
            <Textarea name="description" defaultValue={editingPage.description || ""} placeholder="Compare flights and get expert help..." rows={2} className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">SEO Title</Label>
              <Input name="seoTitle" defaultValue={editingPage.seoTitle || ""} placeholder="SEO title..." className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">SEO Meta Description</Label>
              <Input name="seoDescription" defaultValue={editingPage.seoDescription || ""} placeholder="SEO description..." className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm" />
            </div>
          </div>

          {/* ── Editable Blocks ── */}
          <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Content Blocks</h3>
              <div className="flex gap-1 flex-wrap">
                {["testimonials", "faq", "features", "partners", "boarding_pass_routes"].filter(t => !editBlocks.some(b => b.type === t)).map(t => (
                  <Button key={t} type="button" size="sm" variant="outline" className="text-[10px] h-7 border-slate-700 text-slate-300" onClick={() => addBlock(t)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> {BLOCK_LABELS[t] || t}
                  </Button>
                ))}
              </div>
            </div>

            {editBlocks.map((block, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3">
                {/* Block Header with controls */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-white uppercase tracking-wider">{BLOCK_LABELS[block.type] || block.type}</span>
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="ghost" className="w-7 h-7 text-slate-400 hover:text-white" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="w-7 h-7 text-slate-400 hover:text-white" onClick={() => moveBlock(idx, 1)} disabled={idx === editBlocks.length - 1}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="w-7 h-7 text-slate-400 hover:text-red-400" onClick={() => removeBlock(idx)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* ── Hero / Boarding Pass Hero Editor ── */}
                {(block.type === "hero" || block.type === "boarding_pass_hero") && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label className="text-slate-400 text-xs">Hero Section Title</Label>
                        <Input value={block.content?.title || ""} onChange={(e) => updateBlock(idx, "title", e.target.value)} placeholder="Title text" className="bg-slate-900 border-slate-700 text-white text-sm" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-slate-400 text-xs">Subtitle / Description</Label>
                        <Textarea value={block.content?.subtitle || ""} onChange={(e) => updateBlock(idx, "subtitle", e.target.value)} placeholder="Subtitle text" rows={2} className="bg-slate-900 border-slate-700 text-white text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Badge Text / Pill Title</Label>
                        <Input value={block.content?.badgeText || ""} onChange={(e) => updateBlock(idx, "badgeText", e.target.value)} placeholder="e.g. VIP FIRST CLASS or UNPUBLISHED PHONE-ONLY DEALS" className="bg-slate-900 border-slate-700 text-white text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">CTA Button Text</Label>
                        <Input value={block.content?.ctaText || ""} onChange={(e) => updateBlock(idx, "ctaText", e.target.value)} placeholder="CTA button label" className="bg-slate-900 border-slate-700 text-white text-sm" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-slate-400 text-xs">CTA Button Link Action</Label>
                        <select 
                          value={block.content?.ctaLink || "phone"} 
                          onChange={(e) => updateBlock(idx, "ctaLink", e.target.value)} 
                          className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg block w-full p-2"
                        >
                          <option value="phone">📞 Phone Call (Dial Number)</option>
                          <option value="form">📝 Form Section (Scroll down to Form)</option>
                        </select>
                      </div>
                    </div>

                    {/* ── BOARDING PASS HERO SPECIFIC FIELDS ── */}
                    {block.type === "boarding_pass_hero" && (
                      <div className="border-t border-slate-800 pt-3 space-y-3">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">🎫 Ticket Design Properties</span>
                        <div className="space-y-1">
                          <Label className="text-slate-400 text-xs">Top Alert Bar Announcement</Label>
                          <Input value={block.content?.topAlertText || ""} onChange={(e) => updateBlock(idx, "topAlertText", e.target.value)} placeholder="PENDING LOCK: Call VIP Desk..." className="bg-slate-900 border-slate-700 text-white text-sm" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Departure Code</Label>
                            <Input value={block.content?.departureCode || ""} onChange={(e) => updateBlock(idx, "departureCode", e.target.value)} placeholder="NYC" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Departure Name</Label>
                            <Input value={block.content?.departureName || ""} onChange={(e) => updateBlock(idx, "departureName", e.target.value)} placeholder="New York, USA" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Destination Code</Label>
                            <Input value={block.content?.destinationCode || ""} onChange={(e) => updateBlock(idx, "destinationCode", e.target.value)} placeholder="PAR" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Destination Name</Label>
                            <Input value={block.content?.destinationName || ""} onChange={(e) => updateBlock(idx, "destinationName", e.target.value)} placeholder="Paris, France" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Flight / Direct text</Label>
                            <Input value={block.content?.flightDirectText || ""} onChange={(e) => updateBlock(idx, "flightDirectText", e.target.value)} placeholder="AV-2026 DIRECT" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Passenger Name</Label>
                            <Input value={block.content?.passengerName || ""} onChange={(e) => updateBlock(idx, "passengerName", e.target.value)} placeholder="RESERVED FOR YOU" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Seat Number</Label>
                            <Input value={block.content?.seatNumber || ""} onChange={(e) => updateBlock(idx, "seatNumber", e.target.value)} placeholder="12A (Window)" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Boarding Time</Label>
                            <Input value={block.content?.boardingTime || ""} onChange={(e) => updateBlock(idx, "boardingTime", e.target.value)} placeholder="IMMEDIATE" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Stub Title Badge</Label>
                            <Input value={block.content?.stubTitle || ""} onChange={(e) => updateBlock(idx, "stubTitle", e.target.value)} placeholder="AV-STUB" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Receipt Class</Label>
                            <Input value={block.content?.receiptClass || ""} onChange={(e) => updateBlock(idx, "receiptClass", e.target.value)} placeholder="First Class" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Receipt Offer Rate</Label>
                            <Input value={block.content?.receiptOfferRate || ""} onChange={(e) => updateBlock(idx, "receiptOfferRate", e.target.value)} placeholder="Save Up To 40%" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Receipt Status</Label>
                            <Input value={block.content?.receiptStatus || ""} onChange={(e) => updateBlock(idx, "receiptStatus", e.target.value)} placeholder="Hold Active" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Receipt Route Path</Label>
                            <Input value={block.content?.receiptRoute || ""} onChange={(e) => updateBlock(idx, "receiptRoute", e.target.value)} placeholder="NYC ➔ PAR" className="bg-slate-900 border-slate-700 text-white text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Barcode Bottom Label</Label>
                            <Input value={block.content?.barcodeText || ""} onChange={(e) => updateBlock(idx, "barcodeText", e.target.value)} placeholder="*AV-HOLD-CLAIM*" className="bg-slate-900 border-slate-700 text-white text-sm" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── STANDARD HERO WITH GLASS TICKET MOCK ── */}
                    {block.type === "hero" && (
                      <div className="border-t border-slate-800 pt-3 space-y-3">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest block">🎫 Right-Side Glass Pass Mockup</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Origin Code</Label>
                            <Input value={block.content?.ticketOriginCode || ""} onChange={(e) => updateBlock(idx, "ticketOriginCode", e.target.value)} placeholder="USA" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Origin Name</Label>
                            <Input value={block.content?.ticketOriginName || ""} onChange={(e) => updateBlock(idx, "ticketOriginName", e.target.value)} placeholder="United States" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Dest Code</Label>
                            <Input value={block.content?.ticketDestCode || ""} onChange={(e) => updateBlock(idx, "ticketDestCode", e.target.value)} placeholder="PAR" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Dest Name</Label>
                            <Input value={block.content?.ticketDestName || ""} onChange={(e) => updateBlock(idx, "ticketDestName", e.target.value)} placeholder="Paris, France" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Economy Badge</Label>
                            <Input value={block.content?.ticketEconomyBadge || ""} onChange={(e) => updateBlock(idx, "ticketEconomyBadge", e.target.value)} placeholder="ECONOMY" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Class Type Label</Label>
                            <Input value={block.content?.ticketClassType || ""} onChange={(e) => updateBlock(idx, "ticketClassType", e.target.value)} placeholder="First & Business" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Offer Code</Label>
                            <Input value={block.content?.ticketOfferCode || ""} onChange={(e) => updateBlock(idx, "ticketOfferCode", e.target.value)} placeholder="SAVE40-AV" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-[10px]">Available Seats</Label>
                            <Input value={block.content?.ticketAvailableSeats || ""} onChange={(e) => updateBlock(idx, "ticketAvailableSeats", e.target.value)} placeholder="9 Left Today" className="bg-slate-900 border-slate-700 text-white text-xs" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Average Saving Info</Label>
                            <Input value={block.content?.ticketAvgSaving || ""} onChange={(e) => updateBlock(idx, "ticketAvgSaving", e.target.value)} placeholder="$200 - $450" className="bg-slate-900 border-slate-700 text-white text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Callout CTA Text</Label>
                            <Input value={block.content?.ticketCalloutText || ""} onChange={(e) => updateBlock(idx, "ticketCalloutText", e.target.value)} placeholder="Call Desk to Claim Offer" className="bg-slate-900 border-slate-700 text-white text-sm" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Testimonials Editor ── */}
                {block.type === "testimonials" && (
                  <div className="space-y-3">
                    {(block.content?.testimonials || [{ quote: "", author: "", location: "", rating: 5 }]).map((t: any, tIdx: number) => (
                      <div key={tIdx} className="bg-slate-950/50 rounded-xl p-3 space-y-2 border border-slate-800">
                        <Textarea value={t.quote} onChange={(e) => {
                          const items = [...(block.content?.testimonials || [])];
                          items[tIdx] = { ...items[tIdx], quote: e.target.value };
                          updateBlock(idx, "testimonials", items);
                        }} placeholder="Quote text..." rows={2} className="bg-slate-900 border-slate-700 text-white text-sm" />
                        <div className="grid grid-cols-3 gap-2">
                          <Input value={t.author || ""} onChange={(e) => {
                            const items = [...(block.content?.testimonials || [])];
                            items[tIdx] = { ...items[tIdx], author: e.target.value };
                            updateBlock(idx, "testimonials", items);
                          }} placeholder="Author" className="bg-slate-900 border-slate-700 text-white text-sm" />
                          <Input value={t.location || ""} onChange={(e) => {
                            const items = [...(block.content?.testimonials || [])];
                            items[tIdx] = { ...items[tIdx], location: e.target.value };
                            updateBlock(idx, "testimonials", items);
                          }} placeholder="Location" className="bg-slate-900 border-slate-700 text-white text-sm" />
                          <Button type="button" size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => {
                            const items = (block.content?.testimonials || []).filter((_: any, i: number) => i !== tIdx);
                            updateBlock(idx, "testimonials", items);
                          }}>
                            <Trash2 className="w-3 h-3 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => {
                      const items = [...(block.content?.testimonials || []), { quote: "", author: "", location: "", rating: 5 }];
                      updateBlock(idx, "testimonials", items);
                    }}>
                      <Plus className="w-3 h-3 mr-1" /> Add Testimonial
                    </Button>
                  </div>
                )}

                {/* ── FAQ Editor ── */}
                {block.type === "faq" && (
                  <div className="space-y-3">
                    {(block.content?.faqs || [{ q: "", a: "" }]).map((f: any, fIdx: number) => (
                      <div key={fIdx} className="bg-slate-950/50 rounded-xl p-3 space-y-2 border border-slate-800">
                        <Input value={f.q || ""} onChange={(e) => {
                          const items = [...(block.content?.faqs || [])];
                          items[fIdx] = { ...items[fIdx], q: e.target.value };
                          updateBlock(idx, "faqs", items);
                        }} placeholder="Question" className="bg-slate-900 border-slate-700 text-white text-sm" />
                        <Textarea value={f.a || ""} onChange={(e) => {
                          const items = [...(block.content?.faqs || [])];
                          items[fIdx] = { ...items[fIdx], a: e.target.value };
                          updateBlock(idx, "faqs", items);
                        }} placeholder="Answer" rows={2} className="bg-slate-900 border-slate-700 text-white text-sm" />
                        <Button type="button" size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => {
                          const items = (block.content?.faqs || []).filter((_: any, i: number) => i !== fIdx);
                          updateBlock(idx, "faqs", items);
                        }}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                        </Button>
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => {
                      const items = [...(block.content?.faqs || []), { q: "", a: "" }];
                      updateBlock(idx, "faqs", items);
                    }}>
                      <Plus className="w-3 h-3 mr-1" /> Add FAQ
                    </Button>
                  </div>
                )}

                {/* ── Features Editor ── */}
                {block.type === "features" && (
                  <div className="space-y-3">
                    {(block.content?.features || [{ icon: "", title: "", desc: "" }]).map((f: any, fIdx: number) => (
                      <div key={fIdx} className="bg-slate-950/50 rounded-xl p-3 space-y-2 border border-slate-800">
                        <div className="grid grid-cols-4 gap-2">
                          <Input value={f.icon || ""} onChange={(e) => {
                            const items = [...(block.content?.features || [])];
                            items[fIdx] = { ...items[fIdx], icon: e.target.value };
                            updateBlock(idx, "features", items);
                          }} placeholder="Emoji 💰" className="bg-slate-900 border-slate-700 text-white text-sm" />
                          <Input value={f.title || ""} onChange={(e) => {
                            const items = [...(block.content?.features || [])];
                            items[fIdx] = { ...items[fIdx], title: e.target.value };
                            updateBlock(idx, "features", items);
                          }} placeholder="Feature Title" className="bg-slate-900 border-slate-700 text-white text-sm col-span-2" />
                          <Button type="button" size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => {
                            const items = (block.content?.features || []).filter((_: any, i: number) => i !== fIdx);
                            updateBlock(idx, "features", items);
                          }}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Del
                          </Button>
                        </div>
                        <Textarea value={f.desc || ""} onChange={(e) => {
                          const items = [...(block.content?.features || [])];
                          items[fIdx] = { ...items[fIdx], desc: e.target.value };
                          updateBlock(idx, "features", items);
                        }} placeholder="Description" rows={1} className="bg-slate-900 border-slate-700 text-white text-sm" />
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => {
                      const items = [...(block.content?.features || []), { icon: "", title: "", desc: "" }];
                      updateBlock(idx, "features", items);
                    }}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature
                    </Button>
                  </div>
                )}

                {/* ── Partners / Boarding Pass Routes / Simple blocks ── */}
                {(block.type === "partners" || block.type === "boarding_pass_routes") && (
                  <p className="text-xs text-slate-500">This block auto-renders from your active landing pages and route configuration.</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ── */
export default function AdminLandingPagesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState<"template" | "form">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPageItem | null>(null);

  /* ── Fetch ── */
  const { data: pages, isLoading, refetch } = useQuery<LandingPageItem[]>({
    queryKey: ["landingPages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/landing-pages");
      if (!res.ok) throw new Error("Failed to load landing pages");
      return res.json();
    },
  });

  /* ── Create Mutation ── */
  const createPageMutation = useMutation({
    mutationFn: async (newPage: any) => {
      const template = TEMPLATES.find((t) => t.id === newPage.templateId) || TEMPLATES[0];
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPage,
          blocks: template.blocks.map((type) => {
            let content: any = {};
            if (type === "hero" || type === "boarding_pass_hero") {
              content = { 
                title: newPage.title || "Direct Airline Connection & Reservation Desk", 
                subtitle: newPage.description || "Avoid long hold times. Speak directly to a ticketing specialist for instant flight bookings, modifications, or cancellations.", 
                ctaText: template.ctaText,
                badgeText: newPage.templateId === "airlines-helpdesk" ? "24/7 AIRLINE CONNECTION DESK" : "VIP FIRST CLASS"
              };
              if (newPage.templateId === "airlines-helpdesk" && type === "boarding_pass_hero") {
                content.topAlertText = "AIRLINE SUPPORT HOTLINE: Call Connection Desk for Direct Reservations, Cancellations & Ticket Changes";
              }
            } else if (type === "features" && newPage.templateId === "airlines-helpdesk") {
              content = {
                features: [
                  { icon: "📞", title: "Zero Hold Times", desc: "Skip hold queues and get directly connected to a live support desk agent." },
                  { icon: "✈️", title: "500+ Airlines Support", desc: "Instant support and reservation assistance across all global and local carriers." },
                  { icon: "🛠️", title: "Cancellations & Changes", desc: "Quickly modify, rebook, or process cancellations with professional desk support." },
                  { icon: "👑", title: "Premium Cabin Upgrades", desc: "Get bulk discounts and upgrade your tickets to Premium Economy or Business Class." },
                ]
              };
            } else if (type === "faq" && newPage.templateId === "airlines-helpdesk") {
              content = {
                faqs: [
                  { q: "How do I change my flight booking?", a: "Call our helpdesk agent. We will handle all details, rebooking options, and seat modifications directly with the carrier." },
                  { q: "Can I upgrade my cabin to Business Class?", a: "Yes, call our specialists to access exclusive contract rates for Premium Economy and Business Class seats." },
                  { q: "How quickly can I cancel or refund a ticket?", a: "Our connection desk agent will check refund eligibility and process cancellations in under 5 minutes over the phone." }
                ]
              };
            }
            return { type, content };
          }),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create page");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "🚀 Landing Page Created!", description: "Your page is ready to publish." });
      setCreateOpen(false);
      setStep("template");
      setSelectedTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["landingPages"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  /* ── Edit Mutation ── */
  const editPageMutation = useMutation({
    mutationFn: async (updatedPage: any) => {
      const { _id, ...fields } = updatedPage;
      const res = await fetch(`/api/admin/landing-pages/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update page");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "📝 Landing Page Updated!" });
      setEditOpen(false);
      setEditingPage(null);
      queryClient.invalidateQueries({ queryKey: ["landingPages"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  /* ── Toggle Publish ── */
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const res = await fetch(`/api/admin/landing-pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });
      if (!res.ok) throw new Error("Failed to toggle publish state");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Status Updated" });
      queryClient.invalidateQueries({ queryKey: ["landingPages"] });
    },
  });

  /* ── Delete ── */
  const handleDeletePage = async (id: string) => {
    if (!confirm("Delete this landing page?")) return;
    try {
      const res = await fetch(`/api/admin/landing-pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "🗑️ Page Deleted" });
      queryClient.invalidateQueries({ queryKey: ["landingPages"] });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  /* ── Submit ── */
  const handleCreatePage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    createPageMutation.mutate({ ...data, templateId: selectedTemplate?.id });
  };

  /* ── Open Dialog Reset ── */
  const openCreateDialog = () => {
    setStep("template");
    setSelectedTemplate(null);
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5" />
        <div className="relative">
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <MousePointerClick className="w-6 h-6 text-primary" />
            Landing Page Generator
          </h1>
          <p className="text-slate-400 text-sm">
            Select a template → Fill details → Publish instantly
          </p>
        </div>
        <div className="flex gap-2 relative">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Sparkles className="w-4 h-4 mr-2" /> Create Page
          </Button>
        </div>
      </div>

      {/* ── Create Dialog ── */}
      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) { setStep("template"); setSelectedTemplate(null); }
        }}
      >
        <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-3xl">
          {step === "template" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                  Choose a Template
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Pick the template that matches your campaign type.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => { setSelectedTemplate(template); setStep("form"); }}
                    className="group relative overflow-hidden rounded-2xl border border-slate-800 hover:border-slate-600 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className={`h-16 bg-gradient-to-br ${template.gradient} flex items-center px-5`}>
                      <span className="text-2xl font-black text-white">{template.name}</span>
                    </div>
                    <div className="p-4 bg-slate-900">
                      <p className="text-xs text-slate-400 mb-3">{template.desc}</p>
                      <ul className="space-y-1">
                        {template.preview.map((item, i) => (
                          <li key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-green-500" /> {item}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-end text-primary text-xs font-bold">
                        Use Template <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "form" && selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep("template")}
                    className="text-slate-400 hover:text-white text-sm"
                  >← Back</button>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${selectedTemplate.gradient}`} />
                      {selectedTemplate.name} — Page Details
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs">
                      Fill in the page details. All blocks auto-generated.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleCreatePage} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label className="text-slate-300">Page Title *</Label>
                  <Input
                    required
                    name="title"
                    placeholder="Cheap Flights to Paris — Save up to 40%"
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-300">URL Slug *</Label>
                    <Input
                      required
                      name="slug"
                      placeholder="cheap-flights-paris"
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <p className="text-[11px] text-slate-500">merrytravelo.com/lp/your-slug</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-300 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-green-400" /> Call Phone Number
                    </Label>
                    <Input
                      name="callPhone"
                      placeholder="+18772518760"
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <p className="text-[11px] text-slate-500">All Call Now buttons use this</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300">Page Description / Subtitle</Label>
                  <Textarea
                    name="description"
                    placeholder="Compare flights and get expert help finding the best fares..."
                    rows={2}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs">SEO Title (optional)</Label>
                    <Input
                      name="seoTitle"
                      placeholder="Cheap Flights to Paris | MerryTravelo Flights"
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs">SEO Meta Description</Label>
                    <Input
                      name="seoDescription"
                      placeholder="Best flight deals..."
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Auto-generated blocks:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.blocks.map((block) => (
                      <span key={block} className="text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full uppercase">
                        {block}
                      </span>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setStep("template")} className="text-slate-400">
                    ← Change Template
                  </Button>
                  <Button type="submit" disabled={createPageMutation.isPending}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {createPageMutation.isPending ? "Creating..." : "Generate Landing Page"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Standalone Edit Dialog Component Call to Prevent Focus Loss ── */}
      <EditLandingPageDialog
        isOpen={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditingPage(null);
        }}
        editingPage={editingPage}
        onSave={(updated) => editPageMutation.mutate(updated)}
        isSaving={editPageMutation.isPending}
      />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Pages", value: pages?.length || 0, color: "text-white" },
          { label: "Published", value: pages?.filter((p) => p.isPublished).length || 0, color: "text-green-400" },
          { label: "Drafts", value: pages?.filter((p) => !p.isPublished).length || 0, color: "text-amber-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Pages Table ── */}
      <div className="border border-slate-800 bg-slate-900/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/60">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Landing Page</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">URL</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Created</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Schema</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-800/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24 bg-slate-800" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : pages?.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-lg">No landing pages yet</p>
                    <p className="text-sm">Click "Create Page" and pick a template to get started!</p>
                  </TableCell>
                </TableRow>
              )
              : pages?.map((page) => (
                <TableRow key={page._id} className="border-slate-800/50 hover:bg-slate-900/30">
                  <TableCell>
                    <div className="font-bold text-slate-100">{page.title}</div>
                    <div className="text-xs text-slate-500 max-w-xs truncate mt-0.5">{page.description || "No description"}</div>
                    {page.callPhone && (
                      <a href={`tel:${page.callPhone}`} className="text-xs text-green-400 flex items-center gap-1 mt-1 hover:text-green-300 w-fit">
                        <Phone className="w-3.5 h-3.5" /> {page.callPhone}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/lp/${page.slug}`} target="_blank">
                      <span className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> /lp/{page.slug}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {page.schemaMarkup ? (
                      <span className="text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                        <Code className="w-3.5 h-3.5" /> JSON-LD
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full w-max">
                        Missing
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePublishMutation.mutate({ id: page._id, isPublished: !page.isPublished })}
                      className={`h-7 px-2.5 rounded-full text-xs font-black flex items-center gap-1 ${
                        page.isPublished
                          ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {page.isPublished
                        ? <><Check className="w-3.5 h-3.5" /> Live</>
                        : <><Zap className="w-3.5 h-3.5" /> Publish</>}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingPage(page);
                          setEditOpen(true);
                        }}
                        className="hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg w-8 h-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Link href={`/lp/${page.slug}`} target="_blank">
                        <Button size="icon" variant="ghost" className="hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg w-8 h-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeletePage(page._id)}
                        className="hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg w-8 h-8"
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
