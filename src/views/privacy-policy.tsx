"use client";

import { Layout } from "@/components/layout";
import { CompanyPhone } from "@/components/company-phone";
import { siteConfig } from "@/lib/site-config";

export function PrivacyPolicyPage() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || siteConfig.brandName;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || siteConfig.name;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              Welcome to {brandName} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), accessible at{" "}
              <a href={siteUrl} className="text-primary hover:underline">{siteUrl}</a>.
              We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our website and flight booking services.
            </p>
            <p className="mt-3">
              By using {siteName}, you agree to the collection and use of information in accordance with this policy.
              If you do not agree with the terms of this policy, please discontinue use of our site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Personal Identification:</strong> Full name, passport number, date of birth, nationality.</li>
              <li><strong>Contact Details:</strong> Email address, phone number, mailing address.</li>
              <li><strong>Booking Information:</strong> Flight selections, travel dates, passenger count, seat preferences, fare class.</li>
              <li><strong>Payment Information:</strong> We do not store full card details. Payments are processed through PCI-compliant third-party processors.</li>
              <li><strong>Communication Records:</strong> Emails, chat messages, or support tickets you send us.</li>
            </ul>
            <p className="mt-3">We also collect certain information automatically, including:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>IP address, browser type, and operating system.</li>
              <li>Referring website and pages visited.</li>
              <li>Time and date of your visit.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Process and manage your flight bookings and send confirmation receipts.</li>
              <li>Communicate with you regarding your itinerary, schedule changes, or cancellations.</li>
              <li>Provide customer support and respond to your requests.</li>
              <li>Detect and prevent fraud and improve our platform security.</li>
              <li>Comply with legal obligations and airline regulatory requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Information Sharing &amp; Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Airlines &amp; Travel Partners:</strong> To fulfill and confirm your flight reservation.</li>
              <li><strong>Payment Processors:</strong> To authorize and process payments securely.</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and user safety.</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>
              We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy,
              including legal, accounting, and reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (&ldquo;right to be forgotten&rdquo;).</li>
              <li><strong>Portability:</strong> Request transfer of your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing of your data for direct marketing purposes.</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent at any time where processing is consent-based.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">{siteConfig.supportEmail}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Security</h2>
            <p>
              We implement industry-standard security measures including TLS encryption for data in transit, encrypted
              storage for sensitive records, and access controls. However, no method of transmission over the Internet
              or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices
              of those sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal information
              from children under 13. If you believe we have inadvertently collected such information, please contact
              us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes by posting
              the new policy on this page with an updated date. You are advised to review this policy regularly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="mt-3 space-y-1">
              <li>Email: <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">{siteConfig.supportEmail}</a></li>
              <li>Website: <a href={siteUrl} className="text-primary hover:underline">{siteUrl}</a></li>
              <li>Phone: <CompanyPhone className="text-primary hover:underline" /></li>
            </ul>
          </section>

        </div>
      </div>
    </Layout>
  );
}
