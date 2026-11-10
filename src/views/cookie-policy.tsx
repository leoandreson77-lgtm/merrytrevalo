"use client";

import { Layout } from "@/components/layout";
import { CompanyPhone } from "@/components/company-phone";
import { siteConfig } from "@/lib/site-config";

export function CookiePolicyPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device (computer, tablet, or mobile phone) when you visit
              a website. They are widely used to make websites work more efficiently, provide a better user experience,
              and give website owners information about how visitors interact with their site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Cookies</h2>
            <p>{siteConfig.name} uses cookies to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Keep your session active while you search and book flights.</li>
              <li>Remember your search preferences (origin, destination, dates, passengers) for a seamless experience.</li>
              <li>Measure site performance and understand how visitors use our pages.</li>
              <li>Prevent fraudulent activity and enhance security.</li>
              <li>Deliver relevant advertisements and promotions (only with your consent).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Types of Cookies We Use</h2>

            <div className="mt-4 space-y-4">
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-1">Strictly Necessary Cookies</h3>
                <p>
                  These are essential for the website to function. They enable core features like security, session
                  management, and booking flow. You cannot opt out of these cookies.
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-1">Performance &amp; Analytics Cookies</h3>
                <p>
                  These collect anonymous information about how visitors use our website, such as which pages are
                  most visited and how users navigate the site. We use this data to improve the site experience.
                  Examples: Google Analytics.
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-1">Functional Cookies</h3>
                <p>
                  These remember your preferences (e.g., language, currency, search filters) to personalize your
                  experience on return visits.
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-1">Targeting / Advertising Cookies</h3>
                <p>
                  These track your browsing activity to serve you relevant ads on other websites. They are only
                  placed with your consent.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. These third parties have
              their own privacy policies and cookie practices. We encourage you to review their policies separately.
              Examples of third-party services we use include Google Analytics and payment processors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Managing Cookies</h2>
            <p>
              You can control and manage cookies in several ways. Most browsers allow you to view, block, or
              delete cookies through their settings:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Chrome:</strong> Settings &rarr; Privacy and Security &rarr; Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data</li>
              <li><strong>Edge:</strong> Settings &rarr; Cookies and site permissions</li>
            </ul>
            <p className="mt-3">
              Please note that blocking or deleting cookies may affect your ability to use certain features of our
              website, such as saving search preferences or completing a booking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookie Retention</h2>
            <p>
              Session cookies are temporary and are deleted when you close your browser. Persistent cookies remain
              on your device until they expire or you delete them. The retention period varies by cookie type and
              purpose, generally ranging from a few days to 2 years.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or
              our data practices. We will post any changes on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact Us</h2>
            <p>For questions about our use of cookies:</p>
            <ul className="mt-3 space-y-1">
              <li>Email: <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">{siteConfig.supportEmail}</a></li>
              <li>Phone: <CompanyPhone className="text-primary hover:underline" /></li>
            </ul>
          </section>

        </div>
      </div>
    </Layout>
  );
}
