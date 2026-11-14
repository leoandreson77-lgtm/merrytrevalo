"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BoardingPassCard } from "@/components/boarding-pass-card";

interface RoutePage {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  callPhone?: string;
  isPublished: boolean;
  isStatic?: boolean;
  originCode?: string;
  originName?: string;
  destCode?: string;
  destName?: string;
  seat?: string;
  gate?: string;
  priceOff?: string;
}

export function BoardingPassRoutesSection() {
  // Fetch active landing pages from DB
  const { data: pages = [], isLoading } = useQuery<RoutePage[]>({
    queryKey: ["landingPagesPublic"],
    queryFn: async () => {
      const res = await fetch("/api/landing-pages");
      if (!res.ok) throw new Error("Failed to load active routes");
      return res.json();
    },
  });

  // Fetch popular routes configuration from API
  const { data: popularRoutes = [] } = useQuery<any[]>({
    queryKey: ["popularRoutesConfig"],
    queryFn: async () => {
      const res = await fetch("/api/routes");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch settings to get active call number
  const { data: settings } = useQuery({
    queryKey: ["globalSettings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  const activeNumber = settings?.callNumber || "+18772518760";

  const activePages = pages.filter((p) => p.isPublished);

  // Merge dynamic pages from DB and static predefined pages
  const displayedRoutes = [...activePages];
  
  popularRoutes.forEach((route) => {
    const alreadyExists = activePages.some((p) => p.slug === route.slug);
    if (displayedRoutes.length < 6 && !alreadyExists) {
      displayedRoutes.push({
        _id: route.slug,
        slug: route.slug,
        title: route.title,
        description: `Compare flights and save. Contact us to lock in ${route.priceOff} off contract rates.`,
        isPublished: true,
        isStatic: true,
        originCode: route.originCode,
        originName: route.originName,
        destCode: route.destCode,
        destName: route.destName,
        seat: route.seat,
        gate: route.gate,
        priceOff: route.priceOff,
      });
    }
  });

  // Extract airport code based on title/slug for database pages
  const getRouteCodes = (page: RoutePage, index: number) => {
    if (page.isStatic) {
      return {
        originCode: page.originCode || "NYC",
        originName: page.originName || "New York, USA",
        destCode: page.destCode || "PAR",
        destName: page.destName || "Paris, France",
        seat: page.seat || "12A",
        gate: page.gate || "B12",
        priceOff: page.priceOff || "Save 40%",
      };
    }

    const slugLower = page.slug.toLowerCase();
    const titleLower = page.title.toLowerCase();

    let destCode = "PAR";
    let destName = "Paris, France";

    if (slugLower.includes("london") || titleLower.includes("london")) {
      destCode = "LON"; destName = "London, UK";
    } else if (slugLower.includes("dubai") || titleLower.includes("dubai")) {
      destCode = "DXB"; destName = "Dubai, UAE";
    } else if (slugLower.includes("hawaii") || titleLower.includes("hawaii")) {
      destCode = "HNL"; destName = "Hawaii, USA";
    } else if (slugLower.includes("tokyo") || titleLower.includes("tokyo")) {
      destCode = "NRT"; destName = "Tokyo, Japan";
    } else if (slugLower.includes("rome") || titleLower.includes("rome")) {
      destCode = "FCO"; destName = "Rome, Italy";
    } else if (slugLower.includes("miami") || titleLower.includes("miami")) {
      destCode = "MIA"; destName = "Miami, USA";
    } else if (slugLower.includes("delhi") || titleLower.includes("delhi") || slugLower.includes("india")) {
      destCode = "DEL"; destName = "Delhi, India";
    } else if (slugLower.includes("mumbai") || titleLower.includes("mumbai")) {
      destCode = "BOM"; destName = "Mumbai, India";
    }

    const seat = `${10 + (index * 3) % 18}${["A", "F", "K"][(index * 2) % 3]}`;

    return {
      originCode: "NYC",
      originName: "New York, USA",
      destCode,
      destName,
      seat,
      gate: "B12",
      priceOff: "Save 40%",
    };
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-3xl">🎫</span> Active Boarding Passes & Live Fares
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Special contract fares unlocked on active flight routes. Click a ticket stub to lock in your discount.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
          Fares Refreshing Live
        </div>
      </div>

      {/* Grid of Boarding Passes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayedRoutes.map((route, index) => {
          const { originCode, originName, destCode, destName, seat, gate, priceOff } = getRouteCodes(route, index);
          
          return (
            <BoardingPassCard
              key={route._id}
              title={route.title}
              slug={route.slug}
              originCode={originCode}
              originName={originName}
              destCode={destCode}
              destName={destName}
              seat={seat}
              gate={gate}
              priceOff={priceOff}
              callPhone={activeNumber}
              isStatic={route.isStatic}
              holeBg="#f5f7fa"
            />
          );
        })}
      </div>
    </section>
  );
}
