"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { CheckCircle2, Mail, ClipboardList, RotateCcw, ShieldCheck, Phone } from "lucide-react";
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
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // Get booking details from session storage
    const details = sessionStorage.getItem("lastBooking");
    if (details) {
      setBookingDetails(JSON.parse(details));
    }
  }, []);

  const flight = bookingDetails?.flight;
  const inquiryId = bookingDetails?.inquiryId || bookingDetails?.bookingResponse?.inquiryId;
  const originLabel = flight?.originName && flight.originName !== flight.origin
    ? `${flight.originName} (${flight.origin})`
    : flight?.origin;
  const destinationLabel = flight?.destinationName && flight.destinationName !== flight.destination
    ? `${flight.destinationName} (${flight.destination})`
    : flight?.destination;
  const departureDate = flight?.departureTime ? new Date(flight.departureTime) : null;
  const arrivalDate = flight?.arrivalTime ? new Date(flight.arrivalTime) : null;
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

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground mb-3">Booking is under process! ✈️</h1>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 max-w-lg mx-auto">
              You will get updates on your email. Our travel team is processing your ticket and payment details.
            </p>
          </div>

          {/* What Happens Next Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Under Process</h3>
              <p className="text-sm text-muted-foreground">
                Your flight booking & fare hold are currently being processed
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Details Verified</h3>
              <p className="text-sm text-muted-foreground">
                Passenger & card details have been securely recorded
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Email Updates</h3>
              <p className="text-sm text-muted-foreground">
                Check your email inbox for confirmation & itinerary updates
              </p>
            </div>
          </div>

          {/* Booking Details Card */}
          {bookingDetails && (
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Booking & Itinerary Summary</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Passenger Information</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-lg font-bold text-foreground">{bookingDetails.passengerName}</p>
                    {bookingDetails.email ? (
                      <p className="text-sm text-muted-foreground">Email: {bookingDetails.email}</p>
                    ) : null}
                    {bookingDetails.phone ? (
                      <p className="text-sm text-muted-foreground">Phone: {bookingDetails.phone}</p>
                    ) : null}
                  </div>
                </div>

                {inquiryId ? (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Reference ID</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                      <p className="text-sm text-muted-foreground">Booking Ref: <span className="font-bold text-blue-600">{inquiryId}</span></p>
                    </div>
                  </div>
                ) : null}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Flight Selected</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-2xl font-bold text-foreground">
                        {originLabel} → {destinationLabel}
                      </p>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-extrabold">
                        Processing
                      </span>
                    </div>
                    <p className="text-muted-foreground font-semibold">{flight?.airline} {flight?.flightNumber}</p>
                    {departureDate && arrivalDate ? (
                      <p className="text-muted-foreground text-sm mt-1">
                        {formatPeriodTime(departureDate)} to {formatPeriodTime(arrivalDate)}
                      </p>
                    ) : null}

                    {returnFlight && returnDepartureDate && returnArrivalDate ? (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Return Flight</p>
                        <p className="text-foreground font-medium">{returnOriginLabel} → {returnDestinationLabel}</p>
                        <p className="text-muted-foreground text-sm">
                          {formatPeriodTime(returnDepartureDate)} to {formatPeriodTime(returnArrivalDate)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Duration</h3>
                    <p className="text-lg font-bold text-foreground">{bookingDetails.flight?.duration || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Stops</h3>
                    <p className="text-lg font-bold text-foreground">
                      {bookingDetails.flight?.stops === 0 ? 'Non Stop' : `${bookingDetails.flight?.stops} Stop${bookingDetails.flight?.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-4">📋 What Happens Next</h3>
            <ul className="space-y-3 text-blue-800 text-sm font-medium">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-extrabold flex-shrink-0">1</span>
                <span>Our travel desk is verifying your passenger and payment details.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-extrabold flex-shrink-0">2</span>
                <span>You will receive an automated confirmation email with your booking status.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-extrabold flex-shrink-0">3</span>
                <span>An agent will email your confirmed e-ticket and invoice.</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 mb-8">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-700" />
              Need Immediate Confirmation?
            </h3>
            <p className="text-emerald-800 text-sm mb-4">Our ticketing Desk is available 24/7 for instant assistance.</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a href="tel:+18555106415" className="text-center bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-all">
                <p className="text-xs uppercase font-bold text-emerald-100">Call Live Agent</p>
                <p className="text-xl font-black">+1 (855) 510-6415</p>
              </a>
              <div className="hidden sm:block w-px h-12 bg-emerald-300"></div>
              <div className="text-center">
                <p className="text-xs text-emerald-700 font-bold uppercase">Email Support</p>
                <p className="text-base font-bold text-emerald-900">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@merrytravelo.com"}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push("/")}
              className="px-8 py-6 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => router.push("/search")}
              variant="outline"
              className="px-8 py-6 text-lg font-bold rounded-xl border-2"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Search Another Flight
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
