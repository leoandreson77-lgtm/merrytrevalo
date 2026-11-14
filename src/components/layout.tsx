import Link from "next/link";
import { Plane } from "lucide-react";
import { CallNowButton } from "@/components/call-now-button";
import { CompanyPhone } from "@/components/company-phone";
import { siteConfig } from "@/lib/site-config";

export function Layout({ children }: { children: React.ReactNode }) {
  const brandName = siteConfig.brandName;
  const siteName = siteConfig.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight leading-none">
                MerryTravelo<span className="text-blue-600">.</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Flights & Travel
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer">Search Flights</Link>
            <Link href="/about" className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer">About Us</Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer">Contact & Support</Link>
          </nav>

          <div className="flex items-center gap-3">
            <CompanyPhone className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-md hover:shadow-emerald-600/30 transition-all font-bold text-xs sm:text-sm">
              {(_rawNumber, displayVal) => (
                <>
                  <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <span>{displayVal}</span>
                </>
              )}
            </CompanyPhone>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                  MerryTravelo Flights
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                Compare cheap flights across 500+ airlines. Lowest unpublished airfares, 24/7 dedicated travel support, and instant confirmations.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-slate-900 dark:text-white">Quick Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-blue-600">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-slate-900 dark:text-white">Customer Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <li><CompanyPhone className="hover:text-blue-600 font-semibold" /></li>
                <li><Link href="/contact" className="hover:text-blue-600">Contact Us 24/7</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-slate-900 dark:text-white">Legal & Policies</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-blue-600">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 space-y-3">
            <p className="max-w-4xl mx-auto leading-relaxed">
              Disclaimer: MerryTravelo is an independent online travel portal and is not directly affiliated with Delta Air Lines, American Airlines, United, or any specific carrier. All trademarks and brand names belong to their respective registered owners.
            </p>
            <p>
              © {new Date().getFullYear()} MerryTravelo Flights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <CallNowButton />
    </div>
  );
}
