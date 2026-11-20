"use client";

import React, { Suspense } from "react";
import { SearchWidget } from "@/components/search-widget";
import { Layout } from "@/components/layout";
import { LandingPagesSection } from "@/components/landing-pages-section";
import { UsaDestinationsSection } from "@/components/usa-destinations-section";
import { CompanyPhone } from "@/components/company-phone";
import { 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Plane, 
  Phone, 
  Lock, 
  Headphones,
  CalendarCheck,
  Compass
} from "lucide-react";

// Booking steps for Expedia/Kayak level clarity
const bookingSteps = [
  {
    step: "01",
    title: "Search Domestic Flights",
    desc: "Enter your departure city, arrival destination, and preferred dates to browse live schedules across top US carriers.",
    icon: Search,
  },
  {
    step: "02",
    title: "Compare Fares & Schedules",
    desc: "Filter by departure time, cabin class, and nonstop options with transparent, upfront pricing and zero hidden fees.",
    icon: Compass,
  },
  {
    step: "03",
    title: "Book Online with Confidence",
    desc: "Complete your reservation through our 256-bit encrypted checkout and receive instant confirmation directly to your inbox.",
    icon: CalendarCheck,
  },
];

// Why book with us value props
const features = [
  {
    icon: CreditCard,
    title: "Clear & Upfront Pricing",
    desc: "See full fare breakdowns including standard taxes and fees before completing your booking. No surprise add-ons.",
  },
  {
    icon: Clock,
    title: "24/7 Dedicated Support",
    desc: "Our passenger support team is available around the clock to assist with itinerary questions, changes, or inquiries.",
  },
  {
    icon: Plane,
    title: "500+ Airline Comparisons",
    desc: "Compare domestic flights across major airlines and regional carriers to find the exact schedule that fits your plans.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Encryption",
    desc: "Your personal details and payment transactions are safeguarded with industry-standard 256-bit SSL encryption.",
  },
];

export default function HomePage() {
  return (
    <Layout>
      {/* ── 1. Hero Section ── */}
      <section className="relative w-full overflow-hidden pt-14 pb-36 sm:pb-40 bg-[#102B4E]">
        {/* Background Aviation Video with Navy Overlay */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-25 mix-blend-luminosity pointer-events-none"
          src="https://v.ftcdn.net/02/21/46/45/700_F_221464511_i2BmrjoVhnAWB4KFZqbNIut4a46H2gNa.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23102B4E'/%3E%3C/svg%3E"
        />

        {/* Navy Gradient Overlay for high-contrast readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#102B4E]/95 via-[#102B4E]/80 to-[#102B4E]" />

        {/* Hero Copy */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-4">
          
          {/* US Domestic Reassurance Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></span>
            <span>United States Domestic Flight Search</span>
          </div>

          {/* Primary H1 Heading for Google Ads Intent */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight drop-shadow-sm text-white">
            Your Next Journey <br className="hidden sm:inline" />
            <span className="text-[#3B82F6]">Starts Here.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-slate-200 font-medium leading-relaxed">
            Explore domestic flights across the United States. Compare available options and book your next journey online with confidence.
          </p>

          {/* Micro trust indicators */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
              500+ Airlines Compared
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
              No Hidden Booking Fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
              Instant Confirmation
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. Primary Flight Search Form (Dominant Conversion Component) ── */}
      <section className="px-3 sm:px-4">
        <Suspense
          fallback={
            <div className="w-full max-w-6xl mx-auto -mt-20 bg-white rounded-3xl p-12 shadow-xl border border-slate-200 text-center text-[#64748B] font-bold animate-pulse">
              <Plane className="w-6 h-6 text-[#2676D9] mx-auto mb-2 animate-bounce" />
              Loading real-time flight search...
            </div>
          }
        >
          <SearchWidget />
        </Suspense>
      </section>

      {/* ── 3. Popular USA Domestic Corridors ── */}
      <UsaDestinationsSection />

      {/* ── 4. Booking Steps (Expedia/Kayak Usability) ── */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#2676D9]" />
              Simple &amp; Seamless Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
              How Booking Works on <span className="text-[#2676D9]">MerryTravelo</span>
            </h2>
            <p className="mt-3 text-[#64748B] text-base sm:text-lg max-w-xl mx-auto">
              Follow three easy steps to find, compare, and reserve your domestic flight tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {bookingSteps.map((item, index) => (
              <div
                key={item.step}
                className="relative bg-[#F5F8FC] rounded-2xl p-8 border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-white flex items-center justify-center font-black shadow-xs">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-black text-slate-300 tracking-tighter">
                    {item.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#102B4E] mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Curated Domestic Flight Deals ── */}
      <LandingPagesSection />

      {/* ── 6. Value Props: Why Book With Us ── */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[#102B4E] tracking-tight">
              Why Book With MerryTravelo?
            </h2>
            <p className="mt-3 text-[#64748B] text-base sm:text-lg max-w-xl mx-auto">
              We make domestic flight discovery and booking simple, seamless, and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-[#F5F8FC] rounded-2xl p-7 border border-slate-200 shadow-2xs text-left hover:shadow-md hover:border-[#2676D9]/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-5 text-[#2676D9] shadow-2xs">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#102B4E] mb-2">{feature.title}</h3>
                <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Secondary Customer Support Call Assistance Section ── */}
      <section id="support" className="py-16 bg-[#F5F8FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2676D9] mb-1">
                <Headphones className="w-4 h-4" />
                <span>Dedicated Booking Support</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#102B4E]">
                Need Help With Your Flight Booking?
              </h3>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
                Speak with our customer support team for itinerary guidance, complex flight connections, or booking assistance.
              </p>
            </div>

            {/* Secondary Support Action Button */}
            <div className="shrink-0 flex flex-col items-center md:items-end gap-2">
              <CompanyPhone
                asLink={true}
                className="inline-flex items-center gap-2.5 bg-[#102B4E] hover:bg-[#163A66] text-white font-black px-7 py-4 rounded-xl text-sm sm:text-base shadow-md hover:shadow-lg transition-all"
              >
                {(_raw, display) => (
                  <>
                    <Phone className="w-4 h-4 text-[#3B82F6]" />
                    <span>Call Customer Support: {display}</span>
                  </>
                )}
              </CompanyPhone>
              <span className="text-[11px] text-[#64748B] font-medium">
                Online booking available 24/7 &bull; Real-time assistance
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. Trust & Security Banner ── */}
      <section className="py-12 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-center text-xs text-[#64748B] font-semibold">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2676D9]" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PCI-DSS Compliant Data Handling</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-[#2676D9]" />
              <span>Instant Airline E-Ticket Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
              <span>No Hidden Processing Surcharges</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
