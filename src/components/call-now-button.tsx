"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Headphones } from "lucide-react";

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

  const callNumber = (mounted && settings?.callNumber) || "+18772518760";
  const callLabel = (mounted && settings?.callLabel) || "Call Customer Support";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] hidden sm:block">
      <div className="relative group">
        <a
          href={`tel:${callNumber}`}
          title={`${callLabel}: ${callNumber}`}
          className="relative flex items-center gap-3 bg-[#102B4E] hover:bg-[#163A66] text-white rounded-full pl-4 pr-5 py-2.5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-white/20"
        >
          {/* Phone icon */}
          <span className="flex items-center justify-center w-8 h-8 bg-[#2676D9] text-white rounded-full shrink-0 shadow-xs">
            <Phone className="w-4 h-4" />
          </span>
          <span className="flex flex-col leading-tight text-left">
            <span className="text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
              {callLabel}
            </span>
            <span className="text-white font-extrabold text-sm tracking-tight">
              {callNumber}
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
