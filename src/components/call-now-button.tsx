"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function CallNowButton() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: settings } = useQuery({
    queryKey: ["globalSettings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      return res.json();
    },
    staleTime: 60000,
  });

  const callNumber = (mounted && settings?.callNumber) || "+18773717356";
  const callLabel = (mounted && settings?.callLabel) || "Call Now";

  return (
    <div className="fixed bottom-6 right-5 z-[9999]">
      {/* Main button */}
      <div className="relative">
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full bg-green-400 opacity-40 animate-ping" />
        <a
          href={`tel:${callNumber}`}
          title={`${callLabel}: ${callNumber}`}
          className="relative flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full pl-4 pr-5 py-3 shadow-2xl hover:shadow-green-500/40 hover:scale-105 transition-all duration-200 font-bold text-sm border-2 border-white"
        >
          {/* Phone icon */}
          <span className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">{callLabel}</span>
            <span className="text-white font-extrabold text-sm">{callNumber}</span>
          </span>
        </a>
      </div>
    </div>
  );
}
