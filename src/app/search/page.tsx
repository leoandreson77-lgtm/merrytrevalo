"use client";
import React, { Suspense } from "react";
import { SearchResultsPage } from "@/views/search-results";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">Loading search results...</div>}>
      <SearchResultsPage />
    </Suspense>
  );
}
