import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { connectToDatabase, getDb } from "@/lib/db";
import { CMSConfig } from "@/models/CMSConfig";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://Flightitude.com.com";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Flightitude.com — Cheap Flights, Book Airline Tickets Online",
    template: "%s | Flightitude.com",
  },
  description:
    "Compare and book cheap flights from 500+ airlines. Find lowest airfare deals, last-minute flights, and exclusive travel offers. Call +1 888 256 6747 for best rates.",

  keywords: [
    "cheap flights",
    "book airline tickets",
    "flight deals",
    "last minute flights",
    "cheap airfare",
    "international flights",
    "domestic flights",
    "flight search",
    "Flightitude.com",
    "discount flights",
    "lowest airfare",
    "flight booking",
    "airline tickets",
    "book flight tickets",
    "flight reservations",
    "airline reservations",
    "airline booking",
    "same day flight booking",
    "refundable flight tickets",
    "business class flights",
    "first class flights",
    "round trip flights",
    "one way flights",
    "multi city flights",
    "flight booking assistance",
    "airline booking help",
    "travel booking support",
    "flight reservation support",
    "change flight booking",
    "cancel flight booking",
    "flight rebooking",
    "flight itinerary assistance"
  ],

  authors: [{ name: "Flightitude.com", url: BASE_URL }],
  creator: "Flightitude.com",
  publisher: "Flightitude.com",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Flightitude.com",
    url: BASE_URL,
    title: "Flightitude.com — Cheap Flights, Book Airline Tickets Online",
    description:
      "Compare cheap flights from 500+ airlines. Find lowest airfare deals and exclusive travel offers.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Flightitude.com — Book Cheap Flights",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Flightitude.com — Cheap Flights & Airline Tickets",
    description: "Compare cheap flights from 500+ airlines. Best airfare deals online.",
    images: ["/og-image.jpg"],
    creator: "@Flightitude.com",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
    yandex: process.env.YANDEX_VERIFICATION || "",
  },

  // Alternate languages
  alternates: {
    canonical: BASE_URL,
  },

  // App icons
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.json",

  category: "travel",
};

// ── JSON-LD Structured Data ──────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Flightitude.com",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    "Flightitude.com helps travelers find and book the cheapest airline tickets from 500+ airlines worldwide.",
  telephone: "+18882566747",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.facebook.com/Flightitude.com",
    "https://twitter.com/Flightitude.com",
    "https://www.instagram.com/Flightitude.com",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+18882566747",
    contactType: "customer support",
    availableLanguage: "English",
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Flightitude.com",
  url: BASE_URL,
  description: "Compare cheap flights from 500+ airlines",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ─────────────────────────────────────────────────────
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let gtmId = "GTM-M35FZFH3";
  let googleAdsId = "AW-18305273332";
  let googleAdsSendTo = "AW-18305273332/2hW1COCSudEcEPSb0ZhE";
  let googleTagId = "AW-18305273332";

  try {
    await connectToDatabase();
    const db = await getDb();
    const cmsDoc = await db.collection("cms_settings").findOne({ _type: "global" });
    
    if (cmsDoc) {
      if (cmsDoc.googleTagManagerId) gtmId = cmsDoc.googleTagManagerId;
      if (cmsDoc.googleAdsId) googleAdsId = cmsDoc.googleAdsId;
      if (cmsDoc.googleAdsSendTo) googleAdsSendTo = cmsDoc.googleAdsSendTo;
      if (cmsDoc.googleTagId) googleTagId = cmsDoc.googleTagId;
    }
  } catch (error) {
    console.error("Error loading settings in RootLayout:", error);
  }

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* ── Global Ads SendTo variable for clients ── */}
        {googleAdsSendTo && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.googleAdsSendTo = "${googleAdsSendTo}";`
            }}
          />
        )}

        {/* ── Google Tag Manager ── */}
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
            }}
          />
        )}

        {/* ── Google Tag (gtag.js) AW-18305273332 ── */}
        {googleAdsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleAdsId}');
                `
              }}
            />
          </>
        )}

        {/* ── Google Ads Event Snippet ── */}
        {googleAdsSendTo && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                function gtag_report_conversion(url) {
                  var callback = function () {
                    if (typeof(url) != 'undefined') {
                      window.location = url;
                    }
                  };
                  if (typeof gtag === 'function') {
                    gtag('event', 'conversion', {
                      'send_to': '${googleAdsSendTo}',
                      'event_callback': callback
                    });
                  } else {
                    callback();
                  }
                  return false;
                }
                window.gtag_report_conversion = gtag_report_conversion;
              `
            }}
          />
        )}

        {/* ── Click conversion tracking + CRM call click logging ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                document.addEventListener('click', function(e) {
                  var target = e.target;
                  while (target && target !== document) {
                    if (target.tagName === 'A' && target.href && target.href.indexOf('tel:') === 0) {
                      // 1. Google Ads conversion event
                      ${googleAdsId && googleAdsSendTo ? `
                      if (typeof gtag === 'function') {
                        gtag('event', 'conversion', {
                          'send_to': '${googleAdsSendTo}'
                        });
                        console.log('Conversion event sent for tel click:', target.href);
                      }
                      ` : ''}

                      // 2. CRM call click tracking (POST to /api/calls/click)
                      try {
                        var urlParams = new URLSearchParams(window.location.search);
                        fetch('/api/calls/click', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            numberDialed: target.href.replace('tel:', ''),
                            landingPage: window.location.pathname,
                            referrer: document.referrer || '',
                            utmSource: urlParams.get('utm_source') || '',
                            utmMedium: urlParams.get('utm_medium') || '',
                            utmCampaign: urlParams.get('utm_campaign') || '',
                            device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                            browser: navigator.userAgent.substring(0, 200),
                            sessionId: (window.__avSessionId = window.__avSessionId || ('av_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)))
                          })
                        }).catch(function(err) { console.error('Call click track error:', err); });
                      } catch(ex) { /* silent */ }

                      break;
                    }
                    target = target.parentNode;
                  }
                });
              });
            `
          }}
        />

        {/* ── Dynamic Google Tag (gtag.js) ── */}
        {googleTagId && googleTagId !== googleAdsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleTagId}');
                `
              }}
            />
          </>
        )}

        {/* ── Preconnect critical origins (Vercel build trigger) ── */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://v.ftcdn.net" />
        <link rel="preconnect" href="https://v.ftcdn.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* ── Viewport & theme ── */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="dark light" />

        {/* ── Geo targeting (US flights niche) ── */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="ICBM" content="37.09024, -95.712891" />

        {/* ── JSON-LD Structured Data ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>

      <body className={inter.className}>
        {/* ── GTM noscript ── */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
