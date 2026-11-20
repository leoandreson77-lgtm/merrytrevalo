import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  Star,
  Check,
  X,
  HelpCircle,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

const BASE_URL = siteConfig.url;
const BRAND_NAME = "MerryTravelo";

// Popular destinations with local image assets for 100% reliability
const FEATURED_ROUTES = [
  {
    city: "New York City",
    code: "NYC",
    airports: "JFK, LGA, EWR",
    image: "/destinations/new-york.png",
    tagline: "Times Square, Broadway & Manhattan",
  },
  {
    city: "Miami",
    code: "MIA",
    airports: "MIA, FLL",
    image: "/destinations/miami.png",
    tagline: "South Beach, Sunshine & Nightlife",
  },
  {
    city: "Las Vegas",
    code: "LAS",
    airports: "LAS (Harry Reid)",
    image: "/destinations/las-vegas.png",
    tagline: "The Strip, Shows & Grand Canyon",
  },
  {
    city: "Los Angeles",
    code: "LAX",
    airports: "LAX, BUR, SNA",
    image: "/destinations/los-angeles.png",
    tagline: "Hollywood, Beverly Hills & Coastline",
  },
  {
    city: "San Francisco",
    code: "SFO",
    airports: "SFO, OAK",
    image: "/destinations/san-francisco.png",
    tagline: "Golden Gate, Bay Area & Wharf",
  },
  {
    city: "Honolulu (Hawaii)",
    code: "HNL",
    airports: "HNL (Daniel K. Inouye)",
    image: "/destinations/hawaii.png",
    tagline: "Waikiki Beach, Paradise & Volcanoes",
  },
];

// Major commercial carriers compared
const SUPPORTED_AIRLINES = [
  "Delta Air Lines",
  "American Airlines",
  "United Airlines",
  "Southwest Airlines",
  "British Airways",
  "Alaska Airlines",
  "JetBlue Airways",
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
    `Speak directly with our flight booking assistance team for ${title}. Call +1 877 251 8760 for unpublished phone fares and live reservations.`;

  const pageUrl = `${BASE_URL}/lp/${page?.slug || params.slug}`;

  return {
    title: `${title} | MerryTravelo Flight Desk`,
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
    alternates: { canonical: pageUrl },
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
  let destIata = "USA";
  if (slug.includes("london")) { routeContext = "Flights to London (LHR)"; destIata = "LHR"; }
  else if (slug.includes("miami")) { routeContext = "Flights to Miami (MIA)"; destIata = "MIA"; }
  else if (slug.includes("new-york") || slug.includes("nyc")) { routeContext = "Flights to New York (NYC)"; destIata = "NYC"; }
  else if (slug.includes("los-angeles") || slug.includes("lax")) { routeContext = "Flights to Los Angeles (LAX)"; destIata = "LAX"; }
  else if (slug.includes("paris")) { routeContext = "Flights to Paris (CDG)"; destIata = "CDG"; }
  else if (slug.includes("dubai")) { routeContext = "Flights to Dubai (DXB)"; destIata = "DXB"; }

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

  // Structured Data Schema for Phone Assistance
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: BRAND_NAME,
    url: BASE_URL,
    telephone: callPhone,
    priceRange: "$$",
    description: "USA Domestic Flight Booking Assistance & Passenger Travel Desk.",
    areaServed: { "@type": "Country", name: "United States" },
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

      {/* ── Top Reassurance Ticker ── */}
      <div className="bg-[#0B1E36] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200 text-[11px] sm:text-xs">
              Live Flight Booking Assistance Desk &bull; Wait Time: <strong className="text-emerald-400">Under 30 Seconds</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-xs">
            <span>Direct Agent Line:</span>
            <a
              href={`tel:${callPhone}`}
              className="font-bold text-white hover:text-[#3B82F6] transition-colors underline underline-offset-2 google-phone-number font-mono"
            >
              {formattedPhone}
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
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
        <section className="relative w-full overflow-hidden pt-12 sm:pt-18 pb-20 sm:pb-28 bg-[#0D223D] text-white">
          
          {/* ── Realistic Photographic Aviation Sky Background ── */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2200&q=85"
            alt="Airplane in flight above blue sky and clouds"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%] z-0 pointer-events-none select-none"
            loading="eager"
          />

          {/* ── Rich Multi-Stop Sky Gradient & Radar Path Lines ── */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0B1E36]/80 via-[#102B4E]/60 to-[#0B1E36]/95" />
          
          {/* Subtle Decorative Radar & Flight Coordinate Grid */}
          <div 
            className="absolute inset-0 z-10 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />

          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-7">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 bg-[#102B4E]/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Travel Specialists Online &bull; Direct Agent Connection</span>
            </div>

            {/* Exact Required Hero Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15] drop-shadow-md">
              Your Next Flight Starts With <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-white bg-clip-text text-transparent">
                a Simple Call.
              </span>
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-slate-100 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Speak with our travel booking assistance team for help exploring domestic flights across the United States.
            </p>

            {/* ── Premium Hero Boarding Card with Glowing Call CTA ── */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="bg-[#102B4E]/85 backdrop-blur-xl border border-white/25 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
                
                {/* Route Context Banner inside card */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-white/15 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Plane className="w-4 h-4 text-[#3B82F6]" />
                    <span>Assistance Desk: <strong className="text-cyan-200">{routeContext}</strong></span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    ● Phone Rates Active
                  </span>
                </div>

                {/* Main Prominent Call Button */}
                <LpCallButton
                  variant="primary"
                  phoneNumber={callPhone}
                  displayNumber={formattedPhone}
                  label="CALL NOW – SPEAK TO OUR TEAM"
                  sublabel="Direct line to live domestic flight ticketing desk • Toll-free • Zero hold queues"
                  destination={routeContext}
                  id="lp-hero-main-call"
                />

                {/* Micro trust icons */}
                <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs text-slate-200 font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span>Unpublished Fares</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span>No Online Forms</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                    <span>Instant Seat Lock</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── 2. Supported Carriers Reassurance Banner ── */}
        <section className="bg-white border-b border-slate-200/90 py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs font-black uppercase tracking-wider text-[#64748B] text-center md:text-left shrink-0">
              Assistance Available Across Top Airlines:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-[#102B4E]">
              {SUPPORTED_AIRLINES.map((airline) => (
                <span
                  key={airline}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F8FC] border border-slate-200/90 text-slate-700 shadow-2xs"
                >
                  {airline}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. USA Domestic Flight Assistance Pillars ── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                <Headphones className="w-3.5 h-3.5 text-[#2676D9]" />
                Dedicated Travel Services
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                How Our Flight Assistance Team Helps You
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto">
                Skip long online search sessions and automated hold queues. Speak directly with a flight assistance agent for personalized travel support.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-lg hover:border-[#2676D9]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4 shadow-xs">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#102B4E] mb-2">
                    New Flight Reservations
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                    Compare real-time flight schedules across major carriers and lock in your domestic travel itinerary over the phone.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-card-1-call"
                  />
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-lg hover:border-[#2676D9]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4 shadow-xs">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#102B4E] mb-2">
                    Same-Day &amp; Urgent Flights
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                    Need to travel today or tomorrow? Our specialists quickly scan last-minute seat availability on commercial flights.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-card-2-call"
                  />
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-lg hover:border-[#2676D9]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4 shadow-xs">
                    <CalendarCheck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#102B4E] mb-2">
                    Date Changes &amp; Rebooking
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                    Need to modify an itinerary or change travel dates? Our agents provide immediate rebooking guidance over the phone.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-card-3-call"
                  />
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-lg hover:border-[#2676D9]/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4 shadow-xs">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#102B4E] mb-2">
                    Group &amp; Family Travel
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                    Coordinating travel for 4 or more passengers? We coordinate synchronized itineraries and preferred seating.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/80">
                  <LpCallButton
                    variant="pill"
                    phoneNumber={callPhone}
                    displayNumber={formattedPhone}
                    destination={routeContext}
                    id="lp-card-4-call"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 4. Why Call Us vs Online Search Engines (Side-by-Side CRO Comparison) ── */}
        <section className="py-16 sm:py-20 bg-[#F5F8FC] border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                Why Travelers Call Our Phone Booking Desk
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-xl mx-auto">
                Comparing the traditional online booking experience vs direct telephone assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column 1: Online Sites */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 mb-6 text-rose-600 font-black text-sm uppercase tracking-wider">
                  <X className="w-5 h-5 bg-rose-100 rounded-full p-1" />
                  <span>Public Online Travel Sites</span>
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-[#64748B]">
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Surprise baggage and seat selection fees added at final checkout</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Endless hold times and automated phone trees when you need help</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Automated chatbots unable to handle complex travel itineraries</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Confusing, rigid cancellation and change terms</span>
                  </li>
                </ul>
              </div>

              {/* Column 2: MerryTravelo Phone Desk (Highlighted) */}
              <div className="bg-gradient-to-br from-[#102B4E] to-[#163A66] text-white rounded-2xl p-6 sm:p-8 border-2 border-[#2676D9] shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6 text-emerald-400 font-black text-sm uppercase tracking-wider">
                  <Check className="w-5 h-5 bg-emerald-500/20 rounded-full p-1 border border-emerald-400/30" />
                  <span>MerryTravelo Telephone Desk</span>
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Upfront Pricing:</strong> Full airfare breakdowns discussed before confirming</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Instant Live Agent:</strong> Connect directly to a real ticketing representative in seconds</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Unpublished Bulk Discounts:</strong> Phone-only contract rates across major carriers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Personalized Guidance:</strong> Flexible date shifts, baggage advice &amp; seating support</span>
                  </li>
                </ul>

                <div className="mt-8 pt-5 border-t border-white/15 text-center">
                  <a
                    href={`tel:${callPhone}`}
                    className="inline-flex items-center justify-center gap-2 w-full bg-[#2676D9] hover:bg-[#3B82F6] text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all google-phone-number cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Speak to an Agent: {formattedPhone}</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 5. Popular Flight Routes Assistance Grid (With Real Local Images) ── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#2676D9]" />
                Top Travel Corridors
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                Popular Domestic &amp; Global Destinations
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-xl mx-auto">
                Call our assistance desk to check seat availability, schedules, and unpublished phone rates for any of these travel destinations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_ROUTES.map((route) => (
                <div
                  key={route.code}
                  className="group bg-[#F5F8FC] rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-xl hover:border-[#2676D9]/50 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={route.image}
                      alt={`Flights to ${route.city}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102B4E]/80 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h4 className="text-white text-xl font-black tracking-tight drop-shadow-sm">{route.city}</h4>
                        <p className="text-slate-200 text-xs font-medium">{route.tagline}</p>
                      </div>
                      <span className="bg-white/20 backdrop-blur-md text-white font-mono text-xs font-black px-2 py-1 rounded border border-white/30">
                        {route.code}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Action */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <p className="text-xs text-[#64748B] mb-4">
                      Direct phone inquiry available for departures across commercial US airports serving <strong>{route.airports}</strong>.
                    </p>

                    <a
                      href={`tel:${callPhone}`}
                      className="inline-flex items-center justify-center gap-2 w-full bg-white hover:bg-[#102B4E] hover:text-white border border-slate-200 text-[#102B4E] font-bold text-xs py-2.5 rounded-xl transition-all shadow-2xs google-phone-number cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#2676D9]" />
                      <span>Call to Inquire: {formattedPhone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Inquire about other cities */}
            <div className="mt-12 text-center bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 max-w-2xl mx-auto">
              <p className="text-sm font-bold text-[#102B4E]">
                Need flights to another US city or international airport?
              </p>
              <p className="text-xs text-[#64748B] mt-1 mb-3">
                Our assistance team handles flight inquiries for all commercial US and global airports worldwide.
              </p>
              <a
                href={`tel:${callPhone}`}
                className="inline-flex items-center gap-2 text-sm font-black text-[#2676D9] hover:underline google-phone-number"
              >
                <Phone className="w-4 h-4" />
                <span>Call Us Toll-Free at {formattedPhone}</span>
              </a>
            </div>

          </div>
        </section>

        {/* ── 6. Verified Passenger Reviews / Social Proof ── */}
        <section className="py-16 sm:py-20 bg-[#F5F8FC] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1 rounded-full text-xs font-bold text-[#102B4E] mb-3 shadow-2xs">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>4.9 / 5 Passenger Satisfaction Rating</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                What Travelers Say About Our Phone Assistance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#172B46] leading-relaxed italic">
                  &ldquo;I needed flights to London on short notice for work. The agent found a nonstop flight schedule and locked my seat in under 5 minutes without any hassle.&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#102B4E]">David M.</span>
                  <span>New York, NY</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#172B46] leading-relaxed italic">
                  &ldquo;Booking for a family of 5 is always frustrating on comparison websites. Calling the desk was a breeze &mdash; the agent seated us all together and confirmed everything clearly.&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#102B4E]">Sarah T.</span>
                  <span>Chicago, IL</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#172B46] leading-relaxed italic">
                  &ldquo;Had an unexpected family emergency and had to change my flight date. Called the helpline and they sorted out the new timing immediately with zero automated robot loops.&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#102B4E]">Robert K.</span>
                  <span>Miami, FL</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. Frequently Asked Questions (FAQ) ── */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#64748B]">
                Everything you need to know about our telephone flight booking assistance.
              </p>
            </div>

            <div className="space-y-4">
              
              <div className="bg-[#F5F8FC] rounded-2xl p-5 sm:p-6 border border-slate-200">
                <h4 className="font-bold text-[#102B4E] text-base mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2676D9] shrink-0" />
                  Why should I call instead of booking online?
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed pl-6">
                  Airlines often provide unpublished contract rates and bulk seat inventory directly to ticketing desks that cannot be listed on public comparison engines. Additionally, speaking with a specialist ensures your baggage rules, layover schedules, and seat preferences are verified before purchasing.
                </p>
              </div>

              <div className="bg-[#F5F8FC] rounded-2xl p-5 sm:p-6 border border-slate-200">
                <h4 className="font-bold text-[#102B4E] text-base mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2676D9] shrink-0" />
                  What information do I need when I call?
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed pl-6">
                  Simply tell our representative your departure city or airport code, your desired destination, approximate travel dates, and the number of travelers. We will review all available airline options with you.
                </p>
              </div>

              <div className="bg-[#F5F8FC] rounded-2xl p-5 sm:p-6 border border-slate-200">
                <h4 className="font-bold text-[#102B4E] text-base mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2676D9] shrink-0" />
                  Is there any obligation to book when I call?
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed pl-6">
                  No. Our flight consultations and quote inquiries are completely free. You can call to explore options, compare schedules, and decide when you are ready.
                </p>
              </div>

              <div className="bg-[#F5F8FC] rounded-2xl p-5 sm:p-6 border border-slate-200">
                <h4 className="font-bold text-[#102B4E] text-base mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2676D9] shrink-0" />
                  Can your team help with flight changes or cancellations?
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed pl-6">
                  Yes. Our travel desk assists with flight modifications, schedule shifts, and rebooking across supported commercial airlines.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── 8. Final Customer Support Call-To-Action Card ── */}
        <section className="py-16 sm:py-20 bg-[#0D223D] text-white relative overflow-hidden">
          {/* Subtle Glow & Flight Path Atmosphere */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-25 pointer-events-none"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=2000&q=80')"
            }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B1E36] via-[#0D223D]/90 to-[#0B1E36]" />

          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            
            <div className="w-16 h-16 rounded-2xl bg-[#2676D9] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <Headphones className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Ready to Book Your Flight?
            </h2>

            <p className="text-slate-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Our travel specialists are on the line right now to help you compare airline schedules and finalize your ticket over the phone.
            </p>

            <div className="pt-2">
              <LpCallButton
                variant="primary"
                phoneNumber={callPhone}
                displayNumber={formattedPhone}
                label="CALL NOW – SPEAK TO OUR TEAM"
                destination={routeContext}
                id="lp-final-cta-call"
              />
            </div>

            <p className="text-xs text-slate-300 font-medium">
              Toll-Free US Assistance Helpline: <strong className="text-white font-mono">{formattedPhone}</strong>
            </p>

          </div>
        </section>

      </main>

      {/* ── 9. Trust-Focused Footer with Genuine Company Information ── */}
      <footer className="bg-[#081525] text-white pt-14 pb-28 md:pb-12 border-t border-white/10 mt-auto">
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
                MerryTravelo provides dedicated flight booking assistance for travelers across the United States. We assist passengers in exploring and reserving domestic flights through personal phone support.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit SSL Encrypted &bull; PCI Compliant</span>
              </div>
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
                  className="inline-flex items-center gap-2 text-white hover:text-[#3B82F6] font-bold text-sm google-phone-number font-mono"
                >
                  <Phone className="w-4 h-4 text-[#3B82F6]" />
                  <span>{formattedPhone}</span>
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Dedicated telephone support for reservations, schedule guidance, and rebooking.
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
              <strong>Disclaimer:</strong> MerryTravelo is an independent online travel agency providing domestic flight booking assistance. We are not directly affiliated with, sponsored by, or endorsed by Delta Air Lines, American Airlines, United Airlines, Southwest Airlines, or any specific commercial carrier. All registered airline trademarks, carrier logos, and brand names are the property of their respective owners. Seat availability, schedules, and fares are determined by carrier inventory.
            </p>
            <p className="text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} MerryTravelo. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* ── 10. Sticky Mobile Bottom Call Now Bar ── */}
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
