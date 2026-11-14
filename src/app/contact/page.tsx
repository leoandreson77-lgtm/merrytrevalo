import type { Metadata } from "next";
import { ContactPage } from "@/views/contact";

export const metadata: Metadata = {
  title: "Contact & 24/7 Support",
  description: "Get in touch with MerryTravelo Flights 24/7 travel desk. Call +1 855 510 6415 or submit an inquiry for instant flight reservation assistance.",
};

export default function Page() {
  return <ContactPage />;
}
