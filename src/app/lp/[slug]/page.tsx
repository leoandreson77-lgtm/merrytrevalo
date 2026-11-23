import { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { LandingPage } from "@/models/LandingPage";
import { getGlobalCallNumber } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";
import { LpGeminiExperience } from "@/components/lp-gemini-experience";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

const BASE_URL = siteConfig.url;
const BRAND_NAME = "MerryTravelo";

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
  let defaultTitle = "US Flight Changes, Cancellations & Rescheduling Desk";
  if (slug.includes("delta") || slug.includes("united") || slug.includes("american") || slug.includes("airline") || slug.includes("carrier")) {
    defaultTitle = "Multi-Airline Flight Changes, Cancellations & Help Desk";
  } else if (slug.includes("miami")) {
    defaultTitle = "Flight Assistance & Reservations to Miami (MIA)";
  } else if (slug.includes("london")) {
    defaultTitle = "Flight Assistance & Reservations to London (LHR)";
  } else if (slug.includes("new-york") || slug.includes("nyc")) {
    defaultTitle = "Flight Assistance & Reservations to New York (NYC)";
  } else if (slug.includes("los-angeles") || slug.includes("lax")) {
    defaultTitle = "Flight Assistance & Reservations to Los Angeles (LAX)";
  } else if (slug.includes("paris")) {
    defaultTitle = "Flight Assistance & Reservations to Paris (CDG)";
  }

  const title = page?.seoTitle || page?.title || defaultTitle;
  const description =
    page?.seoDescription ||
    page?.description ||
    `Speak directly with our US flight assistance team for ${title}. Call +1 877 251 8760 for immediate flight changes, cancellations, travel credits, and rebooking across major carriers.`;

  const pageUrl = `${BASE_URL}/lp/${page?.slug || params.slug}`;

  return {
    title: `${title} | MerryTravelo Live Flight Desk`,
    description,
    keywords: [
      title,
      "flight change phone number",
      "cancel flight ticket",
      "reschedule flight date",
      "airline travel assistance",
      "delta flight change",
      "united airlines cancellation",
      "american airlines credit",
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
  if (slug.includes("london")) { routeContext = "Flights to London (LHR)"; }
  else if (slug.includes("miami")) { routeContext = "Flights to Miami (MIA)"; }
  else if (slug.includes("new-york") || slug.includes("nyc")) { routeContext = "Flights to New York (NYC)"; }
  else if (slug.includes("los-angeles") || slug.includes("lax")) { routeContext = "Flights to Los Angeles (LAX)"; }
  else if (slug.includes("paris")) { routeContext = "Flights to Paris (CDG)"; }
  else if (slug.includes("delta")) { routeContext = "Delta Air Lines Assistance Desk"; }
  else if (slug.includes("united")) { routeContext = "United Airlines Assistance Desk"; }
  else if (slug.includes("american")) { routeContext = "American Airlines Assistance Desk"; }

  // Determine actual configured US telephone number for page content
  let callPhone = page?.callPhone || "+18772518760";
  if (!page?.callPhone) {
    try {
      const fetched = await getGlobalCallNumber(params.slug);
      if (fetched) callPhone = fetched;
    } catch {
      callPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || "+18772518760";
    }
  }

  // Format phone display: +18772518760 -> +1 (877) 251-8760
  const digits = callPhone.replace(/[^0-9]/g, "");
  const formattedPhone = digits.length === 11 && digits.startsWith("1")
    ? `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    : callPhone;

  // Header 24/7 Phone Desk is strictly +1 855 510 6415 as requested in prompt 9
  const headerPhone = "+1 855 510 6415";

  // Determine initial template mode
  let mode: "flight-changes-desk" | "airline-carrier-desk" = "flight-changes-desk";
  if (
    page?.templateId === "airline-carrier-desk" ||
    slug.includes("delta") ||
    slug.includes("united") ||
    slug.includes("american") ||
    slug.includes("airline") ||
    slug.includes("carrier")
  ) {
    mode = "airline-carrier-desk";
  }

  // Extract block customizations if present
  let customTitle: string | undefined = undefined;
  let customSubtitle: string | undefined = undefined;
  let customBadgeText: string | undefined = undefined;
  let customFaqs: Array<{ q: string; a: string }> | undefined = undefined;
  let customFeatures: Array<{ icon?: string; title: string; desc: string }> | undefined = undefined;
  let customTestimonials: Array<{ quote: string; author: string; location?: string; rating?: number }> | undefined = undefined;
  let customRoutes: Array<any> | undefined = undefined;

  if (page?.blocks && Array.isArray(page.blocks)) {
    for (const b of page.blocks) {
      if (b.type === "hero" || b.type === "boarding_pass_hero") {
        if (b.content?.title) customTitle = b.content.title;
        if (b.content?.subtitle) customSubtitle = b.content.subtitle;
        if (b.content?.badgeText) customBadgeText = b.content.badgeText;
      } else if (b.type === "faq" && Array.isArray(b.content?.faqs)) {
        customFaqs = b.content.faqs;
      } else if (b.type === "features" && Array.isArray(b.content?.features)) {
        customFeatures = b.content.features;
      } else if (b.type === "testimonials" && Array.isArray(b.content?.testimonials)) {
        customTestimonials = b.content.testimonials;
      } else if (b.type === "routes" && Array.isArray(b.content?.routes)) {
        customRoutes = b.content.routes;
      }
    }
  }

  const category = page?.category || (slug.includes("deal") || slug.includes("sale") ? "sale" : "changesncancellation");

  // Structured Data Schema for Phone Assistance
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: BRAND_NAME,
    url: BASE_URL,
    telephone: callPhone,
    priceRange: "$$",
    description: "USA Domestic & International Flight Changes, Cancellations and Travel Assistance Desk.",
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
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <LpGeminiExperience
        category={category}
        mode={mode}
        callPhone={callPhone}
        formattedPhone={formattedPhone}
        headerPhone={headerPhone}
        routeContext={routeContext}
        title={customTitle || page?.title}
        subtitle={customSubtitle || page?.description}
        badgeText={customBadgeText}
        customFaqs={customFaqs}
        customFeatures={customFeatures}
        customTestimonials={customTestimonials}
        customRoutes={customRoutes}
      />
    </>
  );
}
