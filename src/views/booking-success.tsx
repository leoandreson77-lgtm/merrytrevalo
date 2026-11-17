"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/layout";
import { CheckCircle2, Mail, ClipboardList, RotateCcw, ShieldCheck, Phone, Copy, Check, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function formatPeriodTime(date: Date) {
  const hour = date.getHours();
  let period = "Night";
  if (hour >= 5 && hour < 12) period = "Morning";
  else if (hour >= 12 && hour < 17) period = "Afternoon";
  else if (hour >= 17 && hour < 21) period = "Evening";

  return `${period} ${format(date, "h:mm a")}`;
}

export function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get booking details from session storage
    const details = sessionStorage.getItem("lastBooking");
    if (details) {
      try {
        setBookingDetails(JSON.parse(details));
      } catch (e) {
        console.warn("Failed to parse lastBooking from sessionStorage:", e);
      }
    }
  }, []);

  const flight = bookingDetails?.flight;
  const urlBookingId = searchParams.get("bookingId");
  const urlDiscount = searchParams.get("discount");
  const urlAmount = searchParams.get("amount");
  const isPaymentSuccess = searchParams.get("payment") === "success";

  // Resolve official Booking ID
  const bookingId =
    urlBookingId ||
    bookingDetails?.bookingId ||
    bookingDetails?.bookingResponse?.bookingId ||
    bookingDetails?.inquiryId ||
    bookingDetails?.bookingResponse?.inquiryId ||
    "MT-784920";

  const discountPercent = urlDiscount ? Number(urlDiscount) : (bookingDetails?.discountPercent || 30);

  const originLabel = flight?.originName && flight.originName !== flight.origin
    ? `${flight.originName} (${flight.origin})`
    : flight?.origin || "JFK";
  const destinationLabel = flight?.destinationName && flight.destinationName !== flight.destination
    ? `${flight.destinationName} (${flight.destination})`
    : flight?.destination || "LAX";

  const departureDate = flight?.departureTime ? new Date(flight.departureTime) : new Date();
  const arrivalDate = flight?.arrivalTime ? new Date(flight.arrivalTime) : new Date(Date.now() + 14400000);
  const returnFlight = flight?.returnFlight;
  const returnDepartureDate = returnFlight?.departureTime ? new Date(returnFlight.departureTime) : null;
  const returnArrivalDate = returnFlight?.arrivalTime ? new Date(returnFlight.arrivalTime) : null;
  const returnOriginLabel = returnFlight
    ? returnFlight.originName && returnFlight.originName !== returnFlight.origin
      ? `${returnFlight.originName} (${returnFlight.origin})`
      : returnFlight.origin
    : "";
  const returnDestinationLabel = returnFlight
    ? returnFlight.destinationName && returnFlight.destinationName !== returnFlight.destination
      ? `${returnFlight.destinationName} (${returnFlight.destination})`
      : returnFlight.destination
    : "";

  const handleCopyBookingId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-emerald-50/60 via-slate-50 to-blue-50/40 min-h-screen overflow-x-hidden py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 animate-in zoom-in-75 duration-300" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Payment &amp; Booking Confirmed</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Booking Confirmed Successfully! ✈️
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600 max-w-lg mx-auto">
              Your flight reservation and payment have been securely recorded. Your e-ticket and itinerary receipt are being dispatched to your email.
            </p>
          </div>

          {/* ── Official Booking ID Showcase Card ── */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-blue-500/30 mb-6 sm:mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <span>Official Booking Reference ID</span>
                </p>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider break-all">
                    {bookingId}
                  </span>
                  <button
                    onClick={handleCopyBookingId}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all border border-white/20 shrink-0"
                    title="Copy Booking ID"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black">
                    <Tag className="w-3 h-3 shrink-0" />
                    <span>{discountPercent}% OFF Applied</span>
                  </span>
                  <p className="text-[11px] text-slate-300 mt-1">Special Discount Rate Locked</p>
                </div>
              )}
            </div>

            {urlAmount && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Amount Paid:</span>
                <span className="text-base font-black text-emerald-400">${urlAmount} USD</span>
              </div>
            )}
          </div>

          {/* What Happens Next Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-base mb-1 text-slate-900">Payment Secured</h3>
              <p className="text-xs text-slate-500">
                Payment verified with zero transaction fees
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-base mb-1 text-slate-900">Seat Blocked</h3>
              <p className="text-xs text-slate-500">
                Fare hold & seat selection locked for booking
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-base mb-1 text-slate-900">E-Ticket Delivery</h3>
              <p className="text-xs text-slate-500">
                Itinerary & PNR sent to your registered email
              </p>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm mb-8 space-y-6">
            <h2 className="text-xl font-black text-slate-900">Flight & Passenger Summary</h2>
            
            {/* Passenger Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passenger Information</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <p className="text-base font-bold text-slate-900">
                  {bookingDetails?.passengerName || "Confirmed Passenger"}
                </p>
                {bookingDetails?.email && (
                  <p className="text-xs text-slate-500 mt-0.5">Email: <span className="font-medium text-slate-800">{bookingDetails.email}</span></p>
                )}
                {bookingDetails?.phone && (
                  <p className="text-xs text-slate-500 mt-0.5">Phone: <span className="font-medium text-slate-800">{bookingDetails.phone}</span></p>
                )}
              </div>
            </div>

            {/* Flight Selected */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Itinerary</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-1.5">
                  <p className="text-base sm:text-lg font-black text-slate-900 break-words">
                    {originLabel} → {destinationLabel}
                  </p>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black shrink-0">
                    Confirmed
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  {flight?.airline || "Partner Airline"} {flight?.flightNumber || ""}
                </p>
                {departureDate && arrivalDate && (
                  <p className="text-slate-500 text-xs mt-1">
                    {formatPeriodTime(departureDate)} to {formatPeriodTime(arrivalDate)}
                  </p>
                )}

                {returnFlight && returnDepartureDate && returnArrivalDate && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Return Flight</p>
                    <p className="text-sm font-bold text-slate-800">{returnOriginLabel} → {returnDestinationLabel}</p>
                    <p className="text-slate-500 text-xs">
                      {formatPeriodTime(returnDepartureDate)} to {formatPeriodTime(returnArrivalDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Support Helpline Card */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 mb-8 text-center">
            <h3 className="text-sm sm:text-base font-bold text-emerald-950 mb-1 flex flex-wrap items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Need Immediate Assistance with Booking {bookingId}?</span>
            </h3>
            <p className="text-emerald-800 text-xs mb-4">Our ticketing desk is available 24/7 to answer questions.</p>
            
            <a
              href="tel:+18772518760"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 rounded-xl font-black text-sm sm:text-base shadow-md transition-all"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Call Live Desk: +1 (877) 251-8760</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push("/")}
              className="px-6 py-5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => router.push("/search")}
              variant="outline"
              className="px-6 py-5 text-sm font-bold rounded-xl border-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Search Another Flight
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
