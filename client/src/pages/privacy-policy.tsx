import { Layout } from "@/components/layout";

export function PrivacyPolicyPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: August 29, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              Welcome to Flightitude.com ("we," "our," or "us"), accessible at{" "}
              <a href="https://flightitude.com" className="text-primary hover:underline">https://flightitude.com</a>.
              We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our website and flight booking services.
            </p>
            <p className="mt-3">
              By using Flightitude.com, you agree to the collection and use of information in accordance with this policy.
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
              <li>Pages visited, time spent, referring URLs, and clickstream data.</li>
              <li>Cookies and similar tracking technologies (see our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Process and confirm flight bookings and inquiries.</li>
              <li>Send booking confirmation, itinerary updates, and e-tickets via email.</li>
              <li>Provide customer support and respond to your requests.</li>
              <li>Improve and personalize your experience on our platform.</li>
              <li>Send promotional offers and newsletters (only with your consent).</li>
              <li>Detect, prevent, and address fraud and security issues.</li>
              <li>Comply with legal obligations and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Sharing Your Information</h2>
            <p>We do not sell, trade, or rent your personal information. We may share your data with:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Airlines &amp; GDS Providers:</strong> To complete flight bookings on your behalf (e.g., Amadeus).</li>
              <li><strong>Payment Processors:</strong> With secure, PCI-compliant payment gateways for transaction processing.</li>
              <li><strong>Service Providers:</strong> Email delivery, analytics, and IT infrastructure providers under strict data processing agreements.</li>
              <li><strong>Legal Authorities:</strong> When required by law, court order, or government authority.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy,
              including compliance with legal, accounting, or reporting requirements. Booking records are typically
              retained for 7 years for tax and regulatory compliance. You may request deletion of your data at any
              time (subject to legal obligations).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Portability:</strong> Request transfer of your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing of your data for direct marketing purposes.</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent at any time where processing is consent-based.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:support@flightitude.com" className="text-primary hover:underline">support@flightitude.com</a>.
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
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Children's Privacy</h2>
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
              <li>Email: <a href="mailto:support@flightitude.com" className="text-primary hover:underline">support@flightitude.com</a></li>
              <li>Website: <a href="https://flightitude.com" className="text-primary hover:underline">https://flightitude.com</a></li>
              <li>Phone: <a href="tel:+18882566747" className="text-primary hover:underline">+1 888 256 6747</a></li>
              <li>Phone: <a href="tel:+18554909708" className="text-primary hover:underline">+1 855 490 9708</a></li>
            </ul>
          </section>

        </div>
      </div>
    </Layout>
  );
}
