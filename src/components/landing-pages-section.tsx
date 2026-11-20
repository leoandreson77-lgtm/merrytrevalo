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
      id="deals"
      className="py-20 px-4 bg-[#F5F8FC] border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white text-[#102B4E] border border-slate-200 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2676D9]" />
            Curated Domestic Deals
            <Sparkles className="w-3.5 h-3.5 text-[#2676D9]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#102B4E] tracking-tight">
            Handpicked Routes &amp;{" "}
            <span className="text-[#2676D9]">
              Special Offers
            </span>
          </h2>
          <p className="text-[#64748B] mt-3 max-w-xl mx-auto text-base sm:text-lg">
            Browse our curated domestic flight routes and compare competitive airline fares across the United States.
          </p>
        </div>

        {/* ── Cards Grid ── */}
        {loading ? (
          /* Skeleton loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPages.map((page, i) => {
              const icon = CARD_ICONS[i % CARD_ICONS.length];
              const callPhone = page.callPhone || "+18772518760";

              return (
                <div
                  key={page._id}
                  className="group relative bg-white rounded-2xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#2676D9]/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl">{icon}</span>
                      <div className="flex items-center gap-1.5 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                        <TrendingDown className="w-3 h-3 text-[#2676D9]" />
                        Featured Fare
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-black text-[#102B4E] leading-snug mb-2 group-hover:text-[#2676D9] transition-colors">
                      {page.title}
                    </h3>

                    {/* Description */}
                    {page.description && (
                      <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6">
                        {page.description}
                      </p>
                    )}
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                    {/* View Deal */}
                    <Link
                      href={`/lp/${page.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#2676D9] hover:bg-[#102B4E] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors"
                    >
                      <span>View Route</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Direct Call Button */}
                    <CompanyPhone
                      className="flex items-center justify-center gap-1.5 bg-[#F5F8FC] hover:bg-slate-100 border border-slate-200 text-[#102B4E] font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-2xs"
                    >
                      {() => (
                        <>
                          <Phone className="w-3.5 h-3.5 text-[#2676D9]" />
                          <span className="hidden sm:inline">Call</span>
                        </>
                      )}
                    </CompanyPhone>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bottom Reassurance ── */}
        <div className="mt-14 text-center bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 max-w-3xl mx-auto shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="font-bold text-[#102B4E] text-base">
                Looking for custom or multi-city itineraries?
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                Our support desk searches unpublished carrier inventory across all US domestic airports.
              </p>
            </div>
            <CompanyPhone
              asLink={true}
              className="inline-flex items-center gap-2 bg-[#102B4E] hover:bg-[#163A66] text-white font-black px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0"
            >
              {(rawNumber, displayVal) => (
                <>
                  <Phone className="w-4 h-4 text-[#3B82F6]" />
                  <span>Call {displayVal}</span>
                </>
              )}
            </CompanyPhone>
          </div>
        </div>
      </div>
    </section>
  );
}
