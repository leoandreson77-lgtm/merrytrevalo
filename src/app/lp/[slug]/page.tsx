import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { LandingPage } from "@/models/LandingPage";
import { Form } from "@/models/Form";
import { TFN } from "@/models/TFN";
import { getGlobalCallNumber } from "@/lib/settings";

export const dynamic = "force-dynamic";
import {
  Plane,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Star,
  Clock,
  Globe,
  ArrowRight,
  Headphones,
} from "lucide-react";
import ClientFormRenderer from "@/components/client-form-renderer";
import { BoardingPassCard } from "@/components/boarding-pass-card";
import { LanguageSelector } from "@/components/language-selector";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";

interface PageProps {
  params: { slug: string };
}

const BASE_URL = siteConfig.url;
const SITE_NAME = siteConfig.name;
const BRAND_NAME = siteConfig.brandName;

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
    // Fail silently when database is unavailable, dynamic fallback used below
  }

  const slug = (params.slug || "").toLowerCase();
  let defaultTitle = "Exclusive Flight Deal & Phone Reservation";
  if (slug.includes("miami")) defaultTitle = "Cheap Flights to Miami (MIA)";
  else if (slug.includes("london")) defaultTitle = "Fly to London Heathrow (LHR)";
  else if (slug.includes("new-york") || slug.includes("nyc")) defaultTitle = "New York Nonstop Deals (NYC)";
  else if (slug.includes("los-angeles") || slug.includes("lax")) defaultTitle = "Los Angeles Flight Getaways (LAX)";
  else if (slug.includes("paris")) defaultTitle = "Fly to Paris (CDG)";
  else if (slug.includes("dubai")) defaultTitle = "Dubai Flight Deals (DXB)";

  const title = page?.seoTitle || page?.title || defaultTitle;
  const description =
    page?.seoDescription ||
    page?.description ||
    `Book ${title} at the lowest price. Call +1 877 371 7356 for exclusive deals and instant booking.`;

  const pageUrl = `${BASE_URL}/lp/${page?.slug || params.slug}`;

  return {
    title,
    description,
    keywords: [
      page?.title || defaultTitle,
      "cheap flights",
      "flight deals",
      "book airline tickets",
      "discount airfare",
      "best flight prices",
      SITE_NAME,
    ].join(", "),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: BRAND_NAME,
      title,
      description,
      locale: "en_US",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(page?.title || defaultTitle)}&slug=${params.slug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(page?.title || defaultTitle)}&slug=${params.slug}`],
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
    console.warn("[DynamicLandingPage] DB lookup timed out or unavailable, serving instant dynamic fallback:", err?.message);
  }

  if (!page) {
    // Generate dynamic rich landing page for deal cards
    const slug = params.slug.toLowerCase();
    let title = "Exclusive Flight Deal & Phone Reservation";
    let destCode = "USA";
    let destName = "United States";

    if (slug.includes("miami")) { title = "Cheap Flights to Miami (MIA)"; destCode = "MIA"; destName = "Miami, Florida"; }
    else if (slug.includes("london")) { title = "Fly to London Heathrow (LHR)"; destCode = "LHR"; destName = "London Heathrow, UK"; }
    else if (slug.includes("new-york") || slug.includes("nyc")) { title = "New York Nonstop Deals (NYC)"; destCode = "NYC"; destName = "New York City, USA"; }
    else if (slug.includes("los-angeles") || slug.includes("lax")) { title = "Los Angeles Flight Getaways (LAX)"; destCode = "LAX"; destName = "Los Angeles, California"; }
    else if (slug.includes("paris")) { title = "Fly to Paris (CDG)"; destCode = "CDG"; destName = "Paris, France"; }
    else if (slug.includes("dubai")) { title = "Dubai Flight Deals (DXB)"; destCode = "DXB"; destName = "Dubai, UAE"; }

    page = {
      _id: `fallback-${slug}`,
      title,
      slug: params.slug,
      description: `Book ${title} at the lowest available phone fare. Call +1 877 371 7356 for unpublished rates and instant seat reservations.`,
      callPhone: "+18773717356",
      isPublished: true,
      blocks: [
        {
          type: "boarding_pass_hero",
          content: {
            title: `${title} - Call Desk Reservation`,
            subtitle: "Avoid long online hold times. Connect directly with a live flight desk specialist for unpublished phone-only rates and instant seat selection.",
            departureCode: "NYC",
            departureName: "New York, USA",
            destinationCode: destCode,
            destinationName: destName,
            passengerName: "RESERVED FOR YOU",
            seatNumber: "12A (Window)",
            boardingTime: "IMMEDIATE",
            receiptRoute: `NYC ➔ ${destCode}`,
            receiptClass: "Economy / Business",
            receiptOfferRate: "Save Up To 40%",
            receiptStatus: "Deal Active",
            topAlertText: "SPECIAL FARE ALERT: CALL NOW FOR INSTANT UNPUBLISHED PHONE DISCOUNTS",
          },
        },
        {
          type: "features",
          content: {
            features: [
              { icon: "📞", title: "Zero Hold Times", desc: "Connect directly to a live flight desk agent in under 30 seconds." },
              { icon: "💰", title: "Unpublished Fares", desc: "Access phone-only bulk rates not published on online search engines." },
              { icon: "✈️", title: "500+ Airlines Connected", desc: "Fly major carriers including Delta, American, United, and British Airways." },
              { icon: "🛡️", title: "Flexible Rebooking", desc: "Instant date change, cancellation & refund assistance over the phone." },
            ],
          },
        },
        {
          type: "faq",
          content: {
            faqs: [
              { q: `How do I book flights for ${title}?`, a: "Simply call our 24/7 reservation hotline at +1 (877) 371-7356. Our travel specialists will hold your seat at the lowest rate." },
              { q: "Is calling really cheaper than booking online?", a: "Yes! Airlines provide phone-exclusive contract fares that cannot be published on public search engines." },
              { q: "What is the wait time to talk to an agent?", a: "Our average phone wait time is less than 30 seconds." },
            ],
          },
        },
      ],
    } as any;
  }

  // Load any associated form schema
  const formBlock = Array.isArray(page?.blocks) ? page.blocks.find((b: any) => b?.type === "form") : null;
  let formSchema = null;
  if (formBlock?.content?.formId) {
    try {
      formSchema = await Form.findById(formBlock.content.formId).lean();
    } catch {
      // ignore
    }
  }

  let callPhone = "+1 877 371 7356";
  try {
    callPhone = await getGlobalCallNumber(params.slug);
  } catch {
    callPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || "+1 877 371 7356";
  }
  const callPhoneDisplay = callPhone.replace(/^\+1/, "+1 ").replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
  const waLink = `https://wa.me/${callPhone.replace(/[^0-9]/g, "")}`;

  // ── JSON-LD Structured Data for this landing page ──
  const pageUrl = `${BASE_URL}/lp/${page.slug}`;
  const faqBlock = page.blocks?.find((b: any) => b.type === "faq");
  const faqItems = faqBlock?.content?.items || [
    { question: "How do I get the best flight deals?", answer: "Call us at " + callPhone + " and our agents will search all airlines for the lowest fare in real time." },
    { question: "Is it cheaper to book by phone?", answer: "Yes! Calling our agents gives you access to unpublished fares and last-minute deals not available online." },
    { question: "How quickly can I book a flight?", answer: "Our agents can complete a booking in under 5 minutes over the phone." },
  ];

  const flightOfferSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: page.title,
    description: page.description || `Find the best deals on ${page.title}. Book now at the lowest airfare.`,
    url: pageUrl,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "TravelAgency",
        name: BRAND_NAME,
        telephone: callPhone,
        url: BASE_URL,
      },
    },
  };

  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item: any) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Flight Deals", item: `${BASE_URL}/search` },
      { "@type": "ListItem", position: 3, name: page.title, item: pageUrl },
    ],
  };


  const trustBadges = [
    { icon: ShieldCheck, label: "100% Secure" },
    { icon: CheckCircle2, label: "Free Quotes" },
    { icon: Clock, label: "24/7 Support" },
    { icon: Globe, label: "500+ Airlines" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Schema.org JSON-LD */}
      {(page as any).schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: (page as any).schemaMarkup }}
        />
      )}

      {/* ── Auto JSON-LD: Product + FAQ + Breadcrumb ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(flightOfferSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Announcement Bar ── */}
      <div
        style={{
          background: "linear-gradient(90deg, #1d4ed8 0%, #1e40af 50%, #0369a1 100%)",
        }}
        className="text-white text-center py-2.5 text-[11px] font-bold tracking-wide px-4 uppercase"
      >
        📞 24/7 Airline Connection & Assistance Desk — Talk to an Agent Instantly for Reservations, Changes & Cancellations!&nbsp;
        <a href={`tel:${callPhone}`} className="underline underline-offset-2 font-black">
          {callPhoneDisplay}
        </a>
      </div>

      <nav className="h-16 bg-white/95 backdrop-blur border-b border-slate-100 flex items-center justify-between px-6 md:px-14 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="JetWithFly" className="h-9 sm:h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <a
            href={`tel:${callPhone}`}
            id="nav-call-btn"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold px-4 py-2 rounded-full text-sm transition-all duration-200 shadow-md shadow-green-500/30"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call Now</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </nav>

      {/* ── Dynamic Blocks ── */}
      <div className="flex-1">
        {Array.isArray((page as any)?.blocks) && (page as any).blocks.map((block: any, i: number) => {
          const content = block.content || {};

          /* ────── BOARDING PASS HERO BLOCK ────── */
          if (block.type === "boarding_pass_hero") {
            const slugWord = (page as any).slug || "";
            const isParis = slugWord.includes("paris");
            const isLondon = slugWord.includes("london");
            const isDubai = slugWord.includes("dubai");
            const isHawaii = slugWord.includes("hawaii");
            const isTokyo = slugWord.includes("tokyo");

            let destCode = "PAR";
            let destName = "Paris, France";
            if (isLondon) { destCode = "LON"; destName = "London, UK"; }
            else if (isDubai) { destCode = "DXB"; destName = "Dubai, UAE"; }
            else if (isHawaii) { destCode = "HNL"; destName = "Honolulu, Hawaii"; }
            else if (isTokyo) { destCode = "NRT"; destName = "Tokyo, Japan"; }
            else if ((page as any).title) {
              const titleText = (page as any).title;
              if (titleText.includes("Paris")) { destCode = "PAR"; destName = "Paris, France"; }
              else if (titleText.includes("London")) { destCode = "LON"; destName = "London, UK"; }
              else if (titleText.includes("Rome")) { destCode = "FCO"; destName = "Rome, Italy"; }
              else if (titleText.includes("New York")) { destCode = "NYC"; destName = "New York, USA"; }
              else if (titleText.includes("Miami")) { destCode = "MIA"; destName = "Miami, USA"; }
              else if (titleText.includes("Delhi") || titleText.includes("India")) { destCode = "DEL"; destName = "Delhi, India"; }
            }

            return (
              <section
                key={i}
                className="relative py-16 md:py-24 overflow-hidden px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[90vh]"
                style={{
                  background: "radial-gradient(circle at center, #0f172a 0%, #090d16 70%, #020408 100%)",
                }}
              >
                {/* Visual runway lights or atmospheric background elements */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                  }}
                />
                <div className="absolute left-1/2 bottom-0 w-[2px] h-[30%] bg-gradient-to-t from-blue-500/30 to-transparent -translate-x-1/2 blur-[2px]" />
                <div className="absolute left-1/2 top-0 w-[2px] h-[20%] bg-gradient-to-b from-purple-500/20 to-transparent -translate-x-1/2 blur-[2px]" />

                <div className="relative w-full max-w-4xl z-10 space-y-8 flex flex-col items-center">
                  
                  {/* Top Alert Bar */}
                  <div className="w-full max-w-3xl bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center backdrop-blur-sm animate-pulse flex items-center justify-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <p className="text-amber-400 text-xs sm:text-sm font-black tracking-wider uppercase">
                      {content.topAlertText || "AIRLINE SUPPORT HOTLINE: Call Connection Desk for Direct Reservations, Cancellations & Ticket Changes"}
                    </p>
                  </div>

                  {/* Main Header inside block */}
                  <div className="text-center space-y-3">
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                      {content.title || "Direct Airline Connection & Reservation Desk"}
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                      {content.subtitle || "Avoid long hold times. Speak directly to a ticketing specialist for instant flight bookings, modifications, or refund assistance across 500+ airlines."}
                    </p>
                  </div>

                  {/* High Fidelity Boarding Pass Ticket */}
                  <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                    {/* Left & Right Ticket Edge Holes */}
                    <div className="absolute top-[75%] md:top-1/2 -left-4 w-8 h-8 bg-[#020408] rounded-full border border-slate-800 z-20 -translate-y-1/2" />
                    <div className="absolute top-[75%] md:top-1/2 -right-4 w-8 h-8 bg-[#020408] rounded-full border border-slate-800 z-20 -translate-y-1/2" />

                    {/* Main Ticket Area (Left) */}
                    <div className="flex-1 p-6 sm:p-8 space-y-6">
                      {/* Ticket header */}
                      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                            <Plane className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="text-sm font-black text-white tracking-widest">BOARDING PASS</span>
                        </div>
                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                          {content.badgeText ? String(content.badgeText).replace(/official/gi, "24/7").replace(/OFFICIAL/g, "24/7") : "24/7 AIRLINE CONNECTION"}
                        </span>
                      </div>

                      {/* Path Details */}
                      <div className="flex justify-between items-center py-4">
                        <div className="text-left space-y-1">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Departure</p>
                          <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">{content.departureCode || "NYC"}</p>
                          <p className="text-[10px] sm:text-xs font-bold text-slate-400">{content.departureName || "New York City, USA"}</p>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5 animate-pulse">{content.flightDirectText || "AV-2026 DIRECT"}</p>
                          <div className="w-full border-t-2 border-dashed border-slate-800 relative flex items-center justify-center h-4">
                            <Plane className="w-5 h-5 text-blue-400 absolute left-1/2 -translate-x-1/2 rotate-90 bg-slate-900 px-0.5" />
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Destination</p>
                          <p className="text-4xl sm:text-5xl font-black text-blue-400 tracking-tight">{content.destinationCode || destCode}</p>
                          <p className="text-[10px] sm:text-xs font-bold text-slate-400">{content.destinationName || destName}</p>
                        </div>
                      </div>

                      {/* Ticket Passenger Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-800 text-sm">
                        <div className="space-y-1 col-span-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Passenger Name</p>
                          <p className="font-extrabold text-white text-base">{content.passengerName || "RESERVED FOR YOU"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Seat Number</p>
                          <p className="font-extrabold text-blue-400 text-base">{content.seatNumber || "12A (Window)"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Boarding Time</p>
                          <p className="font-extrabold text-green-400 text-base">{content.boardingTime || "IMMEDIATE"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dotted Tear Line (Hidden on mobile column stack, visible on MD+) */}
                    <div className="hidden md:block w-[1px] border-r-2 border-dashed border-slate-800 relative">
                      <div className="absolute -top-4 -left-3 w-6 h-6 bg-[#020408] rounded-full border border-slate-800" />
                      <div className="absolute -bottom-4 -left-3 w-6 h-6 bg-[#020408] rounded-full border border-slate-800" />
                    </div>

                    {/* Dotted Tear Line for Mobile */}
                    <div className="md:hidden border-t-2 border-dashed border-slate-800 relative w-full h-[2px]">
                      <div className="absolute -left-4 -top-3 w-6 h-6 bg-[#020408] rounded-full border border-slate-800" />
                      <div className="absolute -right-4 -top-3 w-6 h-6 bg-[#020408] rounded-full border border-slate-800" />
                    </div>

                    {/* Ticket Stub Area (Right / Bottom) */}
                    <div className="w-full md:w-[280px] p-6 sm:p-8 bg-slate-900/40 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">FLIGHT RECEIPT</span>
                          <span className="text-[10px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase">{content.stubTitle || "AV-STUB"}</span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-xs">Route</span>
                            <span className="font-bold text-white">{content.receiptRoute || `NYC ➔ ${content.destinationCode || destCode}`}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-xs">Class</span>
                            <span className="font-bold text-white">{content.receiptClass || "First Class"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-xs">Offer Rate</span>
                            <span className="font-black text-green-400">{content.receiptOfferRate || "Save Up To 40%"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 text-xs">Status</span>
                            <span className="font-bold text-amber-400">{content.receiptStatus || "Hold Active"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Barcode styling representation using pure CSS lines */}
                      <div className="pt-6 md:pt-0">
                        <div className="w-full bg-white rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-md">
                          <div className="w-full h-10 flex items-center justify-between overflow-hidden opacity-90 px-1">
                            {Array.from({ length: 28 }).map((_, b) => {
                              const widths = [1, 2, 3, 4];
                              const width = widths[b % widths.length];
                              const isBlack = (b * 7) % 3 !== 0;
                              return (
                                <div
                                  key={b}
                                  className="h-full bg-slate-950"
                                  style={{
                                    width: `${width}px`,
                                    opacity: isBlack ? 1 : 0
                                  }}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[9px] font-mono tracking-[0.2em] font-extrabold text-slate-800 uppercase">
                            {content.barcodeText || "*AV-HOLD-CLAIM*"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call-to-action button */}
                  <div className="w-full max-w-md text-center space-y-4">
                    <a
                      href={`tel:${callPhone}`}
                      id="boarding-pass-call-cta"
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 active:scale-95 text-white font-black px-8 py-5 rounded-3xl text-xl shadow-xl shadow-green-500/20 transform hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wide"
                    >
                      <Phone className="w-6 h-6 fill-white" />
                      Claim Boarding Pass
                    </a>
                    
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-blue-500" /> Secure Verification
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-green-500" /> Average Wait &lt; 30s
                      </span>
                    </div>
                  </div>

                </div>
              </section>
            );
          }

          /* ────── HERO BLOCK ────── */
          if (block.type === "hero") {
            return (
              <section
                key={i}
                className="relative py-16 md:py-28 overflow-hidden px-6 lg:px-14 flex items-center justify-center text-left"
                style={{
                  background: "radial-gradient(circle at 10% 20%, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
                }}
              >
                {/* Glowing Background Blobs */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
                
                {/* Fine Grid Overlay */}
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />

                <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
                  {/* Left Column: Copy & CTAs */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Glowing pill badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/5">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                      {content.badgeText ? String(content.badgeText).replace(/official/gi, "24/7").replace(/OFFICIAL/g, "24/7") : "24/7 Airline Reservation Support Desk"}
                    </div>
 
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] !font-sans">
                      {content.title || "Direct Airline Booking & Connection Desk"}
                    </h1>
 
                    <p className="text-base md:text-lg text-slate-300 max-w-xl leading-relaxed">
                      {content.subtitle || "Need immediate assistance with airline reservations, booking new flights, cancellations, or modifications? Connect directly with a live support agent now."}
                    </p>

                    {/* CTA Section */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <a
                        href={`tel:${callPhone}`}
                        id="hero-call-btn"
                        className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 active:scale-95 text-white font-black px-8 py-4 rounded-2xl text-lg shadow-xl shadow-green-500/20 transition-all duration-200"
                      >
                        <Phone className="w-5 h-5 animate-bounce" style={{ animationDuration: "2s" }} />
                        <div className="text-left">
                          <p className="text-[10px] uppercase font-bold text-green-100 tracking-wider">Talk to Agent</p>
                          <p className="font-extrabold text-base">{callPhoneDisplay}</p>
                        </div>
                      </a>

                      <a
                        href={
                          content.ctaLink === "form"
                            ? "#form-section"
                            : content.ctaLink === "phone"
                            ? `tel:${callPhone}`
                            : (content.ctaText || "").toLowerCase().includes("call")
                            ? `tel:${callPhone}`
                            : (content.ctaLink || "#form-section")
                        }
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-white/20 text-white font-extrabold px-8 py-4 rounded-2xl text-base transition-all duration-200"
                      >
                        {content.ctaText || "Request Call"}
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                      </a>
                    </div>

                    {/* Trust and Reviews Rating */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-slate-400">
                        4.9/5 Rating · 14,000+ Booked Flights this month
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Glassmorphism Boarding Pass Mockup */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="relative w-full max-w-[360px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40 overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                      {/* Ticket top punch logic */}
                      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-950 rounded-full border-r border-white/10 -translate-y-1/2" />
                      <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-950 rounded-full border-l border-white/10 -translate-y-1/2" />
                      
                      {/* Glass header */}
                      <div className="flex justify-between items-center pb-4 border-b border-white/10 border-dashed">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                            <Plane className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-xs font-black text-white tracking-widest">BOARDING PASS</span>
                        </div>
                        <span className="text-[10px] font-black text-green-400 uppercase bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">{content.ticketEconomyBadge || "ECONOMY"}</span>
                      </div>

                      {/* Flight Path */}
                      <div className="py-6 flex justify-between items-center relative">
                        <div className="text-left">
                          <p className="text-3xl font-black text-white">{content.ticketOriginCode || "USA"}</p>
                          <p className="text-[10px] font-bold text-slate-400">{content.ticketOriginName || "United States"}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                          <div className="w-full border-t-2 border-dashed border-white/20 relative flex items-center justify-center h-4">
                            <Plane className="w-4 h-4 text-blue-400 absolute left-1/2 -translate-x-1/2 rotate-90 animate-pulse bg-slate-950 px-0.5" />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-blue-400">{content.ticketDestCode || "PAR"}</p>
                          <p className="text-[10px] font-bold text-slate-400">{content.ticketDestName || "Paris, France"}</p>
                        </div>
                      </div>

                      {/* Ticket Details */}
                      <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/10 text-sm">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Class Type</p>
                          <p className="font-extrabold text-white">{content.ticketClassType || "First & Business"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Offer Code</p>
                          <p className="font-extrabold text-green-400">{content.ticketOfferCode || "SAVE40-AV"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Available Seats</p>
                          <p className="font-extrabold text-white">{content.ticketAvailableSeats || "9 Left Today"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Average Saving</p>
                          <p className="font-extrabold text-green-400">{content.ticketAvgSaving || "$200 - $450"}</p>
                        </div>
                      </div>

                      {/* Live Call Callout */}
                      <a
                        href={`tel:${callPhone}`}
                        className="block mt-4 text-center bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 p-3 rounded-2xl transition-all duration-200"
                      >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Call Desk to Claim Offer</p>
                        <p className="text-lg font-black text-white mt-0.5">{callPhoneDisplay}</p>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          /* ────── PARTNERS BLOCK ────── */
          if (block.type === "partners") {
            return (
              <section key={i} className="py-14 bg-slate-50 border-y border-slate-100 text-center px-6">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-8">
                  Trusted by Millions — Booking with 500+ Airline Partners
                </p>
                <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-14">
                  {["AA", "BA", "EK", "JL", "LH", "QR", "SQ", "UA"].map((code) => (
                    <img
                      key={code}
                      src={`https://pics.avs.io/90/90/${code}.png`}
                      alt={code}
                      className="h-9 object-contain filter grayscale hover:grayscale-0 hover:scale-110 transition-all duration-300"
                    />
                  ))}
                </div>
              </section>
            );
          }

          /* ────── CALL TO ACTION STRIP ────── */
          if (block.type === "cta_strip" || block.type === "partners") {
            return null; // handled above
          }

          /* ────── TESTIMONIALS BLOCK ────── */
          if (block.type === "testimonials") {
            const list = content.testimonials || [
              {
                quote: `${BRAND_NAME} saved us over $400 on our family flights to Europe. Exceptional service and fares!`,
                author: "Sarah M.",
                location: "Chicago",
                rating: 5,
              },
              {
                quote: "The flight search is super fast and the support team was incredibly helpful. Will book again!",
                author: "James L.",
                location: "Los Angeles",
                rating: 5,
              },
              {
                quote: "I called the number and got my ticket sorted in under 10 minutes. Amazing experience.",
                author: "Priya K.",
                location: "New York",
                rating: 5,
              },
            ];
            return (
              <section key={i} className="py-24 bg-white text-center px-6">
                <div className="max-w-5xl mx-auto space-y-12">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-2">
                      Real Reviews
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black">What Travelers Say</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {list.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-7 rounded-3xl border border-slate-100 shadow-sm text-left relative hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex gap-0.5 mb-4">
                          {Array.from({ length: item.rating || 5 }).map((_, s) => (
                            <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-slate-600 italic leading-relaxed mb-5">"{item.quote}"</p>
                        <p className="font-black text-slate-900 text-sm">
                          — {item.author}
                          {item.location && (
                            <span className="font-normal text-slate-500">, {item.location}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ────── FEATURES / WHY US BLOCK ────── */
          if (block.type === "features") {
            const feats = content.features || [
              { icon: "📞", title: "Zero Hold Times", desc: "Skip hold queues and get directly connected to a live support desk agent." },
              { icon: "✈️", title: "500+ Airlines Connected", desc: "Instant support and reservation assistance across all global and local carriers." },
              { icon: "🛠️", title: "Cancellations & Changes", desc: "Quickly modify, rebook, or process cancellations with professional desk support." },
              { icon: "💰", title: "Contract Fares Unlocked", desc: "Special phone-only bulk discounts and contract rates that cannot be published online." },
            ];
            return (
              <section key={i} className="py-24 bg-slate-50 px-6">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-14">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-2">Why {BRAND_NAME} Support</p>
                    <h2 className="text-3xl md:text-4xl font-black">Direct Ticketing & Booking Assistance</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {feats.map((f: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center">
                        <div className="text-4xl mb-4">{f.icon}</div>
                        <h3 className="font-black text-lg mb-2">{f.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ────── FAQ BLOCK ────── */
          if (block.type === "faq") {
            const faqs = content.faqs || [
              {
                q: "How do I request a custom flight quote?",
                a: "Simply call us or fill out our quick enquiry form with your origin, destination, and dates. Our specialists will find the best options for you within minutes.",
              },
              {
                q: "Are your quotes free?",
                a: "Yes! All custom enquiries and price estimates are completely free with zero booking obligations.",
              },
              {
                q: "Can you handle group bookings?",
                a: "Absolutely. Call us directly and our group travel specialists will handle everything — from seat blocks to group discounts.",
              },
            ];
            return (
              <section key={i} className="py-24 bg-white px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                  <div className="text-center">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-2">FAQ</p>
                    <h2 className="text-3xl md:text-4xl font-black">Frequently Asked Questions</h2>
                  </div>
                  <div className="space-y-4">
                    {faqs.map((faq: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
                      >
                        <h4 className="font-black text-slate-900 mb-2 flex items-start gap-2">
                          <span className="text-blue-600 shrink-0">Q</span>
                          {faq.q}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed pl-5">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ────── FORM BLOCK ────── */
          if (block.type === "form" && formSchema) {
            return (
              <section
                id="form-section"
                key={i}
                className="py-24 px-6"
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e1b4b 100%)",
                }}
              >
                <div className="max-w-lg mx-auto">
                  <div className="text-center mb-8">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-blue-300 mb-2">
                      Free Quote
                    </p>
                    <h2 className="text-3xl font-black text-white">{(formSchema as any).title}</h2>
                    {(formSchema as any).description && (
                      <p className="text-blue-200 text-sm mt-2">{(formSchema as any).description}</p>
                    )}
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <ClientFormRenderer form={formSchema as any} />
                  </div>
                  {/* OR call */}
                  <div className="text-center mt-6">
                    <p className="text-blue-200 text-sm mb-3">Or speak to an agent right now</p>
                    <a
                      href={`tel:${callPhone}`}
                      id="form-call-btn"
                      className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 active:scale-95 text-white font-black px-8 py-4 rounded-full text-lg shadow-xl shadow-green-500/30 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      {callPhoneDisplay}
                    </a>
                  </div>
                </div>
              </section>
            );
          }

          /* ────── ROUTES TABLE BLOCK ────── */
          if (block.type === "routes_table") {
            const tableTitle = content.title || "Available Nonstop Flight Routes & Airline Comparison";
            const tableRows = content.rows || [];

            return (
              <section key={i} className="py-20 px-6 bg-[#f8fafc]">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full inline-block mb-3">
                      ✈️ Direct Fares Comparison
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tableTitle}</h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
                      Compare nonstop flight availability across Delta, United, American Airlines, and other contract carriers.
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                            <th className="py-4 px-6">Route</th>
                            <th className="py-4 px-6 text-center">Delta</th>
                            <th className="py-4 px-6 text-center">United</th>
                            <th className="py-4 px-6 text-center">American</th>
                            <th className="py-4 px-6">Other Nonstop Carriers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {tableRows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-4 px-6 font-extrabold text-slate-800 flex items-center gap-2">
                                <Plane className="w-4 h-4 text-blue-500 shrink-0" />
                                {row.route}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {row.delta ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-black">✓</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {row.united ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-black">✓</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {row.american ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-black">✓</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-slate-500 font-semibold">
                                {row.others || "None"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Booking Help Call Out */}
                  <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-blue-500/10">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="text-lg font-black">Ready to Book Your Direct Flight?</h4>
                      <p className="text-blue-100 text-xs font-medium">Get unpublished phone-only discounts and flexible booking help 24/7.</p>
                    </div>
                    <a
                      href={`tel:${callPhone}`}
                      className="bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider shrink-0"
                    >
                      <Phone className="w-4 h-4 fill-blue-700 text-blue-700" />
                      Book Over Phone
                    </a>
                  </div>
                </div>
              </section>
            );
          }

          /* ────── BOARDING PASS ROUTES BLOCK ────── */
          if (block.type === "boarding_pass_routes") {
            const routes = content.routes || [
              { title: "Cheap Flights to Paris", slug: "cheap-flights-to-paris", originCode: "NYC", originName: "New York, USA", destCode: "PAR", destName: "Paris, France", seat: "12A", gate: "B3", priceOff: "Save 40%" },
              { title: "Cheap Flights to London", slug: "cheap-flights-to-london", originCode: "NYC", originName: "New York, USA", destCode: "LON", destName: "London, UK", seat: "15F", gate: "A7", priceOff: "Save 35%" },
              { title: "Cheap Flights to Dubai", slug: "cheap-flights-to-dubai", originCode: "NYC", originName: "New York, USA", destCode: "DXB", destName: "Dubai, UAE", seat: "8K", gate: "C2", priceOff: "Save 45%" },
              { title: "Cheap Flights to Tokyo", slug: "cheap-flights-to-tokyo", originCode: "NYC", originName: "New York, USA", destCode: "NRT", destName: "Tokyo, Japan", seat: "22A", gate: "D5", priceOff: "Save 30%" },
            ];
            return (
              <section key={i} className="py-20 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-2">Popular Routes</p>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900">{content.title || "Active Boarding Passes & Live Fares"}</h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">{content.subtitle || "Special contract fares on active flight routes. Click a ticket to lock in your discount."}</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {routes.map((route: any, idx: number) => (
                      <BoardingPassCard
                        key={idx}
                        title={route.title}
                        slug={route.slug || ""}
                        originCode={route.originCode || "NYC"}
                        originName={route.originName || "New York, USA"}
                        destCode={route.destCode || "PAR"}
                        destName={route.destName || "Paris, France"}
                        seat={route.seat || "12A"}
                        gate={route.gate || "B3"}
                        priceOff={route.priceOff || "Save 40%"}
                        callPhone={callPhone}
                        isStatic={!route.slug}
                        holeBg="#f8fafc"
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}

        {/* ────── Always-visible Call CTA Strip ────── */}
        <section
          className="py-16 px-6 text-center"
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #065f46 100%)",
          }}
        >
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Headphones className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Talk to a Flight Expert Now
            </h2>
            <p className="text-green-100 text-lg">
              Skip the form — call us directly and get your ticket sorted in minutes.
            </p>
            <a
              href={`tel:${callPhone}`}
              id="cta-strip-call-btn"
              className="inline-flex items-center gap-3 bg-white hover:bg-green-50 active:scale-95 text-green-700 font-black px-10 py-5 rounded-full text-xl shadow-2xl transition-all duration-200"
            >
              <Phone className="w-6 h-6" />
              {callPhoneDisplay}
            </a>
            <p className="text-green-200 text-xs font-semibold">
              Available 24/7 · Free to call · No hold queues
            </p>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800 text-center text-slate-500 text-xs px-6 space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg inline-flex items-center">
            <img src="/logo.png" alt="JetWithFly" className="h-7 w-auto object-contain" />
          </div>
        </div>
        <p className="max-w-3xl mx-auto text-slate-500 leading-relaxed text-[11px]">
          Disclaimer: {BRAND_NAME} is an independent travel portal and is not directly affiliated with Delta Air Lines, American Airlines, or any other airline. All brand names, trademarks, logos, and service marks are the property of their respective owners.
        </p>
        <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
        <div className="flex justify-center gap-6 pt-2">
          <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
          <a href={`tel:${callPhone}`} className="hover:text-green-400 transition-colors flex items-center gap-1">
            <Phone className="w-3 h-3" /> {callPhoneDisplay}
          </a>
        </div>
      </footer>

      {/* ── Fixed Mobile CTA ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-3 flex sm:hidden justify-center items-center z-50 shadow-2xl">
        <a
          href={`tel:${callPhone}`}
          id="mobile-call-btn"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95 text-white rounded-2xl font-black text-base shadow-lg shadow-green-500/30 transition-all"
        >
          <Phone className="w-5 h-5 animate-bounce" />
          Call Now: {callPhoneDisplay}
        </a>
      </div>
      {/* Mobile bottom spacer so footer content isn't hidden */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
