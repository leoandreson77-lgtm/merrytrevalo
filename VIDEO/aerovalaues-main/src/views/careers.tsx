import { Layout } from "@/components/layout";
import { Briefcase, MapPin, Clock, Heart } from "lucide-react";

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-Time",
    description:
      "Build and scale our flight search platform. You'll work on React/TypeScript frontend, Node.js backend, and Amadeus GDS integrations.",
    requirements: [
      "5+ years with React, TypeScript, Node.js",
      "Experience with REST APIs and third-party integrations",
      "Familiarity with cloud platforms (AWS/GCP)",
      "Strong communication and independent work ethic",
    ],
  },
  {
    title: "Customer Support Specialist",
    department: "Operations",
    location: "Remote (US / International)",
    type: "Full-Time",
    description:
      "Help our travelers resolve booking issues, cancellations, and general inquiries. You're the voice of Flightitude.com.",
    requirements: [
      "2+ years in customer support (travel industry a plus)",
      "Excellent written and verbal communication",
      "Ability to multitask in a fast-paced environment",
      "Fluency in English; additional languages are a bonus",
    ],
  },
  {
    title: "Airline Partnerships Manager",
    department: "Partnerships",
    location: "New York, NY or Remote",
    type: "Full-Time",
    description:
      "Negotiate and manage relationships with global airlines and GDS providers to expand our inventory and improve fare access.",
    requirements: [
      "Experience in airline/travel distribution or OTA partnerships",
      "Strong negotiation and relationship management skills",
      "Understanding of GDS systems (Amadeus, Sabre, or Travelport)",
      "Willingness to travel for partner meetings",
    ],
  },
  {
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-Time",
    description:
      "Design beautiful, intuitive interfaces that make booking flights effortless for millions of travelers.",
    requirements: [
      "3+ years in product/UI design",
      "Proficiency in Figma",
      "Portfolio demonstrating complex consumer-facing product design",
      "Experience designing for mobile-first responsive layouts",
    ],
  },
];

const benefits = [
  { icon: Heart, title: "Health & Wellness", desc: "Comprehensive medical, dental, and vision coverage for you and your family." },
  { icon: Briefcase, title: "Remote-First", desc: "Work from anywhere. We're a distributed team with async-first culture." },
  { icon: MapPin, title: "Travel Perks", desc: "Employee fare discounts and an annual travel stipend to explore the world." },
  { icon: Clock, title: "Flexible Hours", desc: "We care about output, not hours. Work when you're at your best." },
];

export function CareersPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
          Join the Flightitude.com Team
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We're building the future of flight search. If you're passionate about travel, technology,
          and great user experiences, we'd love to hear from you.
        </p>
      </section>

      {/* Benefits */}
      <section className="py-16 border-b px-4">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why Flightitude.com?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border rounded-2xl p-6 shadow-sm text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Open Positions</h2>
          <div className="space-y-6">
            {openings.map(({ title, department, location, type, description, requirements }) => (
              <div key={title} className="bg-white border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                        {department}
                      </span>
                      <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {location}
                      </span>
                      <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {type}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:support@flightitude.com?subject=Application: ${encodeURIComponent(title)}`}
                    className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Apply Now
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Requirements</p>
                  <ul className="space-y-1">
                    {requirements.map((r) => (
                      <li key={r} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-muted/40 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">Don't See a Fit?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're always looking for talented people. Send us your resume and we'll keep it on file.
            </p>
            <a
              href="mailto:support@flightitude.com?subject=General Application"
              className="inline-block bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors"
            >
              Send Open Application
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
