import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { LandingPage } from "@/models/LandingPage";
import { getGlobalCallNumber } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";
import { LpCallButton } from "@/components/lp-call-button";
import {
  Plane,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Headphones,
  CalendarCheck,
  Users,
  Luggage,
  Sparkles,
  Lock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

const BASE_URL = siteConfig.url;
const BRAND_NAME = "MerryTravelo";

// Top domestic travel corridors for phone assistance
const DOMESTIC_CORRIDORS = [
  { city: "New York", code: "NYC", region: "Northeast", airports: "JFK, LGA, EWR" },
  { city: "Miami", code: "MIA", region: "Southeast", airports: "MIA, FLL" },
  { city: "Los Angeles", code: "LAX", region: "West Coast", airports: "LAX, BUR" },
  { city: "Chicago", code: "ORD", region: "Midwest", airports: "ORD, MDW" },
  { city: "Las Vegas", code: "LAS", region: "Southwest", airports: "LAS" },
  { city: "Orlando", code: "MCO", region: "Florida", airports: "MCO, SFB" },
  { city: "Dallas / Fort Worth", code: "DFW", region: "Texas", airports: "DFW, DAL" },
  { city: "San Francisco", code: "SFO", region: "California", airports: "SFO, OAK" },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let page: any = null;
  try {
    const dbPromise = (async () => {
      await connectToDatabase();
      return LandingPage.findOne({ slug: params.slug, isPublished: true }).lean();
    })();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 1500));
    page = (await Promise.race([dbPromise, timeoutPromise])) as any;
  } catch {
    // Fail silently when database is unavailable
  }

  const slug = (params.slug || "").toLowerCase();
  let defaultTitle = "USA Domestic Flight Booking Assistance";
  if (slug.includes("miami")) defaultTitle = "Flight Booking Assistance to Miami (MIA)";
  else if (slug.includes("london")) defaultTitle = "Flight Booking Assistance to London (LHR)";
  else if (slug.includes("new-york") || slug.includes("nyc")) defaultTitle = "Flight Booking Assistance to New York (NYC)";
  else if (slug.includes("los-angeles") || slug.includes("lax")) defaultTitle = "Flight Booking Assistance to Los Angeles (LAX)";
  else if (slug.includes("paris")) defaultTitle = "Flight Booking Assistance to Paris (CDG)";
  else if (slug.includes("dubai")) defaultTitle = "Flight Booking Assistance to Dubai (DXB)";

  const title = page?.seoTitle || page?.title || defaultTitle;
  const description =
    page?.seoDescription ||
    page?.description ||
    `Speak with our travel booking assistance team for ${title}. Call +1 877 251 8760 for direct flight guidance and phone reservations.`;

  const pageUrl = `${BASE_URL}/lp/${page?.slug || params.slug}`;

  return {
    title: `${title} | MerryTravelo Flight Assistance`,
    description,
    keywords: [
      title,
      "domestic flight assistance",
      "flight booking phone number",
      "airline booking assistance",
      "call airline reservation",
      "flight travel desk",
      BRAND_NAME,
    ].join(", "),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: BRAND_NAME,
      title: `${title} | MerryTravelo`,
      description,
      locale: "en_US",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    },
  };
}

export default async function DynamicLandingPage({ params }: PageProps) {
  let page: any = null;
  try {
    const dbPromise = (async () => {
      await connectToDatabase();
      return LandingPage.findOne({ slug: params.slug, isPublished: true }).lean();
    })();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 1500));
    page = (await Promise.race([dbPromise, timeoutPromise])) as any;
  } catch (err: any) {
    console.warn("[DynamicLandingPage] DB lookup timed out, serving dynamic route fallback:", err?.message);
  }

  const slug = (params.slug || "").toLowerCase();
  let routeContext = "USA Domestic Flights";
  if (slug.includes("london")) routeContext = "Flights to London (LHR)";
  else if (slug.includes("miami")) routeContext = "Flights to Miami (MIA)";
  else if (slug.includes("new-york") || slug.includes("nyc")) routeContext = "Flights to New York (NYC)";
  else if (slug.includes("los-angeles") || slug.includes("lax")) routeContext = "Flights to Los Angeles (LAX)";
  else if (slug.includes("paris")) routeContext = "Flights to Paris (CDG)";
  else if (slug.includes("dubai")) routeContext = "Flights to Dubai (DXB)";

  // Determine actual configured US telephone number
  let callPhone = "+18772518760";
  try {
    const fetched = await getGlobalCallNumber(params.slug);
    if (fetched) callPhone = fetched;
  } catch {
    callPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18772518760";
  }

  // Force override any legacy stale 855 numbers to MerryTravelo verified desk
  if (callPhone.includes("855") || callPhone.includes("510") || callPhone.includes("6415")) {
    callPhone = "+18772518760";
  }

  // Format phone display: +18772518760 -> +1 (877) 251-8760
  const digits = callPhone.replace(/[^0-9]/g, "");
  const formattedPhone = digits.length === 11 && digits.startsWith("1")
    ? `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    : callPhone;

  const pageUrl = `${BASE_URL}/lp/${params.slug}`;

  // Structured Data Schema for Phone Assistance
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: BRAND_NAME,
    url: BASE_URL,
    telephone: callPhone,
    priceRange: "$$",
    description: "USA Domestic Flight Booking Assistance & Passenger Travel Desk.",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: callPhone,
      contactType: "customer service",
      availableLanguage: ["English", "Spanish"],
      areaServed: "US",
    },
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#172B46] flex flex-col font-sans selection:bg-[#2676D9] selection:text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#102B4E] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></span>
            <span className="font-semibold text-slate-200 text-[11px] sm:text-xs">
              US Domestic Flight Booking Assistance Desk &bull; Direct Phone Reservations
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-xs">
            <span>Helpline:</span>
            <a
              href={`tel:${callPhone}`}
              className="font-bold text-white hover:text-[#3B82F6] transition-colors underline underline-offset-2 google-phone-number"
            >
              {formattedPhone}
            </a>
          </div>
        </div>
      </div>

      {/* ── Header / Navigation ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#102B4E] text-white flex items-center justify-center font-black shadow-sm group-hover:bg-[#2676D9] transition-colors">
              <Plane className="w-5 h-5 -rotate-45 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl text-[#102B4E] tracking-tight leading-none">
                MerryTravelo<span className="text-[#2676D9]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase mt-0.5">
                Flight Booking Assistance
              </span>
            </div>
          </Link>

          {/* Header Call CTA */}
          <LpCallButton
            variant="header"
            phoneNumber={callPhone}
            displayNumber={formattedPhone}
            destination={routeContext}
            id="lp-nav-call"
          />
        </div>
      </header>

      {/* ── Main Content Body ── */}
      <main className="flex-1">
        
        {/* ── 1. Hero Section (PHONE-CALL-ONLY Above-The-Fold) ── */}
        <section className="relative w-full overflow-hidden pt-18 sm:pt-24 pb-22 sm:pb-28 bg-[#0D223D] text-white">
          {/* High-Resolution Commercial Jet Aviation Background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2200&q=85"
            alt="USA Domestic Flight Aviation Sky Background"
            className="absolute inset-0 w-full h-full object-cover object-[center_35%] z-0 pointer-events-none select-none"
            loading="eager"
          />

          {/* Transparent Gradient Overlay — preserves vivid clouds & airplane wing while keeping text crisp */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0D223D]/80 via-[#102B4E]/50 to-[#0D223D]/95" />

          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            
            {/* Context Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
              <Plane className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>US Domestic Flight Booking Assistance</span>
            </div>

            {/* Exact Required Hero Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              Your Next Flight Starts With <br className="hidden sm:inline" />
              <span className="text-[#3B82F6]">a Simple Call.</span>
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
              Speak with our travel booking assistance team for help exploring domestic flights across the United States.
            </p>

            {/* Route Context Banner */}
            {routeContext && (
              <div className="inline-block bg-[#163A66] border border-white/15 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200">
                Assistance Desk Dedicated for: <strong className="text-white">{routeContext}</strong> &amp; US Routes
              </div>
            )}

            {/* ── Prominent Main Call CTA (Visually Dominant Above-The-Fold) ── */}
            <div className="pt-4">
              <LpCallButton
                variant="primary"
                phoneNumber={callPhone}
                displayNumber={formattedPhone}
                label="CALL NOW – SPEAK TO OUR TEAM"
                sublabel="Tap to connect instantly with a domestic travel representative &bull; No online forms"
                destination={routeContext}
                id="lp-hero-main-call"
              />
            </div>

            {/* Micro Reassurance Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300 font-semibold border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                Direct Representative Connection
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                No Complicated Online Search Forms
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                Full Schedule &amp; Baggage Review
              </span>
            </div>

          </div>
        </section>

        {/* ── 2. USA Domestic Flight Assistance Section ── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                <Headphones className="w-3.5 h-3.5 text-[#2676D9]" />
                Telephone Travel Support
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                How Our Travel Assistance Team Helps You
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto">
                Skip automated bots and complex online flight forms. Our dedicated specialists provide personal phone assistance for every travel requirement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Assistance Pillar 1 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#102B4E] mb-2">
                  New Flight Reservations
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Explore flight schedules, compare departure times, and reserve domestic tickets over the phone with an agent.
                </p>
                <div className="pt-3 border-t border-slate-200/60">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-pillar-1-call"
                  />
                </div>
              </div>

              {/* Assistance Pillar 2 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4">
                  <CalendarCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#102B4E] mb-2">
                  Flight Changes &amp; Rebooking
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Need to change your travel date, time, or route? Speak directly with our desk for modification guidance.
                </p>
                <div className="pt-3 border-t border-slate-200/60">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-pillar-2-call"
                  />
                </div>
              </div>

              {/* Assistance Pillar 3 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#102B4E] mb-2">
                  Group &amp; Family Bookings
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Coordinating travel for 4 or more passengers? We coordinate synchronized itineraries and seating arrangements.
                </p>
                <div className="pt-3 border-t border-slate-200/60">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-pillar-3-call"
                  />
                </div>
              </div>

              {/* Assistance Pillar 4 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4">
                  <Luggage className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#102B4E] mb-2">
                  Baggage &amp; Seat Guidance
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                  Understand baggage allowances, seat selections, and cabin tiers before confirming your domestic ticket.
                </p>
                <div className="pt-3 border-t border-slate-200/60">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-pillar-4-call"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. Booking Assistance Feature Cards ── */}
        <section className="py-16 sm:py-20 bg-[#F5F8FC] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                Why Call MerryTravelo For Domestic Flights?
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-xl mx-auto">
                Reliable, professional travel booking assistance designed around your schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#2676D9]/10 text-[#2676D9] flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#102B4E]">
                    Save Time with Direct Assistance
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Avoid scrolling through hundreds of confusing online search results. Tell our agent your origin, destination, and travel window, and we present tailored options immediately.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#2676D9]/10 text-[#2676D9] flex items-center justify-center shrink-0">
                  <Plane className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#102B4E]">
                    Multiple Airline Comparisons
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    We compare routes across major US airlines including Delta, American, United, Southwest, and regional partners to help you find the most convenient flight times.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#2676D9]/10 text-[#2676D9] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#102B4E]">
                    Full Itinerary Verification
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Every detail of your itinerary &mdash; flight numbers, departure terminals, baggage rules, and cancellation policies &mdash; is confirmed with you before finalizing.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#2676D9]/10 text-[#2676D9] flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#102B4E]">
                    Bank-Grade Data Security
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Your personal information, travel records, and transaction details are handled under strict 256-bit SSL encrypted security standards.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 4. Popular US Travel Corridors Inquiries ── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#2676D9]" />
                Domestic Travel Hubs
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                Popular US Domestic Flight Destinations
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-xl mx-auto">
                Call our assistance desk to inquire about flight availability and schedules to any of these top US travel destinations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {DOMESTIC_CORRIDORS.map((c) => (
                <div
                  key={c.code}
                  className="bg-[#F5F8FC] rounded-2xl p-5 border border-slate-200 hover:border-[#2676D9]/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#64748B]">{c.region}</span>
                      <span className="text-xs font-mono font-black text-[#2676D9] bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-[#102B4E]">
                      {c.city}
                    </h4>
                    <p className="text-xs text-[#64748B]">
                      Airports: {c.airports}
                    </p>
                  </div>

                  <a
                    href={`tel:${callPhone}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full bg-white hover:bg-[#102B4E] hover:text-white border border-slate-200 text-[#102B4E] text-xs font-bold py-2.5 rounded-xl transition-colors google-phone-number shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#2676D9]" />
                    <span>Inquire by Phone</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Reassurance Banner under corridors */}
            <div className="mt-12 text-center bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 max-w-2xl mx-auto">
              <p className="text-sm font-bold text-[#102B4E]">
                Traveling to another US city or regional airport?
              </p>
              <p className="text-xs text-[#64748B] mt-1 mb-3">
                Our assistance team handles flight inquiries for all commercial US airports nationwide.
              </p>
              <a
                href={`tel:${callPhone}`}
                className="inline-flex items-center gap-2 text-sm font-black text-[#2676D9] hover:underline google-phone-number"
              >
                <Phone className="w-4 h-4" />
                <span>Call Us at {formattedPhone}</span>
              </a>
            </div>

          </div>
        </section>

        {/* ── 5. Professional Customer Support Section ── */}
        <section className="relative overflow-hidden py-16 sm:py-20 bg-[#0D223D] text-white">
          {/* Subtle Aviation Sky Atmosphere */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=2000&q=80')"
            }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0D223D] via-transparent to-[#0D223D]" />

          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            
            <div className="w-16 h-16 rounded-2xl bg-[#2676D9] text-white flex items-center justify-center mx-auto shadow-lg">
              <Headphones className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Ready to Book Your Domestic Flight?
            </h2>

            <p className="text-slate-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Our travel specialists are standing by to help you compare airline schedules, select your preferred travel class, and finalize your tickets over the phone.
            </p>

            {/* Large Call CTA */}
            <div className="pt-2">
              <LpCallButton
                variant="primary"
                phoneNumber={callPhone}
                displayNumber={formattedPhone}
                label="CALL NOW – SPEAK TO OUR TEAM"
                destination={routeContext}
                id="lp-support-section-call"
              />
            </div>

            <p className="text-xs text-slate-300 font-medium">
              Toll-Free US Assistance Helpline: <strong className="text-white">{formattedPhone}</strong>
            </p>

          </div>
        </section>

      </main>

      {/* ── 6. Trust-Focused Footer with Genuine Company Information ── */}
      <footer className="bg-[#0D223D] text-white pt-14 pb-28 md:pb-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-white/10">
            
            {/* Col 1: Brand & Business Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2676D9] text-white flex items-center justify-center font-black">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-black text-xl text-white tracking-tight">
                  MerryTravelo<span className="text-[#3B82F6]">.</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
                MerryTravelo provides dedicated flight booking assistance for travelers across the United States. We assist passengers in finding and reserving domestic flights through personal phone support.
              </p>
            </div>

            {/* Col 2: Genuine Support Contacts */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Booking Assistance Desk
              </h4>
              <p className="text-xs text-slate-300">
                Market: <strong>United States Domestic Flights</strong>
              </p>
              <div className="pt-1">
                <a
                  href={`tel:${callPhone}`}
                  className="inline-flex items-center gap-2 text-white hover:text-[#3B82F6] font-bold text-sm google-phone-number"
                >
                  <Phone className="w-4 h-4 text-[#3B82F6]" />
                  <span>{formattedPhone}</span>
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Call assistance available for reservation inquiries and schedule checks.
              </p>
            </div>

            {/* Col 3: Legal & Consumer Information */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Legal &amp; Transparency
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Regulatory Disclaimer */}
          <div className="pt-8 text-center text-xs text-slate-400 space-y-2.5">
            <p className="max-w-4xl mx-auto leading-relaxed text-[11px] text-slate-400">
              <strong>Disclaimer:</strong> MerryTravelo is an independent travel agency providing domestic flight booking assistance. We are not directly affiliated with, sponsored by, or endorsed by Delta Air Lines, American Airlines, United Airlines, Southwest Airlines, or any specific carrier. All registered airline trademarks, logos, and carrier names are the property of their respective owners. Flight availability, schedules, and fares are determined by carrier inventory.
            </p>
            <p className="text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} MerryTravelo. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* ── 7. Sticky Mobile Bottom Call Now Button ── */}
      <LpCallButton
        variant="sticky"
        phoneNumber={callPhone}
        displayNumber={formattedPhone}
        label="CALL NOW – SPEAK TO OUR TEAM"
        destination={routeContext}
        id="lp-mobile-sticky-call"
      />
    </div>
  );
}
