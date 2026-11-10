import type { Metadata } from "next";
import { CareersPage } from "@/views/careers";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the JetWithFly Flights team and build the future of flight discovery and travel.",
};

export default function Page() {
  return <CareersPage />;
}
