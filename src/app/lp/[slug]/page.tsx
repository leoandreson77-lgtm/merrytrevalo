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

      {/* ── Top Reassurance Ticker matching Image 1 ── */}
      <div className="bg-[#102B4E] text-white/90 text-xs py-1.5 px-4 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2676D9] text-[10px] font-bold text-white">✓</span>
            <span className="font-medium text-slate-200">
              Trusted US Domestic Flight Assistance Desk &bull; Unpublished Phone Rates &bull; Zero Online Forms
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <span className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#3B82F6]" />
              Customer Support:
            </span>
            <a
              href={`tel:${callPhone}`}
              className="font-bold text-white hover:text-[#3B82F6] transition-colors google-phone-number font-mono"
            >
              {formattedPhone}
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Header matching Image 1 ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#102B4E] text-white flex items-center justify-center font-black shadow-sm group-hover:bg-[#2676D9] transition-colors duration-200">
              <Plane className="w-5 h-5 -rotate-45 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl text-[#102B4E] tracking-tight leading-none">
                MerryTravelo<span className="text-[#2676D9]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase mt-0.5">
                US Flight Booking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 font-semibold text-sm text-[#172B46]">
            <Link 
              href="/#search-flights" 
              className="text-[#102B4E] hover:text-[#2676D9] transition-colors flex items-center gap-1 cursor-pointer"
            >
              Flights
            </Link>
            <Link 
              href="#destinations" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Destinations
            </Link>
            <Link 
              href="#why-call" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Why Call Us
            </Link>
            <Link 
              href="/about" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Contact
            </Link>
            <Link 
              href="#faq" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Customer Support
            </Link>
          </nav>

          {/* Header Call CTA */}
          <div className="flex items-center gap-2.5">
            <a
              href={`tel:${callPhone}`}
              id="lp-nav-call"
              className="inline-flex items-center gap-2 bg-[#F5F8FC] hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-full text-xs font-bold text-[#102B4E] transition-all shadow-xs google-phone-number cursor-pointer"
            >
              <span className="flex items-center justify-center w-5 h-5 bg-[#2676D9] text-white rounded-full">
                <Phone className="w-3 h-3" />
              </span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] font-medium text-[#64748B] hidden lg:inline">Phone Support</span>
                <span className="font-bold text-[#102B4E] text-xs sm:text-sm font-mono">{formattedPhone}</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Content Body ── */}
      <main className="flex-1">
        
        {/* ── 1. Hero Section (matching Image 1 visual style) ── */}
        <section className="relative w-full overflow-hidden pt-14 pb-28 sm:pb-36 bg-[#102B4E]">
          {/* Background Aviation Video with Navy Overlay matching Image 1 */}
          <video
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-25 mix-blend-luminosity pointer-events-none"
            src="https://v.ftcdn.net/02/21/46/45/700_F_221464511_i2BmrjoVhnAWB4KFZqbNIut4a46H2gNa.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23102B4E'/%3E%3C/svg%3E"
          />

          {/* Navy Gradient Overlay for high-contrast readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#102B4E]/95 via-[#102B4E]/80 to-[#102B4E]" />

          <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-4">
            
            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></span>
              <span>United States Domestic Flight Assistance Desk</span>
            </div>

            {/* Exact Required Hero Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight drop-shadow-sm text-white">
              Your Next Flight <br className="hidden sm:inline" />
              <span className="text-[#3B82F6]">Starts With a Simple Call.</span>
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-slate-200 font-medium leading-relaxed">
              Speak with our travel booking assistance team for help exploring domestic flights across the United States.
            </p>

            {/* Trust checkmarks */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                Unpublished Phone Fares
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                Zero Online Forms Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                Real-Time Seat Confirmation
              </span>
            </div>

          </div>
        </section>

        {/* ── 2. Primary Hero Conversion Card (Overlaps Hero like SearchWidget in Image 1) ── */}
        <section className="px-3 sm:px-4">
          <div className="w-full max-w-4xl mx-auto -mt-16 sm:-mt-20 relative z-30">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/90 text-center">
              
              {/* Route Context Banner */}
              <div className="inline-flex items-center gap-2 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                <Plane className="w-3.5 h-3.5 text-[#2676D9]" />
                <span>Assistance Desk Dedicated For: <strong className="text-[#2676D9]">{routeContext}</strong></span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#102B4E] mb-2">
                Skip The Hold Times &bull; Connect Directly to a Specialist
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto mb-6">
                Call our US domestic reservation hotline to check unpublished airline fares, compare nonstop flights, and lock in tickets immediately.
              </p>

              {/* Main Prominent Call Button */}
              <div className="max-w-xl mx-auto">
                <LpCallButton
                  variant="primary"
                  phoneNumber={callPhone}
                  displayNumber={formattedPhone}
                  label="CALL NOW – SPEAK TO OUR TEAM"
                  sublabel="Toll-free direct agent hotline &bull; Average wait under 30s &bull; No automated hold loops"
                  destination={routeContext}
                  id="lp-hero-main-call"
                />
              </div>

              {/* Popular Domestic Routes Shortcuts */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-[#64748B] font-bold mr-1">Popular Assistance Routes:</span>
                {[
                  { from: "JFK", to: "MIA" },
                  { from: "LAX", to: "JFK" },
                  { from: "ORD", to: "LAS" },
                  { from: "SFO", to: "HNL" },
                  { from: "DFW", to: "MCO" },
                ].map((route) => (
                  <a
                    key={`${route.from}-${route.to}`}
                    href={`tel:${callPhone}`}
                    className="inline-flex items-center gap-1 bg-[#F5F8FC] hover:bg-blue-50 border border-slate-200 hover:border-[#2676D9] px-2.5 py-1 rounded-lg font-bold text-[#102B4E] transition-all google-phone-number text-[11px]"
                  >
                    <span>{route.from}</span>
                    <ArrowRight className="w-3 h-3 text-[#2676D9]" />
                    <span>{route.to}</span>
                  </a>
                ))}
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
        <section id="why-call" className="py-16 sm:py-20 bg-[#F5F8FC] border-b border-slate-200/80">
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
        <section id="destinations" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
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
        <section id="faq" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
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
