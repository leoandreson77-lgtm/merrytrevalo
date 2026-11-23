"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Plane,
  Check,
  X,
  Clock,
  ShieldCheck,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Headphones,
  Calendar,
  FileText,
  RefreshCw,
} from "lucide-react";

export interface LpGeminiExperienceProps {
  category?: "sale" | "changesncancellation" | "airline" | "other" | string;
  mode?: "flight-changes-desk" | "airline-carrier-desk";
  callPhone: string;
  formattedPhone: string;
  headerPhone?: string;
  routeContext?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  customFaqs?: Array<{ q: string; a: string }>;
  customFeatures?: Array<{ icon?: string; title: string; desc: string }>;
  customTestimonials?: Array<{ quote: string; author: string; location?: string; rating?: number }>;
  customRoutes?: Array<{ city?: string; code?: string; from?: string; to?: string; price?: string; tagline?: string; desc?: string }>;
}

export function LpGeminiExperience({
  category = "changesncancellation",
  mode = "flight-changes-desk",
  callPhone,
  formattedPhone,
  headerPhone = "+1 855 510 6415",
  routeContext = "USA Domestic Flights",
  title,
  subtitle,
  badgeText,
  customFaqs,
  customFeatures,
  customTestimonials,
  customRoutes,
}: LpGeminiExperienceProps) {
  // Mode selection state (allows interactive switching or defaults to template/category)
  const initialMode = mode || (category === "airline" ? "airline-carrier-desk" : "flight-changes-desk");
  const [activeMode, setActiveMode] = useState<"flight-changes-desk" | "airline-carrier-desk">(initialMode);

  // Mode 1: Issue & Route selector state
  const [selectedIssue, setSelectedIssue] = useState<"change" | "cancel" | "sameday" | "name">("change");
  const [routeType, setRouteType] = useState<"domestic" | "international">("domestic");

  // Mode 2: Carrier & Request selector state
  const [selectedAirline, setSelectedAirline] = useState<string>("Delta Air Lines");
  const [airlineIntent, setAirlineIntent] = useState<string>("Change Flight Date / Time");

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const cleanPhone = callPhone.replace(/[^0-9+]/g, "");
  const cleanHeaderPhone = headerPhone.replace(/[^0-9+]/g, "");

  // Universal call conversion trigger
  const handleCallClick = (source: string, targetPhone = cleanPhone) => {
    if (typeof window !== "undefined") {
      try {
        if ((window as any).gtag) {
          (window as any).gtag("event", "click_to_call", {
            event_category: "Conversion",
            event_label: targetPhone,
            destination: routeContext,
            source_section: source,
            transport_type: "beacon",
          });
          (window as any).gtag("event", "conversion", {
            send_to: "AW-18576835283/bF7OCNH-5rwdENOFkJpF",
            value: 1.0,
          });
        }
        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: "click_to_call",
            phoneNumber: targetPhone,
            destination: routeContext,
            source: source,
          });
        }
        if (typeof (window as any).gtag_report_conversion === "function") {
          (window as any).gtag_report_conversion(`tel:${targetPhone}`);
        }
      } catch (e) {
        // Safe fallback
      }
    }
  };

  /* ─────────────────────────────────────────────────────────────
     DATA FOR MODE 1: FLIGHT CHANGES & CANCELLATIONS DESK
  ───────────────────────────────────────────────────────────── */
  const ISSUE_DETAILS: Record<string, { title: string; desc: string; badge: string; buttonText: string }> = {
    "change-domestic": {
      title: "Domestic US Flight Date & Time Modification Desk Ready",
      desc: "Many Main Cabin & Economy tickets qualify for zero-change-fee date switches (fare difference may apply). Have your 6-character PNR confirmation code ready for instant re-issuance.",
      badge: "Queue Status: Immediate Pickup • Avg. Resolution: 4 Mins",
      buttonText: "Tap to Call Change Flight Specialist",
    },
    "change-international": {
      title: "International Flight Modification & Re-Routing Desk",
      desc: "Cross-carrier date switches and schedule adjustments across transatlantic, transpacific, and regional partners. We locate alternative seats and apply available waiver rules.",
      badge: "Queue Status: Live Specialist Online • Avg. Resolution: 5 Mins",
      buttonText: "Tap to Call International Change Specialist",
    },
    "cancel-domestic": {
      title: "Domestic US Cancellation & Travel Credit Preservation Desk",
      desc: "Avoid forfeiting ticket value. Verify 24-hour Department of Transportation risk-free cancellation rules, check refundable fare status, and secure future airline credits.",
      badge: "Credit Protection Active • Instant PNR Verification",
      buttonText: "Tap to Call Cancellation & Credit Specialist",
    },
    "cancel-international": {
      title: "International Flight Cancellation & Voucher Recovery Desk",
      desc: "Maximize refund eligibility on international itineraries. We review carrier cancellation policies, government tax refunds, and multi-airline partner credits.",
      badge: "International Policy Verified • Direct Human Agent",
      buttonText: "Tap to Call International Cancellation Desk",
    },
    "sameday-domestic": {
      title: "Same-Day Standby & Missed Flight Recovery Desk",
      desc: "Stuck at the airport or missed a connection? Our desk checks real-time seat inventory across multiple domestic carriers to find the fastest next-departure flight.",
      badge: "Urgent Priority Desk • Under 30s Wait Time",
      buttonText: "Tap to Call Same-Day Rebooking Desk",
    },
    "sameday-international": {
      title: "Urgent Long-Haul Rebooking & Connection Assistance",
      desc: "Immediate rerouting for delayed or missed international connections. We search partner airline alliances to get you back on schedule.",
      badge: "Urgent International Reroute • 24/7 Available",
      buttonText: "Tap to Call Urgent Rebooking Specialist",
    },
    "name-domestic": {
      title: "Passenger Name Corrections & Seat Upgrade Support",
      desc: "Fix spelling errors, add missing middle names, or secure preferred seats, extra legroom, and premium cabin upgrades before online check-in locks.",
      badge: "Ticketing Team Live • Immediate Assistance",
      buttonText: "Tap to Call Name & Seat Specialist",
    },
    "name-international": {
      title: "Passport Name Match & International Cabin Upgrades",
      desc: "Ensure boarding pass names match your passport precisely to avoid denial of boarding. Cabin upgrades to Premium Economy and Business Class available.",
      badge: "Passport Match Desk • Instant Seat Re-Assignment",
      buttonText: "Tap to Call International Ticket Specialist",
    },
  };

  const currentIssueData = ISSUE_DETAILS[`${selectedIssue}-${routeType}`] || ISSUE_DETAILS["change-domestic"];

  /* ─────────────────────────────────────────────────────────────
     DATA FOR MODE 2: MULTI-AIRLINE INDEPENDENT ASSISTANCE DESK
  ───────────────────────────────────────────────────────────── */
  const AIRLINES = [
    { name: "Delta Air Lines", code: "DL", badge: "$0 Carrier Change Fee on Main Cabin*" },
    { name: "United Airlines", code: "UA", badge: "Future Flight Credit Help" },
    { name: "American Airlines", code: "AA", badge: "Trip Credit & Standby Guidance" },
    { name: "Southwest Airlines", code: "WN", badge: "10-Min Pre-Flight Credit Rule" },
    { name: "JetBlue Airways", code: "B6", badge: "Travel Bank & Mint Modifications" },
    { name: "Alaska Airlines", code: "AS", badge: "My Wallet & West Coast Routes" },
    { name: "Other Commercial Carriers", code: "ALL", badge: "All Major US & Global Airlines" },
  ];

  const INTENTS = [
    "Change Flight Date / Time",
    "Cancel for Travel Credit / Refund",
    "Missed Connection / Same-Day Standby",
    "Name Correction / Seat Upgrade",
  ];

  const AIRLINE_POLICIES: Record<string, string> = {
    "Delta Air Lines": "Delta Main Cabin and higher fares originating in North America typically carry $0 airline change fees (fare difference applies). Basic Economy tickets are non-changeable without a waiver. Have your 6-character PNR confirmation code ready.",
    "United Airlines": "United Economy and Economy Plus fares offer flexible date switches with no change fees for flights within the US, Mexico, and Caribbean. Future Flight Credits can be applied over the phone with an agent.",
    "American Airlines": "American Airlines allows flight date modifications on Main Cabin, Premium Economy, and Business tickets with zero change fees. Trip Credits and Flight Credits can be validated and redeemed with a specialist.",
    "Southwest Airlines": "Southwest does not charge change or cancellation fees. Must cancel at least 10 minutes prior to scheduled flight departure to retain Wanna Get Away flight credits. Call to verify rebooking options.",
    "JetBlue Airways": "Blue, Blue Plus, and Mint fares have zero change fees on most routes. Travel Bank credits can be confirmed with our desk to lock in a new flight date or reroute.",
    "Alaska Airlines": "Main Cabin and First Class fares have no change fees. Saver fares cannot be changed once ticketed unless covered by an airline operational waiver. Call for real-time seat inventory.",
    "Other Commercial Carriers": "Independent phone support across all scheduled US and international carriers. Our agents access live GDS seat inventory to rebook, modify, or process credit claims immediately.",
  };

  /* ─────────────────────────────────────────────────────────────
     DEFAULT FAQS
  ───────────────────────────────────────────────────────────── */
  const DEFAULT_FAQS = [
    {
      q: "Are you an airline or an independent travel agency?",
      a: "MerryTravelo is an independent third-party travel assistance desk and agency, not an airline. We provide dedicated 24/7 phone support to help travelers modify, cancel, or rebook existing flights quickly without waiting on hours-long airline hold queues.",
    },
    {
      q: "What information do I need before calling?",
      a: "Please have your 6-character airline confirmation code (PNR / Record Locator), the ticketed passenger's last name, and your preferred alternate travel dates or destinations ready. This enables our specialists to look up your reservation in seconds.",
    },
    {
      q: "How fast can my flight ticket be updated?",
      a: "Most date modifications, cancellations, and rebookings are completed in under 5 minutes while you are on the phone. Once approved, updated e-ticket confirmations are dispatched directly to your email address before you hang up.",
    },
    {
      q: "What fees apply for flight changes or cancellations?",
      a: "Any airline fare differences, carrier cancellation penalties (if applicable), and MerryTravelo's independent service fee will be itemized and clearly disclosed to you over the phone before you authorize any change. You are never billed without explicit consent.",
    },
    {
      q: "How do airline eCredits and flight credits work?",
      a: "When a non-refundable ticket is canceled prior to departure, most major airlines issue travel credits or eCredits. Our desk verifies the expiration terms, passenger restrictions, and applies existing credits toward new flights.",
    },
  ];

  const faqs = customFaqs && customFaqs.length > 0 ? customFaqs : DEFAULT_FAQS;

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#172B46] flex flex-col font-sans selection:bg-[#2676D9] selection:text-white">

      {/* ─────────────────────────────────────────────────────────────
          1. TOP COMPLIANCE & NON-AFFILIATION DISCLOSURE BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B1525] text-white/90 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2676D9] text-[10px] font-bold text-white shrink-0">
              ✓
            </span>
            <span className="font-semibold text-slate-200 text-[11px] sm:text-xs">
              <strong>Independent Travel Assistance Desk:</strong> Not affiliated with Delta, United, American, Southwest, or any commercial airline. Standard carrier &amp; service fees may apply.
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300 text-xs shrink-0">
            <span className="hidden md:inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live US Desk:
            </span>
            <a
              href={`tel:${cleanHeaderPhone}`}
              onClick={() => handleCallClick("Top Notice Bar", cleanHeaderPhone)}
              className="font-bold text-white hover:text-[#3B82F6] transition-colors font-mono tracking-tight"
            >
              {headerPhone}
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ZERO-LEAK CONVERSION HEADER (No distracting external links)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Desk Badge */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#2563EB] text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Plane className="w-5 h-5 -rotate-45 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl text-[#0F2744] tracking-tight leading-none">
                MerryTravelo<span className="text-[#0284C7]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase mt-0.5">
                {category === "sale"
                  ? "US Domestic Flight Sale Desk"
                  : activeMode === "airline-carrier-desk" 
                  ? "Independent Airline Desk" 
                  : "US Flight Assistance Desk"}
              </span>
            </div>
          </Link>

          {/* Center: Live Availability Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live US Agents Online &bull; Avg. Wait: <strong>&lt; 28s</strong></span>
          </div>

          {/* Right: Direct Tap-To-Call CTA Button with header phone */}
          <div className="flex items-center gap-2.5">
            <a
              href={`tel:${cleanHeaderPhone}`}
              id="lp-gemini-header-call"
              onClick={() => handleCallClick("Header Call Pill", cleanHeaderPhone)}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border border-sky-200 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold text-[#0F2744] transition-all shadow-xs group cursor-pointer"
            >
              <span className="relative flex items-center justify-center w-7 h-7 bg-[#0284C7] text-white rounded-full shadow-xs">
                <span className="absolute inset-0 rounded-full bg-[#0284C7]/50 animate-ping opacity-50" />
                <Phone className="w-3.5 h-3.5 relative z-10" />
              </span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider">24/7 Phone Desk</span>
                <span className="font-black text-[#0F2744] text-xs sm:text-sm font-mono mt-0.5">{headerPhone}</span>
              </div>
            </a>
          </div>

        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SECTION (High-Intent Aviation Visual & Direct Call CTA)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden pt-12 pb-24 sm:pb-32 bg-[#091D38]">
        {/* Aviation Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2600&q=85"
          alt="Airliner wing in flight above clouds"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] z-0 pointer-events-none select-none opacity-40"
          loading="eager"
        />

        {/* Deep Navy Atmosphere Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#07172E]/90 via-[#0C274E]/80 to-[#081B33]/95" />

        {/* Ambient Sky Glow Accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-400/20 blur-[140px] rounded-full pointer-events-none z-10" />

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-5">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
            <span>
              {badgeText || (category === "sale"
                ? "🔥 UNPUBLISHED US DOMESTIC FLIGHT SALE • UP TO 40% OFF"
                : activeMode === "airline-carrier-desk" 
                ? "24/7 MAJOR CARRIER FLIGHT ASSISTANCE" 
                : "UNITED STATES FLIGHT CHANGES & RESCHEDULING DESK")}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-white drop-shadow-xl">
            {title ? (
              title
            ) : category === "sale" ? (
              <>
                Exclusive Unpublished Flight Fares <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-sky-200 via-cyan-100 to-white bg-clip-text text-transparent underline decoration-[#38BDF8]/40 decoration-wavy underline-offset-8">
                  Save Up to 40% Over The Phone.
                </span>
              </>
            ) : activeMode === "airline-carrier-desk" ? (
              <>
                Need to Change or Cancel Your <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-sky-200 via-cyan-100 to-white bg-clip-text text-transparent underline decoration-[#38BDF8]/40 decoration-wavy underline-offset-8">
                  Delta, United, or American
                </span> Flight?
              </>
            ) : (
              <>
                Need to Change, Cancel, or Reschedule Your Flight? <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-sky-200 via-cyan-100 to-white bg-clip-text text-transparent underline decoration-[#38BDF8]/40 decoration-wavy underline-offset-8">
                  Speak to a Live Specialist in &lt;60s.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-slate-100 font-medium leading-relaxed drop-shadow-md">
            {subtitle || (category === "sale"
              ? "Call our US reservation desk to check unpublished airfare discounts, private contracted airline rates, and locked seat inventory before public fares increase."
              : activeMode === "airline-carrier-desk"
              ? "Speak directly with a live US-based travel specialist for urgent date changes, ticket cancellations, eCredit preservation, and same-day rebooking across Delta, United, American, Southwest, JetBlue, and Alaska Airlines."
              : "Skip 3-hour airline hold queues. Get immediate 24/7 phone assistance for same-day flight changes, ticket cancellations, travel credits, and missed-flight rebooking across all major US & international carriers.")}
          </p>

          {/* Primary Call CTA Button */}
          <div className="pt-2 flex flex-col items-center">
            <a
              href={`tel:${cleanPhone}`}
              id="lp-hero-prominent-call"
              onClick={() => handleCallClick("Hero Primary Call Button")}
              className="group relative inline-flex items-center justify-center gap-4 bg-gradient-to-r from-[#0284C7] via-[#2563EB] to-[#1D4ED8] hover:from-[#0369A1] hover:to-[#1E40AF] active:scale-[0.98] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-[0_14px_45px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_55px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 transition-all duration-300 border-2 border-white/30 cursor-pointer"
            >
              <span className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#0284C7] shadow-md group-hover:scale-105 transition-transform shrink-0">
                <span className="absolute inset-0 rounded-full bg-white/60 animate-ping opacity-75 pointer-events-none" />
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
              </span>
              <div className="flex flex-col text-left">
                <span className="tracking-wide uppercase leading-tight font-black text-xs sm:text-base md:text-lg">
                  {category === "sale" ? "CALL NOW FOR SALE FARES" : "TAP NOW FOR PRIORITY DESK"}
                </span>
                <span className="text-sm sm:text-lg text-cyan-200 font-black tracking-wider font-mono">
                  Call {formattedPhone}
                </span>
              </div>
            </a>
            <p className="mt-2.5 text-xs text-slate-300 font-semibold text-center">
              No Automated Phone Trees &bull; Direct Human Specialist &bull; Avg. Pickup &lt; 28s
            </p>
          </div>

          {/* 3 Reassurance Badges */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-sky-300 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">24/7 US-Based Support</h4>
                <p className="text-[11px] text-slate-300">Day, night, weekends &amp; holidays</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-300 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Instant E-Ticket Re-Issuance</h4>
                <p className="text-[11px] text-slate-300">Updated itinerary sent while on call</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center gap-3">
              <Plane className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">All Major Airlines Supported</h4>
                <p className="text-[11px] text-slate-300">Domestic US &amp; International flights</p>
              </div>
            </div>
          </div>

          {/* Google Ads Compliance Box */}
          <div className="mt-4 p-3.5 bg-black/35 backdrop-blur-md rounded-xl border border-white/15 text-[11px] text-slate-300 max-w-3xl mx-auto leading-relaxed text-left">
            <strong>Disclosure:</strong> MerryTravelo operates as an independent third-party travel assistance desk and is not affiliated with, endorsed by, or an official booking office for Delta, United, American, Southwest, or any commercial airline. Standard airline fare differences, carrier penalties, and agency service fees may apply.
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE ISSUE & AIRLINE SELECTOR (FAST-TRACK WIDGET)
      ───────────────────────────────────────────────────────────── */}
      <section className="px-3 sm:px-4 -mt-10 sm:-mt-14 relative z-30">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(2,132,199,0.22)] border border-blue-100 overflow-hidden">
          
          {/* Top Widget Header */}
          <div className="bg-gradient-to-r from-[#0C274E] via-[#0284C7] to-[#1E40AF] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>
                {activeMode === "airline-carrier-desk" 
                  ? "STEP 1 & 2 • SELECT AIRLINE & REQUEST TYPE" 
                  : "FAST-TRACK YOUR CALL: Select Your Flight Situation"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMode(activeMode === "flight-changes-desk" ? "airline-carrier-desk" : "flight-changes-desk")}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2.5 py-1 rounded-full transition-all border border-white/25 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Switch to {activeMode === "flight-changes-desk" ? "Airline Selector View" : "Issue Selector View"}</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            
            {/* ── MODE 1 INTERACTIVE SELECTOR ── */}
            {activeMode === "flight-changes-desk" && (
              <div className="space-y-6">
                
                {/* 1. Situation Tabs */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#64748B] mb-2.5">
                    1. Tap Your Flight Situation:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "change", label: "Change Flight", icon: Calendar, sub: "Date & Time Shift" },
                      { id: "cancel", label: "Cancel & Refund", icon: ShieldCheck, sub: "Travel Credit Help" },
                      { id: "sameday", label: "Same-Day Rebook", icon: Zap, sub: "Standby & Missed" },
                      { id: "name", label: "Name Fix & Upgrade", icon: Users, sub: "Typo & Seating" },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = selectedIssue === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedIssue(tab.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-sky-50 border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-xs"
                              : "bg-[#F5F8FC] border-slate-200/90 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-black ${isActive ? "text-[#0284C7]" : "text-[#102B4E]"}`}>
                              {tab.label}
                            </span>
                            <Icon className={`w-4 h-4 ${isActive ? "text-[#0284C7]" : "text-slate-400"}`} />
                          </div>
                          <span className="text-[10px] text-[#64748B] block font-medium">
                            {tab.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Route Type Toggle */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#64748B] mb-2">
                    2. Select Route Type:
                  </label>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setRouteType("domestic")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        routeType === "domestic"
                          ? "bg-white text-[#0F2744] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🇺🇸 Domestic US Flight
                    </button>
                    <button
                      type="button"
                      onClick={() => setRouteType("international")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        routeType === "international"
                          ? "bg-white text-[#0F2744] shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ✈️ International Flight
                    </button>
                  </div>
                </div>

                {/* 3. Dynamic Guidance Panel */}
                <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-extrabold text-[#102B4E] text-base sm:text-lg">
                      {currentIssueData.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {currentIssueData.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {currentIssueData.desc}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href={`tel:${cleanPhone}`}
                      id="lp-dynamic-call-button"
                      onClick={() => handleCallClick(`Dynamic Widget: ${selectedIssue} (${routeType})`)}
                      className="inline-flex items-center justify-center gap-2.5 bg-[#0284C7] hover:bg-[#0369A1] active:bg-[#0C4A6E] text-white font-black py-3.5 px-6 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4 animate-bounce" />
                      <span>{currentIssueData.buttonText} &bull; {formattedPhone}</span>
                    </a>
                    <span className="text-[11px] text-slate-500 font-semibold text-center sm:text-left">
                      Toll-free direct connection &bull; No online forms required
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* ── MODE 2 INTERACTIVE SELECTOR ── */}
            {activeMode === "airline-carrier-desk" && (
              <div className="space-y-6">
                
                {/* 1. Select Airline */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#64748B] mb-2.5">
                    1. Select Ticketed Airline:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AIRLINES.map((air) => {
                      const isSelected = selectedAirline === air.name;
                      return (
                        <button
                          key={air.name}
                          type="button"
                          onClick={() => setSelectedAirline(air.name)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-blue-50 border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-xs"
                              : "bg-[#F5F8FC] border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div>
                            <span className={`text-xs font-black block ${isSelected ? "text-[#2563EB]" : "text-[#102B4E]"}`}>
                              {air.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Code: {air.code}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Select What You Need Help With */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#64748B] mb-2">
                    2. Select What You Need Help With:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INTENTS.map((intent) => {
                      const isSelected = airlineIntent === intent;
                      return (
                        <button
                          key={intent}
                          type="button"
                          onClick={() => setAirlineIntent(intent)}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-sky-50 border-[#0284C7] text-[#0284C7] ring-2 ring-[#0284C7]/20"
                              : "bg-[#F5F8FC] border-slate-200 text-[#102B4E] hover:bg-white"
                          }`}
                        >
                          <span>{intent}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#0284C7] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Airline Policy Guidance Card */}
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black text-[#102B4E] text-base sm:text-lg">
                      {selectedAirline} &mdash; {airlineIntent}
                    </h3>
                    <span className="bg-white border border-blue-200 text-[#0284C7] text-xs font-black px-2.5 py-1 rounded-full">
                      Live Guidance Available
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                    {AIRLINE_POLICIES[selectedAirline] || AIRLINE_POLICIES["Other Commercial Carriers"]}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href={`tel:${cleanPhone}`}
                      id="lp-airline-dynamic-call"
                      onClick={() => handleCallClick(`Airline Widget: ${selectedAirline} - ${airlineIntent}`)}
                      className="inline-flex items-center justify-center gap-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black py-3.5 px-6 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4 animate-bounce" />
                      <span>Call Now for {selectedAirline.split(" ")[0]} Flight Help &bull; {formattedPhone}</span>
                    </a>
                    <span className="text-[11px] text-slate-500 font-semibold text-center sm:text-left">
                      Have 6-character PNR code ready for instant lookup
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CORE SERVICES / AIRLINE DIRECTORY GRID
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
              <Headphones className="w-3.5 h-3.5 text-[#2676D9]" />
              Dedicated Phone Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
              {activeMode === "airline-carrier-desk" 
                ? "Independent Ticket Assistance by Carrier" 
                : "How Our Live Flight Desk Helps You Today"}
            </h2>
            <p className="mt-2 text-base text-[#64748B] max-w-2xl mx-auto">
              Whether your plans shifted or your flight was disrupted, our specialists handle complex ticket rules in minutes.
            </p>
          </div>

          {activeMode === "flight-changes-desk" ? (
            /* 3 Core Services Cards (from Gemini Share 1) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-xl hover:border-[#0284C7] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0284C7] text-white flex items-center justify-center mb-4 shadow-sm">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#102B4E] mb-2">
                    Flight Date &amp; Time Changes
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                    Need to fly out earlier or push your return back? We check real-time seat inventory across alternate flights and process itinerary switches without online portal errors.
                  </p>
                  <ul className="space-y-2 text-xs font-bold text-[#334155] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Same-day flight switches &amp; standby</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Missed flight recovery options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Round-trip &amp; multi-city adjustments</span>
                    </li>
                  </ul>
                </div>
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={() => handleCallClick("Services Card 1: Flight Changes")}
                  className="inline-flex items-center justify-between w-full bg-white hover:bg-[#0284C7] text-[#0284C7] hover:text-white border border-[#0284C7]/30 hover:border-transparent font-black text-xs py-3 px-4 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <span>Call for Flight Changes</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-xl hover:border-[#0284C7] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center mb-4 shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#102B4E] mb-2">
                    Cancellations &amp; Travel Credits
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                    Avoid forfeiting your ticket value before departure. We verify 24-hour risk-free cancellation rules, check refundable fare status, and secure future eCredits properly.
                  </p>
                  <ul className="space-y-2 text-xs font-bold text-[#334155] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>24-hour grace period cancellation check</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Airline eCredit &amp; voucher preservation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Schedule-change refund eligibility</span>
                    </li>
                  </ul>
                </div>
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={() => handleCallClick("Services Card 2: Cancellations & Credits")}
                  className="inline-flex items-center justify-between w-full bg-white hover:bg-[#102B4E] text-[#102B4E] hover:text-white border border-[#102B4E]/30 hover:border-transparent font-black text-xs py-3 px-4 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <span>Call to Cancel Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Card 3 */}
              <div className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-xl hover:border-[#0284C7] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mb-4 shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#102B4E] mb-2">
                    Name Fixes &amp; Seat Upgrades
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                    Spotted a typo on your boarding pass or need extra legroom? Get fast help with minor passenger name corrections, baggage additions, and cabin upgrades.
                  </p>
                  <ul className="space-y-2 text-xs font-bold text-[#334155] mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Minor spelling &amp; middle name fixes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Priority &amp; extra-legroom seat selection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Multi-leg connection re-routing</span>
                    </li>
                  </ul>
                </div>
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={() => handleCallClick("Services Card 3: Name Fixes & Upgrades")}
                  className="inline-flex items-center justify-between w-full bg-white hover:bg-[#2563EB] text-[#2563EB] hover:text-white border border-[#2563EB]/30 hover:border-transparent font-black text-xs py-3 px-4 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <span>Call Booking Support</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </div>
          ) : (
            /* 6 Carrier Cards (from Gemini Share 2) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  airline: "Delta Air Lines",
                  code: "DL",
                  requests: [
                    "Delta eCredit preservation & rebooking",
                    "Main Cabin & Comfort+ date switches",
                    "Same-day confirmed flight changes",
                  ],
                },
                {
                  airline: "United Airlines",
                  code: "UA",
                  requests: [
                    "United Future Flight Credit re-issuance",
                    "Economy & Economy Plus itinerary changes",
                    "Missed hub connection re-routing",
                  ],
                },
                {
                  airline: "American Airlines",
                  code: "AA",
                  requests: [
                    "AA Trip Credit & Flight Credit recovery",
                    "Same-day flight change & standby options",
                    "Multi-segment schedule change fixes",
                  ],
                },
                {
                  airline: "Southwest Airlines",
                  code: "WN",
                  requests: [
                    "Wanna Get Away & Anytime date shifts",
                    "Flight credit retention before 10-min cutoff",
                    "Same-day change & EarlyBird check-in help",
                  ],
                },
                {
                  airline: "JetBlue Airways",
                  code: "B6",
                  requests: [
                    "Blue, Blue Plus & Mint date modifications",
                    "JetBlue Travel Bank credit assistance",
                    "Even More Space seat & name fixes",
                  ],
                },
                {
                  airline: "Alaska Airlines",
                  code: "AS",
                  requests: [
                    "Main Cabin & First Class flight switches",
                    "My Wallet credit & Saver fare options",
                    "West Coast & partner connection rebooking",
                  ],
                },
              ].map((carrier) => (
                <div
                  key={carrier.airline}
                  className="bg-[#F5F8FC] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-black text-[#102B4E]">{carrier.airline}</h3>
                      <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[#0284C7]">
                        {carrier.code}
                      </span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-2">
                      COMMON DESK REQUESTS:
                    </div>
                    <ul className="space-y-2 text-xs text-[#334155] font-semibold mb-6">
                      {carrier.requests.map((req, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#0284C7] font-bold">&bull;</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAirline(carrier.airline);
                        window.scrollTo({ top: 400, behavior: "smooth" });
                      }}
                      className="flex-1 bg-white hover:bg-slate-100 text-[#102B4E] border border-slate-200 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Check Rules
                    </button>
                    <a
                      href={`tel:${cleanPhone}`}
                      onClick={() => handleCallClick(`Carrier Card: ${carrier.airline}`)}
                      className="flex-1 bg-[#0284C7] hover:bg-[#0369A1] text-white font-black text-xs py-2.5 rounded-xl transition-all text-center cursor-pointer"
                    >
                      Call Desk &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Extra Custom Features Added from Admin Panel */}
          {customFeatures && customFeatures.length > 0 && (
            <div className="mt-12 pt-10 border-t border-slate-100">
              <div className="text-center mb-8">
                <span className="text-xs font-black uppercase tracking-wider text-[#0284C7] bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  Specialized Booking Capabilities
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#102B4E] mt-2">
                  Additional Support Features
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {customFeatures.map((feat, fIdx) => (
                  <div key={fIdx} className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-[#0284C7] transition-all">
                    <span className="text-2xl mb-2 block">{feat.icon || "✨"}</span>
                    <h4 className="font-bold text-[#102B4E] text-sm mb-1">{feat.title}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5B. EXTRA CUSTOM ROUTES & SALE DEALS (Category: Sale / Custom)
      ───────────────────────────────────────────────────────────── */}
      {((customRoutes && customRoutes.length > 0) || category === "sale") && (
        <section className="py-16 sm:py-20 bg-[#F1F6FC] border-b border-slate-200/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-[#0284C7] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-2xs">
                <Plane className="w-3.5 h-3.5 text-[#0284C7]" />
                Unpublished Airfare Deals
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
                Featured Domestic Routes &amp; Flash Fare Inquiries
              </h2>
              <p className="mt-2 text-base text-[#64748B] max-w-2xl mx-auto">
                Call our telephone desk to check seat availability, schedules, and unpublished phone discounts for any of these travel corridors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(customRoutes && customRoutes.length > 0
                ? customRoutes
                : [
                    { city: "Miami", from: "JFK", to: "MIA", price: "Save Up to 40%", tagline: "Daily nonstop flights & unadvertised weekend rates" },
                    { city: "Las Vegas", from: "ORD", to: "LAS", price: "Group Rates Avail", tagline: "The Strip, shows & convention travel discounts" },
                    { city: "Los Angeles", from: "JFK", to: "LAX", price: "Phone Exclusive", tagline: "Coast-to-coast nonstop & lie-flat seat options" },
                    { city: "Orlando", from: "BOS", to: "MCO", price: "Family Package", tagline: "Theme park family travel & baggage-inclusive fares" },
                    { city: "Honolulu (Hawaii)", from: "SFO", to: "HNL", price: "Island Specials", tagline: "Waikiki beach & multi-island partner rates" },
                    { city: "London (UK)", from: "JFK", to: "LHR", price: "Transatlantic Fare", tagline: "Flagship carrier discounts & priority seat booking" },
                  ]
              ).map((route, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-[#0284C7] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-black bg-sky-50 text-[#0284C7] px-3 py-1 rounded-lg border border-sky-200 flex items-center gap-1.5">
                        <span>{route.from || "USA"}</span>
                        <ArrowRight className="w-3 h-3 text-[#0284C7]" />
                        <span>{route.to || route.code || "DEST"}</span>
                      </span>
                      {route.price && (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                          ⚡ {route.price}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-[#102B4E]">{route.city || "Featured Route"}</h3>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      {route.tagline || route.desc || "Call our live desk to check current airline schedules, baggage allowances, and phone-only ticket pricing."}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <a
                      href={`tel:${cleanPhone}`}
                      onClick={() => handleCallClick(`Route Card: ${route.city || route.from + " to " + route.to}`)}
                      className="inline-flex items-center justify-center gap-2 w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call for Route Fare: {formattedPhone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. 3-STEP PROCESS: HOW OUR LIVE FLIGHT DESK WORKS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F5F8FC] border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight mb-3">
            Update Your Flight in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto mb-12">
            Fast, transparent phone resolution without confusing automated chatbots or endless hold loops.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs relative overflow-hidden">
              <span className="text-5xl font-black text-[#0284C7]/15 absolute top-3 right-4 select-none">
                1
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center font-black mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#102B4E] mb-1.5">
                Tap to Call Free
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Dial <strong>{formattedPhone}</strong> to connect directly with a US flight desk specialist in under 60 seconds.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs relative overflow-hidden">
              <span className="text-5xl font-black text-[#0284C7]/15 absolute top-3 right-4 select-none">
                2
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center font-black mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#102B4E] mb-1.5">
                Share Confirmation Code
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Provide your 6-digit PNR booking code &amp; last name so we can review fare rules and upfront options with you.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs relative overflow-hidden">
              <span className="text-5xl font-black text-[#0284C7]/15 absolute top-3 right-4 select-none">
                3
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center font-black mb-4">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-[#102B4E] mb-1.5">
                Receive Updated E-Ticket
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Approve your new flight or cancellation credit and get an instant email confirmation before hanging up.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. CRO COMPARISON TABLE: AIRLINE QUEUE VS MERRYTRAVELO DESK
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
              Why Call Our Flight Desk vs Waiting in Carrier Queues
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#64748B]">
              Side-by-side comparison of airline call centers vs our independent travel assistance desk.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#102B4E] text-white">
                  <th className="p-4 sm:p-5 font-bold">Feature / Experience</th>
                  <th className="p-4 sm:p-5 font-bold bg-[#0F2238] text-rose-300">Official Airline Hold Queue</th>
                  <th className="p-4 sm:p-5 font-bold bg-[#0284C7] text-white">MerryTravelo Live Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-white">
                  <td className="p-4 sm:p-5 font-bold text-[#102B4E]">Average Wait Time</td>
                  <td className="p-4 sm:p-5 text-rose-700 font-medium">45 to 180+ minutes during peak times</td>
                  <td className="p-4 sm:p-5 text-emerald-700 font-black flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Under 60 seconds (Live US pickup)</span>
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-4 sm:p-5 font-bold text-[#102B4E]">Phone Tree Navigation</td>
                  <td className="p-4 sm:p-5 text-slate-600">Complex automated IVR and robot loops</td>
                  <td className="p-4 sm:p-5 text-emerald-700 font-black flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Direct human specialist instantly</span>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="p-4 sm:p-5 font-bold text-[#102B4E]">Cross-Airline Alternative Flights</td>
                  <td className="p-4 sm:p-5 text-slate-600">Restricted to single operating carrier only</td>
                  <td className="p-4 sm:p-5 text-emerald-700 font-black flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Scans all major domestic carriers</span>
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-4 sm:p-5 font-bold text-[#102B4E]">eCredit &amp; Waiver Assistance</td>
                  <td className="p-4 sm:p-5 text-slate-600">Strict automated rules, often forfeits value</td>
                  <td className="p-4 sm:p-5 text-emerald-700 font-black flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Expert review to preserve maximum credit</span>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="p-4 sm:p-5 font-bold text-[#102B4E]">Pricing &amp; Fee Disclosure</td>
                  <td className="p-4 sm:p-5 text-slate-600">Surprise hidden penalties after hold</td>
                  <td className="p-4 sm:p-5 text-emerald-700 font-black flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>100% upfront itemized breakdown</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. VERIFIED CUSTOMER REVIEWS (SOCIAL PROOF)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F5F8FC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1 rounded-full text-xs font-bold text-[#102B4E] mb-3 shadow-2xs">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>4.8 / 5 Average Caller Rating</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
              Trusted by Travelers Across the United States
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(customTestimonials && customTestimonials.length > 0 ? customTestimonials : [
              {
                quote: "Stranded at Chicago O'Hare after a tight connection fell apart and the airline app kept crashing. Called the desk, got picked up in 20 seconds, and was confirmed on the 6:15 PM flight out.",
                author: "Marcus R.",
                location: "Chicago, IL • Same-Day Rebooking",
                time: "Verified Call • 2 hrs ago",
              },
              {
                quote: "Had a sudden family medical emergency in Dallas and needed to move three tickets up by two days. The specialist walked me through the exact fare difference clearly and emailed our new boarding confirmations right away.",
                author: "Sarah L.",
                location: "Austin, TX • Family Date Change",
                time: "Verified Call • Yesterday",
              },
              {
                quote: "Saved me from losing $640 on a non-refundable ticket I couldn't take. They helped cancel the segment prior to takeoff and ensured my full travel credit was documented for next month.",
                author: "David K.",
                location: "Newark, NJ • Cancellation & Credit",
                time: "Verified Call • 3 days ago",
              },
            ]).map((review: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">{review.time || "Verified Caller"}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#172B46] leading-relaxed italic">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#102B4E]">{review.author}</span>
                  <span>{review.location}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#64748B]">
              Clear answers before you call our flight assistance desk.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#F5F8FC] rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-[#102B4E] text-base hover:text-[#0284C7] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#0284C7] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-200/60 pl-11">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FINAL BOTTOM URGENCY CTA CARD
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#0D223D] text-white relative overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B1E36] via-[#0D223D]/90 to-[#0B1E36]" />

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Headphones className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {category === "sale" ? "Unpublished Fares Available Now" : "24/7 Urgent Flight Desk Open Now"}
          </h2>

          <p className="text-slate-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {category === "sale"
              ? "Call our ticketing desk now to compare airline schedules and lock in private airfares over the phone."
              : "Don't risk missing your flight or losing non-refundable ticket value. Tap below to speak directly with an independent flight support specialist."}
          </p>

          <div className="pt-2">
            <a
              href={`tel:${cleanPhone}`}
              id="lp-bottom-cta-call"
              onClick={() => handleCallClick("Final Bottom Urgency CTA")}
              className="group relative inline-flex items-center justify-center gap-3.5 bg-gradient-to-r from-[#0284C7] via-[#2563EB] to-[#1D4ED8] hover:from-[#0369A1] hover:to-[#1E40AF] active:scale-[0.98] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-[0_14px_40px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_50px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 transition-all duration-300 border-2 border-white/30 cursor-pointer text-sm sm:text-lg font-black"
            >
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
              <span>CALL NOW: {formattedPhone}</span>
            </a>
          </div>

          <p className="text-xs text-slate-300 font-medium">
            Toll-Free US Assistance Helpline &bull; Average Wait Time Under 28 Seconds
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. GOOGLE ADS COMPLIANCE FOOTER & DISCLAIMERS
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#081525] text-white pt-14 pb-28 md:pb-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/10">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white flex items-center justify-center font-black">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-black text-xl text-white tracking-tight">
                  MerryTravelo<span className="text-[#38BDF8]">.</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
                MerryTravelo operates as an independent telephone concierge and travel agency. We provide direct phone-based flight assistance for bookings, changes, cancellations, and rebooking across US and global commercial airlines.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                24/7 Telephone Desk
              </h4>
              <p className="text-xs text-slate-300">
                Nationwide Domestic &amp; International Flight Desk:
              </p>
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => handleCallClick("Footer Desk Call", cleanPhone)}
                className="inline-flex items-center gap-2 text-white hover:text-[#38BDF8] font-bold text-sm font-mono"
              >
                <Phone className="w-4 h-4 text-[#38BDF8]" />
                <span>{formattedPhone}</span>
              </a>
              <p className="text-[11px] text-slate-400">
                Skip long carrier queues. Connect with a live ticketing representative.
              </p>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Transparency &amp; Legal
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Detailed Legal Disclaimers (Required for Google Ads compliance) */}
          <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
            <p>
              <strong>Trademark &amp; Non-Affiliation Disclaimer:</strong> MerryTravelo is an independent travel agency and phone concierge service. We are not affiliated with, sponsored by, endorsed by, or acting as an official customer support line for Delta Air Lines, United Airlines, American Airlines, Southwest Airlines, JetBlue Airways, Alaska Airlines, or any other commercial airline. All carrier names, trademarks, and logos are used strictly for descriptive, nominative reference to identify supported passenger itineraries.
            </p>
            <p>
              <strong>Pricing &amp; Fee Transparency:</strong> Ticket modifications, date changes, cancellations, and rebookings are subject to the fare rules of the operating airline carrier. Any applicable airline fare differences, carrier penalties, and MerryTravelo&apos;s independent service fee will be itemized and disclosed in full over the phone before you authorize any payment.
            </p>
            <p className="text-center pt-4 text-slate-500 text-[11px]">
              &copy; {new Date().getFullYear()} MerryTravelo Travel Services LLC. All Rights Reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          12. STICKY MOBILE BOTTOM CALL NOW BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#0B1525]/95 backdrop-blur-md border-t border-white/15 shadow-2xl md:hidden">
        <a
          href={`tel:${cleanPhone}`}
          id="lp-mobile-sticky-call-bar"
          onClick={() => handleCallClick("Mobile Sticky Bar")}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#0284C7] to-[#2563EB] active:bg-[#102B4E] text-white font-black py-3.5 px-4 rounded-xl text-sm shadow-lg tracking-wide uppercase transition-all"
        >
          <Phone className="w-4 h-4 animate-bounce" />
          <span>CALL NOW: {formattedPhone}</span>
        </a>
      </div>

    </div>
  );
}
