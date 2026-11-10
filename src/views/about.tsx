"use client";

import { Layout } from "@/components/layout";
import { Plane, Globe, ShieldCheck, Clock, Star, Users } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const stats = [
  { label: "Happy Travelers", value: "500,000+" },
  { label: "Destinations Covered", value: "150+" },
  { label: "Airline Partners", value: "300+" },
  { label: "Years of Service", value: "8+" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    description:
      "We show you real fares with no hidden fees. What you see is exactly what you pay.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Access flights to over 150 destinations worldwide across 300+ airline partners through the Amadeus global distribution system.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Our dedicated support team is available around the clock to assist you before, during, and after your trip.",
  },
  {
    icon: Star,
    title: "Best Price Guarantee",
    description:
      "We continuously scan fares to ensure you always get the most competitive price available in the market.",
  },
];

const team = [
  {
    name: "James Mitchell",
    role: "Chief Executive Officer",
    bio: "15+ years in travel technology and airline distribution. Former VP at a major OTA.",
  },
  {
    name: "Sarah Chen",
    role: "Chief Technology Officer",
    bio: "Architected flight search platforms processing millions of queries daily.",
  },
  {
    name: "David Patel",
    role: "Head of Customer Experience",
    bio: "Passionate about making air travel accessible and stress-free for everyone.",
  },
  {
    name: "Maria Lopez",
    role: "Director of Airline Partnerships",
    bio: "Built relationships with over 300 airlines across 6 continents.",
  },
];

export function AboutPage() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || siteConfig.brandName;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Plane className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            We Make Flying <span className="text-primary">Simple</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {brandName} was built with one mission — to make flight planning and booking as effortless as possible.
            We combine real-time airline data with a clean, fast interface so you can find the right flight
            and secure the lowest unpublished airfare in minutes.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-primary mb-1">{value}</p>
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-5">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At {brandName}, we believe everyone deserves access to affordable, reliable air travel.
                We started as a passionate team of travel specialists frustrated by
                confusing booking flows and hidden airline surcharges.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Today, we power flight searches for travelers across the United States and worldwide,
                connecting them directly with the best available fares from over 500 airlines.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether it's a domestic hop, a family vacation, or last-minute business travel — {brandName}
                has you covered with fast search, transparent pricing, and 24/7 human support.
              </p>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 flex flex-col gap-4">
              {["Real-time fares from 300+ airlines", "Enquiry confirmation by email", "USD pricing with no currency surprises", "Support via phone & email 7 days a week", "Round-trip & one-way flight search", "Multi-passenger requests (adults, children, infants)"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl border p-6 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Meet the Team</h2>
            <p className="text-muted-foreground">The aviation specialists behind {brandName} who make it all possible.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, bio }) => (
              <div key={name} className="bg-white border rounded-2xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{name}</h3>
                <p className="text-primary text-xs font-semibold mt-0.5 mb-3">{role}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Fly with {brandName}?</h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Search thousands of flights and secure your next low-fare airline ticket in minutes.
          </p>
          <a
            href="/"
            className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Search Flights
          </a>
        </div>
      </section>
    </Layout>
  );
}
