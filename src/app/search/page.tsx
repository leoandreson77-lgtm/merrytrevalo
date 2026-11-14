import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResultsPage } from "@/views/search-results";

export const metadata: Metadata = {
  title: "Search Cheap Flights",
  description: "Search and compare real-time airline ticket prices across 500+ airlines with MerryTravelo Flights.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">Loading search results...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}
