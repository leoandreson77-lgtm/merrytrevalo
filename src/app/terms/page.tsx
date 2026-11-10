import type { Metadata } from "next";
import { TermsOfServicePage } from "@/views/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for booking flight tickets and travel services on JetWithFly Flights.",
};

export default function Page() {
  return <TermsOfServicePage />;
}
