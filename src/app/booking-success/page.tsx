import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BookingSuccessPage } from "@/views/booking-success";

export const metadata: Metadata = {
  title: "Booking Received Successfully",
  description: "Your flight booking enquiry has been received by MerryTravelo Flights.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">Loading booking confirmation...</div>}>
      <BookingSuccessPage />
    </Suspense>
  );
}
