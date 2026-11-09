"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Globe,
  Search,
  Megaphone,
  Share2,
  LayoutTemplate,
  Save,
  RefreshCw,
  CheckCircle2,
  ImageIcon,
  Link2,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Palette,
  Type,
  Star,
  Sparkles,
  Settings2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Bell,
  Plane,
  Ticket,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface CMSData {
  // Site Identity
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImageUrl: string;
  // Announcement
  announcementEnabled: boolean;
  announcementText: string;
  announcementColor: string;
  announcementLink: string;
  // Hero
  heroHeading: string;
  heroSubheading: string;
  heroBadgeText: string;
  heroCtaText: string;
  heroCtaUrl: string;
  // Contact
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  // Social
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  // Footer
  footerTagline: string;
  footerCopyright: string;
  googleTagManagerId?: string;
  googleAdsId?: string;
  googleAdsSendTo?: string;
  googleTagId?: string;
  popularRoutes?: Array<{
    title: string;
    slug: string;
    originCode: string;
    originName: string;
    destCode: string;
    destName: string;
    seat: string;
    gate: string;
    priceOff: string;
  }>;
}

const DEFAULT_CMS: CMSData = {
  siteName: "JetWithFly",
  siteTagline: "Book Cheap Flights Worldwide",
  logoUrl: "",
  faviconUrl: "",
  metaTitle: "JetWithFly - Book Cheap Flights Worldwide",
  metaDescription: "Compare cheap flights from over 500 airlines and travel agents worldwide with JetWithFly.",
  metaKeywords: "delta airlines flights, american airlines flights, delta flights booking, american flights booking, delta flight deals, american airlines flight deals, book delta tickets, book american tickets, cheap flights, airline tickets, travel deals, JetWithFly, jetwithfly.com, book flight tickets, flight booking, flight reservations, airline reservations, airline booking, domestic flights, international flights, last minute flights, same day flight booking, refundable flight tickets, business class flights, first class flights, round trip flights, one way flights, multi city flights, flight booking assistance, airline booking help, travel booking support, flight reservation support, change flight booking, cancel flight booking, flight rebooking, flight itinerary assistance",
  ogImageUrl: "",
  announcementEnabled: false,
  announcementText: "🎉 Limited-time deal! Save up to 40% on international flights this week.",
  announcementColor: "blue",
  announcementLink: "",
  heroHeading: "Find Your Perfect Flight",
  heroSubheading: "Compare prices across 500+ airlines. Book in minutes.",
  heroBadgeText: "✈️ Best Price Guarantee",
  heroCtaText: "Search Flights Now",
  heroCtaUrl: "/search",
  contactEmail: "support@skyswiftflights.com",
  contactPhone: "+18882566747",
  contactAddress: "United States",
  twitterUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  footerTagline: "Your trusted partner for affordable global travel.",
  footerCopyright: `© ${new Date().getFullYear()} JetWithFly Flights. All rights reserved.`,
  googleTagManagerId: "",
  googleAdsId: "",
  googleAdsSendTo: "",
  googleTagId: "",
  popularRoutes: [
    {
      title: "Cheap Flights to Paris",
      slug: "cheap-flights-to-paris",
      originCode: "NYC",
      originName: "New York, USA",
      destCode: "PAR",
      destName: "Paris, France",
      seat: "12A",
      gate: "B3",
      priceOff: "Save 40%",
    },
    {
      title: "Cheap Flights to London",
      slug: "cheap-flights-to-london",
      originCode: "NYC",
      originName: "New York, USA",
      destCode: "LON",
      destName: "London, UK",
      seat: "14C",
      gate: "A15",
      priceOff: "Save 35%",
    },
    {
      title: "Cheap Flights to Delhi",
      slug: "cheap-flights-to-delhi",
      originCode: "NYC",
      originName: "New York, USA",
      destCode: "DEL",
      destName: "Delhi, India",
      seat: "08D",
      gate: "C2",
      priceOff: "Save 45%",
    },
    {
      title: "Cheap Flights to Tokyo",
      slug: "cheap-flights-to-tokyo",
      originCode: "LAX",
      originName: "Los Angeles, USA",
      destCode: "NRT",
      destName: "Tokyo, Japan",
      seat: "16F",
      gate: "D8",
      priceOff: "Save 30%",
    },
    {
      title: "Cheap Flights to Rome",
      slug: "cheap-flights-to-rome",
      originCode: "MIA",
      originName: "Miami, USA",
      destCode: "FCO",
      destName: "Rome, Italy",
      seat: "11A",
      gate: "B9",
      priceOff: "Save 40%",
    },
    {
      title: "Cheap Flights to Dubai",
      slug: "cheap-flights-to-dubai",
      originCode: "NYC",
      originName: "New York, USA",
      destCode: "DXB",
      destName: "Dubai, UAE",
      seat: "07B",
      gate: "A4",
      priceOff: "Save 38%",
    },
  ],
};

// ────────────────────────────────────────────────────────────
// Section toggle component
// ────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeColor = "blue",
  children,
  defaultOpen = true,
}: {
  icon: any;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colors: Record<string, string> = {
    blue: "from-blue-600/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-600/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    emerald: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    amber: "from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    pink: "from-pink-600/20 to-pink-600/5 border-pink-500/20 text-pink-400",
    indigo: "from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400",
    rose: "from-rose-600/20 to-rose-600/5 border-rose-500/20 text-rose-400",
  };
  const iconBg = colors[badgeColor] || colors.blue;

  return (
    <div className="border border-slate-800 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-950 shadow-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-800/30 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${iconBg} border flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">{title}</h3>
              {badge && (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-br ${iconBg} border`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">{description}</p>
          </div>
        </div>
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-slate-800/60">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Field components
// ────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-slate-600">{hint}</p>}
    </div>
  );
}

function StyledInput({
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: any;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all placeholder-slate-600 ${Icon ? "pl-10" : ""}`}
      />
    </div>
  );
}

function StyledTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all placeholder-slate-600 resize-none"
    />
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function CMSSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const [cms, setCms] = useState<CMSData>(DEFAULT_CMS);

  const set = <K extends keyof CMSData>(key: K, value: CMSData[K]) =>
    setCms((prev) => ({ ...prev, [key]: value }));

  // Load existing CMS settings
  useQuery({
    queryKey: ["cmsSettings"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/cms");
        if (!res.ok) return DEFAULT_CMS;
        const json = await res.json();
        setCms({ ...DEFAULT_CMS, ...json });
        return json;
      } catch {
        return DEFAULT_CMS;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cms),
      });
      if (!res.ok) throw new Error("Failed to save CMS settings");
      return res.json();
    },
    onSuccess: () => {
      setSaved(true);
      toast({ title: "CMS Settings Saved ✅", description: "All site content settings updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["cmsSettings"] });
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => {
      toast({ title: "Save Failed", description: "Could not persist CMS settings. Check API connectivity.", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Top Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-accent/5 to-transparent pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
              <Settings2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white tracking-tight">CMS Settings</h1>
                <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full">
                  LIVE EDITOR
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Control every aspect of your site content — hero, SEO, announcements, social links & footer.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">Auto-deploy on save</span>
            </div>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                saved
                  ? "bg-green-600 text-white shadow-green-500/20"
                  : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-primary/30"
              } disabled:opacity-60`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Saved!
                </>
              ) : saveMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Site Identity ── */}
      <SectionCard
        icon={Globe}
        title="Site Identity"
        description="Brand name, tagline, logo & favicon"
        badge="Brand"
        badgeColor="blue"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Site Name" hint="Displayed in browser tab and header">
            <StyledInput
              value={cms.siteName}
              onChange={(v) => set("siteName", v)}
              placeholder="JetWithFly"
              icon={Plane}
            />
          </Field>
          <Field label="Tagline" hint="Short brand slogan shown below the logo">
            <StyledInput
              value={cms.siteTagline}
              onChange={(v) => set("siteTagline", v)}
              placeholder="Book Cheap Flights Worldwide"
              icon={Sparkles}
            />
          </Field>
          <Field label="Logo URL" hint="CDN or public URL for site logo image" className="md:col-span-1">
            <StyledInput
              value={cms.logoUrl}
              onChange={(v) => set("logoUrl", v)}
              placeholder="https://cdn.skyswiftflights.com/logo.svg"
              icon={ImageIcon}
            />
          </Field>
          <Field label="Favicon URL" hint="16×16 or 32×32 .ico or .png">
            <StyledInput
              value={cms.faviconUrl}
              onChange={(v) => set("faviconUrl", v)}
              placeholder="https://cdn.skyswiftflights.com/favicon.ico"
              icon={Star}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── SEO ── */}
      <SectionCard
        icon={Search}
        title="SEO & Meta Tags"
        description="Title tags, descriptions, Open Graph image"
        badge="SEO"
        badgeColor="emerald"
      >
        <div className="grid grid-cols-1 gap-5">
          <Field label="Meta Title" hint="Shown in Google results — keep under 60 characters">
            <StyledInput
              value={cms.metaTitle}
              onChange={(v) => set("metaTitle", v)}
              placeholder="JetWithFly - Book Cheap Flights Worldwide"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-[11px] font-mono ${cms.metaTitle.length > 60 ? "text-red-400" : "text-slate-500"}`}>
                {cms.metaTitle.length}/60 chars
              </span>
            </div>
          </Field>
          <Field label="Meta Description" hint="Google snippet — keep between 140–160 characters">
            <StyledTextarea
              value={cms.metaDescription}
              onChange={(v) => set("metaDescription", v)}
              placeholder="Compare cheap flights from over 500 airlines..."
              rows={2}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-[11px] font-mono ${cms.metaDescription.length > 160 ? "text-red-400" : "text-slate-500"}`}>
                {cms.metaDescription.length}/160 chars
              </span>
            </div>
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Meta Keywords" hint="Comma-separated SEO keywords">
              <StyledTextarea
                value={cms.metaKeywords}
                onChange={(v) => set("metaKeywords", v)}
                placeholder="cheap flights, airline tickets, travel deals"
                rows={2}
              />
            </Field>
            <Field label="OG / Social Share Image URL" hint="1200×630 image shown when sharing on social media">
              <StyledInput
                value={cms.ogImageUrl}
                onChange={(v) => set("ogImageUrl", v)}
                placeholder="https://cdn.skyswiftflights.com/og-image.jpg"
                icon={ImageIcon}
              />
              {cms.ogImageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 h-20">
                  <img src={cms.ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── Announcement Banner ── */}
      <SectionCard
        icon={Bell}
        title="Announcement Bar"
        description="Sitewide promotional banner shown above the header"
        badge="Marketing"
        badgeColor="amber"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div>
              <p className="font-bold text-white text-sm">Enable Announcement Bar</p>
              <p className="text-xs text-slate-500">Show or hide the promotional strip across all pages</p>
            </div>
            <button
              type="button"
              onClick={() => set("announcementEnabled", !cms.announcementEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                cms.announcementEnabled ? "bg-primary" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  cms.announcementEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {cms.announcementEnabled && (
            <>
              {/* Live preview */}
              <div
                className={`p-3 rounded-xl text-center text-sm font-semibold ${
                  cms.announcementColor === "blue"
                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                    : cms.announcementColor === "green"
                    ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-300"
                    : cms.announcementColor === "amber"
                    ? "bg-amber-600/20 border border-amber-500/30 text-amber-300"
                    : "bg-red-600/20 border border-red-500/30 text-red-300"
                }`}
              >
                <span className="text-xs uppercase tracking-widest font-black opacity-60 mr-2">PREVIEW</span>
                {cms.announcementText || "Your announcement text…"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Announcement Text">
                  <StyledInput
                    value={cms.announcementText}
                    onChange={(v) => set("announcementText", v)}
                    placeholder="🎉 Save 40% on international flights this week!"
                    icon={Megaphone}
                  />
                </Field>
                <Field label="Link URL (optional)" hint="Clicking the bar redirects here">
                  <StyledInput
                    value={cms.announcementLink}
                    onChange={(v) => set("announcementLink", v)}
                    placeholder="/deals"
                    icon={Link2}
                  />
                </Field>
              </div>
              <Field label="Bar Color Theme">
                <div className="flex gap-3">
                  {["blue", "green", "amber", "red"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("announcementColor", c)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                        cms.announcementColor === c
                          ? "border-white/40 bg-white/10 text-white"
                          : "border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          c === "blue"
                            ? "bg-blue-500"
                            : c === "green"
                            ? "bg-emerald-500"
                            : c === "amber"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}
        </div>
      </SectionCard>

      {/* ── Hero Section ── */}
      <SectionCard
        icon={LayoutTemplate}
        title="Homepage Hero"
        description="Heading, subheading, badge text & CTA button"
        badge="Homepage"
        badgeColor="purple"
      >
        <div className="space-y-5">
          {/* Live preview */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              {cms.heroBadgeText && (
                <span className="inline-block text-xs font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full mb-3">
                  {cms.heroBadgeText}
                </span>
              )}
              <h2 className="text-xl font-black text-white">{cms.heroHeading || "Your Hero Heading"}</h2>
              <p className="text-slate-400 text-sm mt-1">{cms.heroSubheading || "Your subheading text"}</p>
              {cms.heroCtaText && (
                <span className="inline-block mt-3 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl">
                  {cms.heroCtaText}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Badge Text" hint="Small pill above the heading">
              <StyledInput
                value={cms.heroBadgeText}
                onChange={(v) => set("heroBadgeText", v)}
                placeholder="✈️ Best Price Guarantee"
                icon={Star}
              />
            </Field>
            <Field label="CTA Button Text">
              <StyledInput
                value={cms.heroCtaText}
                onChange={(v) => set("heroCtaText", v)}
                placeholder="Search Flights Now"
              />
            </Field>
            <Field label="Hero Heading" className="md:col-span-2">
              <StyledInput
                value={cms.heroHeading}
                onChange={(v) => set("heroHeading", v)}
                placeholder="Find Your Perfect Flight"
                icon={Type}
              />
            </Field>
            <Field label="Hero Subheading" className="md:col-span-2">
              <StyledTextarea
                value={cms.heroSubheading}
                onChange={(v) => set("heroSubheading", v)}
                placeholder="Compare prices across 500+ airlines. Book in minutes."
                rows={2}
              />
            </Field>
            <Field label="CTA Button URL">
              <StyledInput
                value={cms.heroCtaUrl}
                onChange={(v) => set("heroCtaUrl", v)}
                placeholder="/search"
                icon={Link2}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── Contact Info ── */}
      <SectionCard
        icon={MapPin}
        title="Contact Information"
        description="Email, phone number and office address displayed on the contact page"
        badge="Contact"
        badgeColor="indigo"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Support Email">
            <StyledInput
              value={cms.contactEmail}
              onChange={(v) => set("contactEmail", v)}
              placeholder="support@skyswiftflights.com"
              type="email"
              icon={Mail}
            />
          </Field>
          <Field label="Phone Number">
            <StyledInput
              value={cms.contactPhone}
              onChange={(v) => set("contactPhone", v)}
              placeholder="+18882566747"
              icon={Phone}
            />
          </Field>
          <Field label="Office Address">
            <StyledInput
              value={cms.contactAddress}
              onChange={(v) => set("contactAddress", v)}
              placeholder="1234 Aviation Blvd, New York, NY"
              icon={MapPin}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Social Links ── */}
      <SectionCard
        icon={Share2}
        title="Social Media Links"
        description="Profiles shown in footer and contact sections"
        badge="Social"
        badgeColor="pink"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: "twitterUrl", label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/skyswiftflights" },
            { key: "facebookUrl", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/skyswiftflights" },
            { key: "instagramUrl", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/skyswiftflights" },
            { key: "youtubeUrl", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@skyswiftflights" },
            { key: "linkedinUrl", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/company/skyswiftflights" },
          ].map(({ key, label, icon, placeholder }) => (
            <Field key={key} label={label}>
              <StyledInput
                value={(cms as any)[key]}
                onChange={(v) => set(key as keyof CMSData, v)}
                placeholder={placeholder}
                icon={icon}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      {/* ── Footer ── */}
      <SectionCard
        icon={FileText}
        title="Footer Content"
        description="Tagline and copyright text displayed in the site footer"
        badge="Footer"
        badgeColor="rose"
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Footer Tagline" hint="Short brand description below logo in footer">
            <StyledTextarea
              value={cms.footerTagline}
              onChange={(v) => set("footerTagline", v)}
              placeholder="Your trusted partner for affordable global travel."
              rows={2}
            />
          </Field>
          <Field label="Copyright Text" hint="Displayed at very bottom of the footer">
            <StyledTextarea
              value={cms.footerCopyright}
              onChange={(v) => set("footerCopyright", v)}
              placeholder={`© ${new Date().getFullYear()} JetWithFly Flights. All rights reserved.`}
              rows={2}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Popular Flight Routes ── */}
      <SectionCard
        icon={Ticket}
        title="Popular Flight Routes (Boarding Passes)"
        description="Define the 6 popular flight routes shown as boarding pass tickets on the homepage"
        badge="Routes"
        badgeColor="amber"
        defaultOpen={false}
      >
        <div className="space-y-6">
          {(() => {
            const routesList = cms.popularRoutes || DEFAULT_CMS.popularRoutes || [];
            
            const updateRoute = (idx: number, field: string, val: string) => {
              const newList = [...routesList];
              if (!newList[idx]) {
                newList[idx] = { title: "", slug: "", originCode: "", originName: "", destCode: "", destName: "", seat: "12A", gate: "B3", priceOff: "Save 40%" };
              }
              newList[idx] = { ...newList[idx], [field]: val };
              set("popularRoutes", newList);
            };

            const deleteRoute = (idx: number) => {
              if (!confirm("Are you sure you want to delete this Boarding Pass route?")) return;
              const newList = routesList.filter((_: any, i: number) => i !== idx);
              set("popularRoutes", newList);
              toast({ title: "🗑️ Route Removed", description: "Route removed from CMS configuration." });
            };

            const addRoute = () => {
              const newList = [
                ...routesList,
                {
                  title: "Cheap Flights to Destination",
                  slug: "cheap-flights-to-destination",
                  originCode: "NYC",
                  originName: "New York, USA",
                  destCode: "LAX",
                  destName: "Los Angeles, USA",
                  seat: "14A",
                  gate: "B7",
                  priceOff: "Save 40%",
                },
              ];
              set("popularRoutes", newList);
              toast({ title: "✨ Route Added", description: "New boarding pass route created." });
            };

            return (
              <>
                {routesList.map((r: any, idx: number) => (
                  <div key={idx} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4 relative group">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                        Flight Route #{idx + 1} — {r.originCode || "NYC"} → {r.destCode || "DEST"}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteRoute(idx)}
                        className="h-8 px-3 text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Route
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Route Title / Headline</Label>
                        <Input
                          value={r.title || ""}
                          onChange={(e) => updateRoute(idx, "title", e.target.value)}
                          placeholder="e.g. Cheap Flights to Paris"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Target Landing Page Slug</Label>
                        <Input
                          value={r.slug || ""}
                          onChange={(e) => updateRoute(idx, "slug", e.target.value)}
                          placeholder="e.g. cheap-flights-to-paris"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Origin Code</Label>
                        <Input
                          value={r.originCode || ""}
                          onChange={(e) => updateRoute(idx, "originCode", e.target.value)}
                          placeholder="e.g. NYC"
                          maxLength={3}
                          className="bg-slate-900 border-slate-800 text-white text-sm uppercase"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Origin Name</Label>
                        <Input
                          value={r.originName || ""}
                          onChange={(e) => updateRoute(idx, "originName", e.target.value)}
                          placeholder="e.g. New York"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Dest Code</Label>
                        <Input
                          value={r.destCode || ""}
                          onChange={(e) => updateRoute(idx, "destCode", e.target.value)}
                          placeholder="e.g. PAR"
                          maxLength={3}
                          className="bg-slate-900 border-slate-800 text-white text-sm uppercase"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Dest Name</Label>
                        <Input
                          value={r.destName || ""}
                          onChange={(e) => updateRoute(idx, "destName", e.target.value)}
                          placeholder="e.g. Paris"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Seat</Label>
                        <Input
                          value={r.seat || ""}
                          onChange={(e) => updateRoute(idx, "seat", e.target.value)}
                          placeholder="e.g. 12A"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Gate</Label>
                        <Input
                          value={r.gate || ""}
                          onChange={(e) => updateRoute(idx, "gate", e.target.value)}
                          placeholder="e.g. B3"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Discount / Deal text</Label>
                        <Input
                          value={r.priceOff || ""}
                          onChange={(e) => updateRoute(idx, "priceOff", e.target.value)}
                          placeholder="e.g. Save 40%"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Baggage Allowance</Label>
                        <Input
                          value={r.baggage || ""}
                          onChange={(e) => updateRoute(idx, "baggage", e.target.value)}
                          placeholder="e.g. 1x Personal, 1x Carry-on (7kg)"
                          className="bg-slate-900 border-slate-800 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-slate-400 text-xs">In-flight Amenities (comma separated)</Label>
                      <Input
                        value={r.amenities || ""}
                        onChange={(e) => updateRoute(idx, "amenities", e.target.value)}
                        placeholder="e.g. Free Wi-Fi, Meal Included, Power Outlets"
                        className="bg-slate-900 border-slate-800 text-white text-sm"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addRoute}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold border border-slate-800 border-dashed py-6 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New Boarding Pass Route
                </Button>
              </>
            );
          })()}
        </div>
      </SectionCard>

      {/* ── Google Analytics & Conversion Tracking Settings ── */}
      <SectionCard
        icon={Globe}
        title="Google Analytics & Conversion Tracking"
        description="Configure your Google Tag Manager container, Google Ads, and Conversion Event IDs dynamically"
        badge="Analytics"
        badgeColor="indigo"
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Google Tag Manager Container ID" hint="e.g. GTM-XXXXXX">
            <StyledInput
              value={cms.googleTagManagerId || ""}
              onChange={(v) => set("googleTagManagerId", v)}
              placeholder="GTM-M35FZFH3"
              icon={Globe}
            />
          </Field>
          <Field label="Google Ads ID" hint="e.g. AW-XXXXXXXXX">
            <StyledInput
              value={cms.googleAdsId || ""}
              onChange={(v) => set("googleAdsId", v)}
              placeholder="AW-18305273332"
              icon={Globe}
            />
          </Field>
          <Field label="Google Ads Send-To Conversion Event" hint="e.g. AW-XXXXXXXXX/YYYYYYYYYYY">
            <StyledInput
              value={cms.googleAdsSendTo || ""}
              onChange={(v) => set("googleAdsSendTo", v)}
              placeholder="AW-18305273332/2hW1COCSudEcEPSb0ZhE"
              icon={Globe}
            />
          </Field>
          <Field label="Dynamic Google Tag ID" hint="e.g. AW-XXXXXXXXX">
            <StyledInput
              value={cms.googleTagId || ""}
              onChange={(v) => set("googleTagId", v)}
              placeholder="AW-18305273332"
              icon={Globe}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Save Button (sticky bottom) ── */}
      <div className="sticky bottom-6 z-50">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${saveMutation.isPending ? "bg-amber-400 animate-pulse" : saved ? "bg-green-400" : "bg-slate-600"}`} />
            <span className="text-sm font-medium text-slate-400">
              {saveMutation.isPending ? "Saving changes…" : saved ? "All changes saved successfully" : "Unsaved changes pending"}
            </span>
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              saved
                ? "bg-green-600 text-white"
                : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/20"
            } disabled:opacity-60`}
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : saveMutation.isPending ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save All Settings</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
