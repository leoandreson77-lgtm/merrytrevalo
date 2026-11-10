import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BookingPage } from "@/views/book";

export const metadata: Metadata = {
  title: "Complete Your Flight Booking",
  description: "Secure your flight reservation with JetWithFly Flights with 24/7 dedicated travel support.",
};

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">Loading booking details...</div>}>
      <BookingPage />
    </Suspense>
  );
}
