import { Link } from "wouter";
import { Plane, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";


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
            <a href="tel:+18882566747" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all font-semibold text-sm">
              <Phone className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">+1 888 256 6747</span>
              <span className="sm:hidden">Call Now</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Floating TFN Button - Right Side */}
      <a
        href="tel:+18882566747"
        className="fixed right-4 bottom-6 z-50 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-2xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 font-bold text-sm group"
        aria-label="Call us now"
      >
        <Phone className="w-5 h-5 animate-bounce group-hover:animate-none" />
        <span className="hidden md:inline">📞 +1 888 256 6747</span>
        <span className="md:hidden">Call Us</span>
      </a>

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
                <li><a href="tel:+18882566747" className="hover:text-primary">+1 888 256 6747</a></li>
                <li><a href="tel:+18554909708" className="hover:text-primary">+1 855 490 9708</a></li>
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
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Flightitude.com. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

