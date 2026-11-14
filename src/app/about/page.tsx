import type { Metadata } from "next";
import { AboutPage } from "@/views/about";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about MerryTravelo Flights, our mission, 24/7 dedicated flight booking experts, and how we compare 500+ airlines to find the lowest airfares.",
};

export default function Page() {
  return <AboutPage />;
}
