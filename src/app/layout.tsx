import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/site-config";

const BASE_URL = siteConfig.url;
const SITE_NAME = siteConfig.name;
const BRAND_NAME = siteConfig.brandName;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: `${SITE_NAME} — Cheap Flights, Book Airline Tickets Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    siteConfig.description,

  keywords: siteConfig.keywords,

  authors: [{ name: SITE_NAME, url: BASE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    url: BASE_URL,
    title: `${SITE_NAME} — Cheap Flights, Book Airline Tickets Online`,
    description:
      "Compare cheap flights from 500+ airlines. Find lowest airfare deals and exclusive travel offers.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Book Cheap Flights`,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Cheap Flights & Airline Tickets`,
    description: "Compare cheap flights from 500+ airlines. Best airfare deals online.",
    images: ["/og-image.jpg"],
    creator: `@${SITE_NAME}`,
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
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/favicon.png" }],
  },

  manifest: "/manifest.json",

  category: "travel",
};

// ── JSON-LD Structured Data ──────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: `${SITE_NAME} helps travelers find and book the cheapest airline tickets from 500+ airlines worldwide.`,
  telephone: siteConfig.phone,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
  },
  sameAs: [
    siteConfig.social.facebook,
    siteConfig.social.twitter,
    siteConfig.social.instagram,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteConfig.phone,
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
  name: SITE_NAME,
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
  const customHeadScript = process.env.CUSTOM_HEAD_SCRIPT || "";

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* ── Google Tag Manager & Google tag (gtag.js) ── */}
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MM6FPFM5" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=GTM-5T6F2H67" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GTM-MM6FPFM5');
              gtag('config', 'GTM-5T6F2H67');
              gtag('config', 'AW-18576835283');

              function gtag_report_conversion(url) {
                var callback = function () {
                  if (typeof(url) != 'undefined') {
                    window.location = url;
                  }
                };
                if (typeof gtag === 'function') {
                  gtag('event', 'conversion', {
                    'send_to': 'AW-18576835283/bF7OCNH-5rwdENOFkJpF',
                    'value': 1.0,
                    'event_callback': callback
                  });
                }
                return false;
              }
              window.gtag_report_conversion = gtag_report_conversion;
            `,
          }}
        />

        {/* ── Custom Header Script from Admin Panel (if set) ── */}
        {customHeadScript && (
          <script dangerouslySetInnerHTML={{ __html: customHeadScript }} />
        )}

        {/* ── CRM call click logging & Google Ads Call Conversion ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                document.addEventListener('click', function(e) {
                  var target = e.target;
                  while (target && target !== document) {
                    if (target.tagName === 'A' && target.href && target.href.indexOf('tel:') === 0) {
                      // Fire Google Ads conversion tracking on call click
                      try {
                        if (typeof window.gtag === 'function') {
                          window.gtag('event', 'conversion', {
                            'send_to': 'AW-18576835283/bF7OCNH-5rwdENOFkJpF',
                            'value': 1.0
                          });
                        }
                      } catch(convErr) {}

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
                        }).catch(function() {});
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

        {/* ── Preconnect critical fonts ── */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://v.ftcdn.net" />
        <link rel="preconnect" href="https://v.ftcdn.net" crossOrigin="anonymous" />

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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MM6FPFM5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
