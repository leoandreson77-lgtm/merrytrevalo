"use client";
import React, { Suspense } from "react";
import { BookingPage } from "@/views/book";

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">Loading booking details...</div>}>
      <BookingPage />
    </Suspense>
  );
}
