"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plane,
  Phone,
  ArrowRight,
  Tag,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { CompanyPhone } from "./company-phone";

interface LandingPageCard {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  callPhone?: string;
}

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
  "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
  "linear-gradient(135deg, #ea580c 0%, #e11d48 100%)",
  "linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #581c87 100%)",
  "linear-gradient(135deg, #db2777 0%, #be123c 100%)",
];

const CARD_ICONS = ["✈️", "🌍", "🏖️", "🗺️", "🛫", "💺"];

const FALLBACK_PAGES: LandingPageCard[] = [
  {
    _id: "fb-1",
    title: "Cheap Flights to Miami",
    slug: "flights-to-miami",
    description: "Save up to $150 on roundtrip tickets to Miami Beach with 24/7 phone assistance.",
    callPhone: "+18772518760",
  },
  {
    _id: "fb-2",
    title: "Fly to London Heathrow",
    slug: "flights-to-london",
    description: "Exclusive international deals on nonstop flights to London.",
    callPhone: "+18772518760",
  },
  {
    _id: "fb-3",
    title: "New York Nonstop Deals",
    slug: "flights-to-new-york",
    description: "Book flights to JFK, LGA, & EWR with extra baggage discount.",
    callPhone: "+18772518760",
  },
  {
    _id: "fb-4",
    title: "Los Angeles Getaways",
    slug: "flights-to-los-angeles",
    description: "Direct flights to LAX with instant phone reservations.",
    callPhone: "+18772518760",
  },
];

export function LandingPagesSection() {
  const [pages, setPages] = useState<LandingPageCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/landing-pages")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPages(data);
        } else {
          setPages(FALLBACK_PAGES);
        }
      })
      .catch(() => setPages(FALLBACK_PAGES))
      .finally(() => setLoading(false));
  }, []);

  const displayPages = pages.length > 0 ? pages : FALLBACK_PAGES;

  return (
    <section
      id="special-deals"
      className="py-20 px-4"
      style={{
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eff6ff 50%, #f8fafc 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Exclusive Flight Deals
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
            Handpicked Routes &amp;{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              }}
            >
              Special Offers
            </span>
          </h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
            Browse our curated flight deals and call us directly to book at the
            best available fare.
          </p>
        </div>

        {/* ── Cards Grid ── */}
        {loading ? (
          /* Skeleton loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayPages.map((page, i) => {
              const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
              const icon = CARD_ICONS[i % CARD_ICONS.length];
              const callPhone = page.callPhone || "+18772518760";
              const callDisplay = callPhone
                .replace(/^\+1/, "+1 ")
                .replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");

              return (
                <div
                  key={page._id}
                  className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-white/60"
                >
                  {/* Gradient background */}
                  <div
                    className="absolute inset-0 rounded-3xl"
                    style={{ background: gradient }}
                  />
                  {/* Decorative circle */}
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

                  <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[250px]">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{icon}</span>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/30">
                        <TrendingDown className="w-3 h-3" />
                        Best Fare
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-white leading-snug mb-2 flex-1">
                      {page.title}
                    </h3>

                    {/* Description */}
                    {page.description && (
                      <p className="text-white/75 text-sm leading-relaxed line-clamp-2 mb-5">
                        {page.description}
                      </p>
                    )}

                    {/* CTA buttons */}
                    <div className="flex gap-2 mt-auto">
                      {/* View Deal */}
                      <Link
                        href={`/lp/${page.slug}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-sm border border-white/30 text-white font-bold text-sm py-2.5 rounded-2xl transition-all duration-200"
                      >
                        View Deal
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {/* Direct Call — tel: link */}
                      <CompanyPhone
                        className="flex items-center justify-center gap-1.5 bg-white hover:bg-green-50 active:scale-95 text-green-700 font-black text-sm px-4 py-2.5 rounded-2xl transition-all duration-200 shadow-lg shadow-black/20"
                      >
                        {() => (
                          <>
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">Call</span>
                          </>
                        )}
                      </CompanyPhone>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && pages.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm mb-4">
              Don't see your destination? Call us — we search every airline.
            </p>
            <CompanyPhone
              asLink={true}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 active:scale-95 text-white font-black px-8 py-4 rounded-full text-lg shadow-xl shadow-blue-500/30 transition-all duration-200"
            >
              {(rawNumber, displayVal) => (
                <>
                  <Phone className="w-5 h-5" />
                  {displayVal}
                </>
              )}
            </CompanyPhone>
          </div>
        )}
      </div>
    </section>
  );
}
