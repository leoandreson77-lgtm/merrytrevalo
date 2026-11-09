import { Layout } from "@/components/layout";
import { Phone, Mail, Clock, MapPin } from "lucide-react";

export function ContactPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-12 text-base">
          Have a question or need help with your travel request? Our support team is ready to assist you.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Get in Touch</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone Support</p>
                    <a href="tel:+18882566747" className="text-primary hover:underline text-sm block mt-0.5">
                      +1 888 256 6747
                    </a>
                    <a href="tel:+18554909708" className="text-primary hover:underline text-sm block mt-0.5">
                      +1 855 490 9708
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email Support</p>
                    <a href="mailto:support@flightitude.com" className="text-primary hover:underline text-sm mt-0.5 block">
                      support@flightitude.com
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">We typically respond within 2–4 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Support Hours</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Monday – Friday: 8:00 AM – 10:00 PM EST</p>
                    <p className="text-sm text-muted-foreground">Saturday – Sunday: 9:00 AM – 6:00 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Headquarters</p>
                    <p className="text-sm text-muted-foreground mt-0.5">United States</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "How do I cancel or modify my enquiry?",
                    a: "Contact our support team via phone or email with your enquiry reference. Cancellation policies depend on the airline's fare rules.",
                  },
                  {
                    q: "When will I receive my e-ticket?",
                    a: "Confirmation and next-step details are emailed within a few minutes of enquiry submission.",
                  },
                  {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit cards and debit cards. Payments are processed securely via PCI-compliant gateways.",
                  },
                  {
                    q: "Can I request flights for multiple passengers?",
                    a: "Yes. Our search supports adults, children, and infants. Select the passenger count before searching.",
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="bg-muted/40 rounded-lg p-4">
                    <p className="font-semibold text-sm text-foreground mb-1">{q}</p>
                    <p className="text-sm text-muted-foreground">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Send Us a Message</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                window.location.href = `mailto:support@flightitude.com?subject=${encodeURIComponent(
                  (data.get("subject") as string) || "Contact from website"
                )}&body=${encodeURIComponent(
                  `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
                )}`;
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1" htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Travel request, cancellation, etc."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1" htmlFor="message">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Describe your question or issue in detail..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Send Message
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Or email us directly at{" "}
                <a href="mailto:support@flightitude.com" className="text-primary hover:underline">
                  support@flightitude.com
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
