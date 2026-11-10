import type { Metadata } from "next";
import { ContactPage } from "@/views/contact";

export const metadata: Metadata = {
  title: "Contact & 24/7 Support",
  description: "Get in touch with JetWithFly Flights 24/7 travel desk. Call +1 877 371 7356 or submit an inquiry for instant flight reservation assistance.",
};

export default function Page() {
  return <ContactPage />;
}
