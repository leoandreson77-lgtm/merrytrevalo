import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flight Search Scraper",
  robots: { index: false, follow: false },
};

export default function ScraperLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

