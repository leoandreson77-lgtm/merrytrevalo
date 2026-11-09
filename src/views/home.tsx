import { SearchWidget } from "@/components/search-widget";
import { Layout } from "@/components/layout";
import { Shield, CreditCard, Clock, Star } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function HomePage() {
  const rawBrand = process.env.NEXT_PUBLIC_BRAND_NAME || siteConfig.brandName;
  const brandName = (!rawBrand || rawBrand.toLowerCase().includes("skyswift")) ? "JetWithFly Flights" : rawBrand;
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden pt-16 pb-40" style={{ minHeight: 420 }}>
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://v.ftcdn.net/02/21/46/45/700_F_221464511_i2BmrjoVhnAWB4KFZqbNIut4a46H2gNa.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Brighter overlay so background stays visible while text remains readable */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-black/25 to-black/30" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-md">
            Discover the World <br/><span className="text-white/95">Without Limits</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto text-white/95 font-semibold drop-shadow-sm">
            Compare cheap flights from over 500 airlines and travel agents worldwide.
          </p>
        </div>
      </div>

      {/* Search Widget */}
      <div className="px-4">
        <SearchWidget />
      </div>

      {/* Trust & Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground">Why Book With {brandName}?</h2>
          <p className="text-muted-foreground mt-4">We make flight discovery and booking simple, seamless, and transparent.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Shield,
              title: "Secure Enquiries",
              desc: "Your details are protected with industry-leading encryption."
            },
            {
              icon: CreditCard,
              title: "Clear Pricing",
              desc: "See the full fare estimate before you submit the request."
            },
            {
              icon: Clock,
              title: "24/7 Support",
              desc: "Our travel experts are here to help with every enquiry."
            },
            {
              icon: Star,
              title: "Best Fare Guidance",
              desc: "We help you compare options before you commit."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-border/50 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
