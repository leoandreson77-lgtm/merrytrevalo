import Link from "next/link";
import { Plane } from "lucide-react";
import { CallNowButton } from "@/components/call-now-button";
import { CompanyPhone } from "@/components/company-phone";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <img src="/logo.png" alt="Flightitude" className="h-10 sm:h-11 w-auto object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors cursor-pointer">Flights</Link>
            <Link href="/about" className="hover:text-primary transition-colors cursor-pointer">About</Link>
            <Link href="/contact" className="hover:text-primary transition-colors cursor-pointer">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:+18882566747" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-full shadow-md hover:shadow-green-600/30 transition-all font-bold text-sm">
              <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <span className="hidden sm:inline">+1 888 256 6747</span>
              <span className="sm:hidden">Call Now</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Flightitude" className="h-9 w-auto object-contain" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Search flights and submit enquiries with a clean, guided flow.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">About Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">Our Story</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><CompanyPhone className="hover:text-primary" /></li>
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground space-y-4">
            <p className="max-w-4xl mx-auto leading-relaxed">
              Disclaimer: Flightitude.com is an independent travel portal and is not directly affiliated with Delta Air Lines, American Airlines, or any other airline. All brand names, trademarks, logos, and service marks are the property of their respective owners.
            </p>
            <p>
              © {new Date().getFullYear()} Flightitude.com. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <CallNowButton />
    </div>
  );
}
