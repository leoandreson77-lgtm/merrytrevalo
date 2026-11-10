import { Layout } from "@/components/layout";

export function TermsOfServicePage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the JetWithFly.com website and booking services ("Service"), you agree to be bound
              by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              These Terms constitute a legally binding agreement between you and JetWithFly.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Use of Service</h2>
            <p>You agree to use JetWithFly.com only for lawful purposes. You must not:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Use the Service to make fraudulent or speculative bookings.</li>
              <li>Provide false, inaccurate, or misleading information during booking.</li>
              <li>Attempt to gain unauthorized access to our systems or another user's account.</li>
              <li>Scrape, crawl, or systematically extract data from JetWithFly.com without written permission.</li>
              <li>Use the Service in any way that violates applicable local, national, or international law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Booking &amp; Reservations</h2>
            <p>
              JetWithFly.com acts as an intermediary between you and airlines. When you submit a booking inquiry,
              you are requesting our team to secure the specific flight on your behalf.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>All bookings are subject to availability at the time of confirmation.</li>
              <li>Fares displayed are in USD and may fluctuate until payment is confirmed.</li>
              <li>You are responsible for ensuring that all passenger names and travel documents are accurate.</li>
              <li>We reserve the right to cancel bookings that contain errors or fraudulent information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Payments</h2>
            <p>
              Payment for flight bookings is processed securely through our payment partners. By providing payment
              information, you authorize us to charge the total fare amount. JetWithFly.com does not store full payment
              card details on our servers.
            </p>
            <p className="mt-3">
              In the event of a pricing error, we reserve the right to cancel the booking and offer a full refund.
              We will notify you promptly if such a situation arises.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Cancellations &amp; Refunds</h2>
            <p>
              Cancellation and refund policies are governed by the airline's fare rules at the time of booking.
              JetWithFly.com will facilitate cancellation requests but cannot guarantee refunds for non-refundable fares.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Refundable tickets may be cancelled within the airline's specified window for a full or partial refund.</li>
              <li>Non-refundable tickets are not eligible for cash refunds but may qualify for airline credit.</li>
              <li>Service fees charged by JetWithFly.com are non-refundable.</li>
              <li>To initiate a cancellation, contact us at <a href="mailto:support@jetwithfly.com" className="text-primary hover:underline">support@jetwithfly.com</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Travel Documents &amp; Responsibility</h2>
            <p>
              You are solely responsible for ensuring that all passengers hold valid travel documents, including
              passports, visas, and health requirements, for all destinations on their itinerary. JetWithFly.com is not
              liable for denied boarding or entry due to improper documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Intellectual Property</h2>
            <p>
              All content on the JetWithFly.com website, including text, graphics, logos, and software, is the exclusive
              property of JetWithFly.com and is protected by applicable intellectual property laws. You may not reproduce,
              distribute, or create derivative works without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either
              express or implied. JetWithFly.com does not warrant that the Service will be uninterrupted, error-free,
              or free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, JetWithFly.com shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of, or inability to use, the Service.
              Our total liability to you for any claim shall not exceed the amount paid by you for the specific
              booking giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts
              located in the United States.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective upon posting to
              our website. Your continued use of the Service after any changes constitutes your acceptance of the
              new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Contact Us</h2>
            <p>For questions about these Terms, please reach out:</p>
            <ul className="mt-3 space-y-1">
              <li>Email: <a href="mailto:support@jetwithfly.com" className="text-primary hover:underline">support@jetwithfly.com</a></li>
              <li>Phone: <a href="tel:+18773717356" className="text-primary hover:underline">+1 877 371 7356</a></li>
              <li>Phone: <a href="tel:+18554909708" className="text-primary hover:underline">+1 855 490 9708</a></li>
            </ul>
          </section>

        </div>
      </div>
    </Layout>
  );
}
