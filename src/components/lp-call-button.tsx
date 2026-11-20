"use client";

import React from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface LpCallButtonProps {
  phoneNumber: string;
  displayNumber?: string;
  variant?: "primary" | "secondary" | "header" | "sticky" | "pill";
  label?: string;
  sublabel?: string;
  className?: string;
  id?: string;
  destination?: string;
}

export function LpCallButton({
  phoneNumber,
  displayNumber,
  variant = "primary",
  label = "CALL NOW – SPEAK TO OUR TEAM",
  sublabel,
  className,
  id,
  destination,
}: LpCallButtonProps) {
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
  const formattedDisplay = displayNumber || phoneNumber;

  const handleClick = () => {
    if (typeof window !== "undefined") {
      // 1. Dispatch GA4 click_to_call event
      try {
        if ((window as any).gtag) {
          (window as any).gtag("event", "click_to_call", {
            event_category: "Conversion",
            event_label: cleanPhone,
            destination: destination || "USA Domestic",
            transport_type: "beacon",
          });
        }
      } catch (e) {
        console.warn("GA4 call tracking dispatch skipped", e);
      }

      // 2. Push to Google Tag Manager dataLayer if available
      try {
        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: "click_to_call",
            phoneNumber: cleanPhone,
            destination: destination || "USA Domestic",
          });
        }
      } catch (e) {
        console.warn("dataLayer call tracking dispatch skipped", e);
      }

      // 3. Trigger Google Ads call conversion report directly
      try {
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "conversion", {
            send_to: "AW-18576835283/pdU-CKH4lbwdENOFkJpF",
          });
        }
        if (typeof (window as any).gtag_report_conversion === "function") {
          (window as any).gtag_report_conversion(`tel:${cleanPhone}`);
        }
      } catch (e) {
        // Safe fallback
      }
    }
  };

  if (variant === "header") {
    return (
      <a
        href={`tel:${cleanPhone}`}
        id={id || "lp-header-call-btn"}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2.5 bg-[#102B4E] hover:bg-[#163A66] active:scale-95 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 border border-white/20 google-phone-number",
          className
        )}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2676D9] text-white">
          <Phone className="w-3.5 h-3.5" />
        </span>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[10px] text-slate-300 font-medium hidden sm:inline">Call Assistance Desk</span>
          <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight">{formattedDisplay}</span>
        </div>
      </a>
    );
  }

  if (variant === "sticky") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#102B4E]/95 backdrop-blur-md border-t border-white/15 shadow-2xl md:hidden">
        <a
          href={`tel:${cleanPhone}`}
          id={id || "lp-sticky-mobile-call-btn"}
          onClick={handleClick}
          className={cn(
            "w-full flex items-center justify-center gap-2.5 bg-[#2676D9] active:bg-[#102B4E] text-white font-black py-3.5 px-4 rounded-xl text-sm shadow-lg tracking-wide uppercase google-phone-number transition-all",
            className
          )}
        >
          <Phone className="w-4 h-4 animate-bounce" />
          <span>{label}</span>
          <span className="text-white/90 text-xs font-bold">({formattedDisplay})</span>
        </a>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <a
        href={`tel:${cleanPhone}`}
        id={id}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 bg-[#2676D9] hover:bg-[#102B4E] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer google-phone-number",
          className
        )}
      >
        <Phone className="w-3.5 h-3.5" />
        <span>Call: {formattedDisplay}</span>
      </a>
    );
  }

  // Primary Hero & Main Section Call Button
  return (
    <div className="flex flex-col items-center w-full sm:w-auto">
      <a
        href={`tel:${cleanPhone}`}
        id={id || "lp-primary-call-btn"}
        onClick={handleClick}
        className={cn(
          "group relative w-full sm:w-auto inline-flex items-center justify-center gap-3.5 bg-gradient-to-r from-[#2676D9] via-[#3B82F6] to-[#1D60B5] hover:from-[#1D60B5] hover:to-[#2676D9] active:scale-[0.98] text-white font-black text-sm sm:text-lg md:text-xl px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-[0_12px_36px_rgba(38,118,217,0.45)] hover:shadow-[0_16px_48px_rgba(38,118,217,0.6)] transition-all duration-300 border-2 border-white/30 google-phone-number cursor-pointer",
          className
        )}
      >
        {/* Ringing Phone Icon with Pulsing Halo */}
        <span className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#2676D9] shadow-md group-hover:scale-105 transition-transform shrink-0">
          <span className="absolute inset-0 rounded-full bg-white/60 animate-ping opacity-75 pointer-events-none" />
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
        </span>
        <div className="flex flex-col text-left">
          <span className="tracking-wide uppercase leading-tight font-black text-xs sm:text-base md:text-lg">
            {label}
          </span>
          <span className="text-xs sm:text-sm text-cyan-200 font-extrabold tracking-wider font-mono">
            {formattedDisplay}
          </span>
        </div>
      </a>
      {sublabel && (
        <p className="mt-2 text-[11px] sm:text-xs text-slate-300 font-medium text-center">
          {sublabel}
        </p>
      )}
    </div>
  );
}

