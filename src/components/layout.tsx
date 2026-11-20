"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Phone, Menu, X, ShieldCheck, Headphones, MapPin, Search } from "lucide-react";
import { CompanyPhone } from "@/components/company-phone";
import { CallNowButton } from "@/components/call-now-button";
import { siteConfig } from "@/lib/site-config";

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] text-[#172B46] selection:bg-[#2676D9] selection:text-white">
      {/* ── Top Micro-Announcement Bar ── */}
      <div className="bg-[#102B4E] text-white/90 text-xs py-1.5 px-4 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2676D9] text-[10px] font-bold text-white">✓</span>
            <span className="font-medium text-slate-200">
              Trusted US Domestic Flight Search &bull; Transparent Fares &bull; No Hidden Booking Fees
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <span className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#3B82F6]" />
              Customer Support:
            </span>
            <CompanyPhone className="font-bold text-white hover:text-[#3B82F6] transition-colors" />
          </div>
        </div>
      </div>

      {/* ── Main Sticky Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#102B4E] text-white flex items-center justify-center font-black shadow-sm group-hover:bg-[#2676D9] transition-colors duration-200">
              <Plane className="w-5 h-5 -rotate-45 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl text-[#102B4E] tracking-tight leading-none">
                MerryTravelo<span className="text-[#2676D9]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase mt-0.5">
                US Flight Booking
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 font-semibold text-sm text-[#172B46]">
            <Link 
              href="/#search-flights" 
              className="text-[#102B4E] hover:text-[#2676D9] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Flights</span>
            </Link>
            <Link 
              href="/#destinations" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Destinations
            </Link>
            <Link 
              href="/#deals" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Flight Deals
            </Link>
            <Link 
              href="/about" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Contact
            </Link>
            <Link 
              href="/#support" 
              className="text-[#64748B] hover:text-[#102B4E] transition-colors cursor-pointer"
            >
              Customer Support
            </Link>
          </nav>

          {/* Header Action: Secondary Support Call */}
          <div className="flex items-center gap-2.5">
            <CompanyPhone 
              className="inline-flex items-center gap-2 bg-[#F5F8FC] hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-full text-xs font-bold text-[#102B4E] transition-all shadow-xs"
            >
              {(_rawNumber, displayVal) => (
                <>
                  <span className="flex items-center justify-center w-5 h-5 bg-[#2676D9] text-white rounded-full">
                    <Phone className="w-3 h-3" />
                  </span>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] font-medium text-[#64748B] hidden lg:inline">Phone Support</span>
                    <span className="font-bold text-[#102B4E] text-xs sm:text-sm">{displayVal}</span>
                  </div>
                </>
              )}
            </CompanyPhone>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-xl text-[#102B4E] hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-[#172B46]">
              <Link 
                href="/#search-flights"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F5F8FC] flex items-center justify-between"
              >
                <span>Flights</span>
                <Search className="w-4 h-4 text-[#2676D9]" />
              </Link>
              <Link 
                href="/#destinations"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F5F8FC] flex items-center justify-between"
              >
                <span>Destinations</span>
                <MapPin className="w-4 h-4 text-[#2676D9]" />
              </Link>
              <Link 
                href="/#deals"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F5F8FC]"
              >
                Flight Deals
              </Link>
              <Link 
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F5F8FC]"
              >
                About Us
              </Link>
              <Link 
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F5F8FC]"
              >
                Contact
              </Link>
              <Link 
                href="/#support"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F5F8FC]"
              >
                Customer Support
              </Link>
            </nav>

            <div className="pt-2 border-t border-slate-100">
              <CompanyPhone 
                className="w-full flex items-center justify-center gap-2 bg-[#102B4E] text-white py-3 rounded-xl font-bold text-sm shadow-md"
              >
                {(_raw, display) => (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>Call Support: {display}</span>
                  </>
                )}
              </CompanyPhone>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content Body ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Sticky Mobile Booking & Call Bar (Mobile Viewport Only) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl flex items-center gap-2.5">
        <Link
          href="/#search-flights"
          className="flex-1 flex items-center justify-center gap-2 bg-[#2676D9] active:bg-[#102B4E] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Search Flights</span>
        </Link>
        <CompanyPhone
          className="flex items-center justify-center gap-1.5 bg-[#102B4E] active:bg-[#163A66] text-white px-4 py-3 rounded-xl font-bold text-xs shadow-md transition-all"
        >
          {() => (
            <>
              <Phone className="w-4 h-4" />
              <span>Call Support</span>
            </>
          )}
        </CompanyPhone>
      </div>

      {/* ── Premium Footer ── */}
      <footer className="bg-[#102B4E] text-white pt-16 pb-24 md:pb-14 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Col 1: Brand Info (2 cols wide on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2676D9] text-white flex items-center justify-center font-black">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-black text-2xl text-white tracking-tight">
                  MerryTravelo<span className="text-[#3B82F6]">.</span>
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
                MerryTravelo is a dedicated domestic flight search portal delivering transparent airfare comparisons across major carriers. Find the best schedules, book online with confidence, and reach our passenger support team anytime.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Instant E-Ticket Dispatch</span>
                </div>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider text-[11px]">
                Domestic Flights
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <Link href="/#search-flights" className="hover:text-white transition-colors">
                    Search Flights
                  </Link>
                </li>
                <li>
                  <Link href="/#destinations" className="hover:text-white transition-colors">
                    Popular US Destinations
                  </Link>
                </li>
                <li>
                  <Link href="/#deals" className="hover:text-white transition-colors">
                    Handpicked Deals
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-white transition-colors">
                    How Booking Works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Support */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider text-[11px]">
                Customer Support
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <CompanyPhone className="hover:text-white font-semibold flex items-center gap-1.5">
                    {(_raw, display) => (
                      <>
                        <Phone className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>{display}</span>
                      </>
                    )}
                  </CompanyPhone>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Help & Contact Center
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About MerryTravelo
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Policies */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white uppercase tracking-wider text-[11px]">
                Legal & Policies
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal Disclaimer */}
          <div className="pt-8 text-center text-xs text-slate-400 space-y-3">
            <p className="max-w-4xl mx-auto leading-relaxed text-[11px] text-slate-400">
              <strong>Disclaimer:</strong> MerryTravelo is an independent online travel agency providing flight search and customer assistance services. We are not directly affiliated with Delta Air Lines, American Airlines, United Airlines, Southwest, or any specific airline carrier. All airline trademarks, logos, and brand names are the property of their respective owners. Fares and seat availability are subject to airline inventory and fare rules.
            </p>
            <p className="text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} MerryTravelo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Call Button on Desktop */}
      <div className="hidden md:block">
        <CallNowButton />
      </div>
    </div>
  );
}
