import { Plane, Luggage, Info, ChevronDown, ChevronUp, Plus, Check, ShieldCheck, Wifi, Utensils, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import type { Flight } from "@shared/schema";

function AirlineLogo({ code, name }: { code?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const cleanCode = code ? String(code).trim().toUpperCase() : "";

  if (!cleanCode || failed) {
    return (
      <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-xs font-black text-blue-600 shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`https://pics.avs.io/70/70/${cleanCode}.png`}
      alt={name}
      onError={() => setFailed(true)}
      className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-1 shrink-0 shadow-sm"
    />
  );
}

interface FlightCardProps {
  flight: Flight & {
    airlineCode?: string;
    originName?: string;
    originCountryName?: string;
    destinationName?: string;
    destinationCountryName?: string;
    amenities?: string[];
    luggage?: string[];
    passengers?: number;
    packageType?: "solo" | "couple" | "family";
    tripType?: "oneway" | "round";
    returnFlight?: {
      airline?: string;
      airlineCode?: string;
      flightNumber?: string;
      origin: string;
      originName?: string;
      originCountryName?: string;
      destination: string;
      destinationName?: string;
      destinationCountryName?: string;
      departureTime: string | Date;
      arrivalTime: string | Date;
      duration: string;
      stops: number;
      layoverInfo?: string;
    };
    segments?: any[];
    layoverInfo?: string;
    travelClass?: string;
  };
}

function formatFullDateTime(dateInput: string | Date) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return { time: "--:--", dayDate: "--" };

    return {
      time: format(d, "hh:mm a"),
      dayDate: format(d, "EEE, dd MMM yyyy"),
    };
  } catch {
    return { time: "--:--", dayDate: "--" };
  }
}

export function FlightCard({ flight }: FlightCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [extraBagsCount, setExtraBagsCount] = useState(0); // 0, 1, 2 extra checked bags
  const extraBagFeePerUnit = 35; // $35 per extra checked bag

  const depDetails = formatFullDateTime(flight.departureTime);
  const arrDetails = formatFullDateTime(flight.arrivalTime);
  
  const returnDepDetails = flight.returnFlight ? formatFullDateTime(flight.returnFlight.departureTime) : null;
  const returnArrDetails = flight.returnFlight ? formatFullDateTime(flight.returnFlight.arrivalTime) : null;

  const originCode = (flight.origin || "JFK").toUpperCase();
  const destinationCode = (flight.destination || "MIA").toUpperCase();
  
  const originName = flight.originName || (originCode === "JFK" ? "Kennedy" : originCode === "LGA" ? "LaGuardia" : originCode === "EWR" ? "Newark" : originCode);
  const destinationName = flight.destinationName || (destinationCode === "MIA" ? "Miami Intl" : destinationCode === "AUS" ? "Bergstrom Intl" : destinationCode);

  const basePriceNum = Number(flight.price || 0) / 100 || 652.68;
  const totalPriceNum = basePriceNum + extraBagsCount * extraBagFeePerUnit;
  const formattedPrice = totalPriceNum.toFixed(2);

  const isRoundTrip = flight.tripType === "round" || !!flight.returnFlight;
  const travelClass = flight.travelClass || "Economy";

  // Flight numbers
  const flightNumber = flight.flightNumber ? (flight.flightNumber.startsWith(flight.airlineCode || "") ? flight.flightNumber : `${flight.airlineCode || "AA"} ${flight.flightNumber}`) : "AA 1479";
  const returnFlightNumber = flight.returnFlight?.flightNumber ? flight.returnFlight.flightNumber : "AA 944";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      
      {/* ── Top Header Bar: Price + Select & Details Buttons ── */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-500">USD$</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formattedPrice}</span>
            {extraBagsCount > 0 && (
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 ml-1">
                +${extraBagsCount * extraBagFeePerUnit} ({extraBagsCount} Extra Bag{extraBagsCount > 1 ? "s" : ""})
              </span>
            )}
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {isRoundTrip ? "Round trip per passenger (including taxes & fees)" : "One way per passenger (including taxes & fees)"}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Details Modal Trigger */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setDetailsOpen(true)}
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            Flight Details
          </Button>

          {/* Select CTA */}
          <Link
            href={`/book/${flight.id}?extraBags=${extraBagsCount}`}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all uppercase tracking-wide text-sm"
          >
            SELECT
          </Link>
        </div>
      </div>

      {/* ── Outbound / Depart Segment ── */}
      <div className="p-5">
        {/* Leg Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm sm:text-base">
            <Plane className="w-4 h-4 rotate-45" />
            <span>Depart , {depDetails.dayDate}</span>
          </div>
        </div>

        {/* Airline Info */}
        <div className="flex items-center gap-3 mb-4">
          <AirlineLogo code={flight.airlineCode} name={flight.airline || "American Airlines"} />
          <div>
            <h5 className="font-black text-slate-900 dark:text-white text-base leading-tight">{flight.airline || "American Airlines"}</h5>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Flight Number : <span className="font-bold text-slate-700 dark:text-slate-300">{flightNumber}</span> &nbsp;|&nbsp; Class: <span className="font-bold text-slate-700 dark:text-slate-300">{travelClass}</span>
            </p>
          </div>
        </div>

        {/* Route Times Grid */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-4 text-left">
          {/* Departure */}
          <div>
            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{depDetails.time}</p>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{originName} ({originCode})</p>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">{depDetails.dayDate}</p>
          </div>

          {/* Duration + Stops graphic */}
          <div className="px-1 sm:px-6 text-center flex flex-col items-center shrink-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 mb-0.5">{flight.duration || "3h 26m"}</span>
            <div className="w-12 sm:w-28 h-px bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute left-0" />
              <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 rotate-90 bg-white dark:bg-slate-900 px-0.5" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-0" />
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-600 dark:text-slate-400 mt-0.5 whitespace-nowrap">
              {flight.stops === 0 ? "Non Stop" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{arrDetails.time}</p>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{destinationName} ({destinationCode})</p>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">{arrDetails.dayDate}</p>
          </div>
        </div>

        {/* Layover banner if stops > 0 */}
        {flight.stops > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300 text-center">
            {flight.layoverInfo || `Change of plane required | Stopover of 1hr 15m in Connection Airport`}
          </div>
        )}
      </div>

      {/* ── Inbound / Return Segment (if Round Trip) ── */}
      {flight.returnFlight && returnDepDetails && returnArrDetails && (
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
          {/* Leg Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm sm:text-base">
              <Plane className="w-4 h-4 -rotate-45" />
              <span>Return , {returnDepDetails.dayDate}</span>
            </div>
          </div>

          {/* Airline Info */}
          <div className="flex items-center gap-3 mb-4">
            <AirlineLogo code={flight.returnFlight.airlineCode || flight.airlineCode} name={flight.returnFlight.airline || flight.airline || "American Airlines"} />
            <div>
              <h5 className="font-black text-slate-900 dark:text-white text-base leading-tight">{flight.returnFlight.airline || flight.airline || "American Airlines"}</h5>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Flight Number : <span className="font-bold text-slate-700 dark:text-slate-300">{returnFlightNumber}</span> &nbsp;|&nbsp; Class: <span className="font-bold text-slate-700 dark:text-slate-300">{travelClass}</span>
              </p>
            </div>
          </div>

          {/* Route Times Grid */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-4 text-left">
            {/* Departure */}
            <div>
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{returnDepDetails.time}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                {flight.returnFlight.originName || destinationName} ({flight.returnFlight.origin || destinationCode})
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">{returnDepDetails.dayDate}</p>
            </div>

            {/* Duration + Stops graphic */}
            <div className="px-1 sm:px-6 text-center flex flex-col items-center shrink-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 mb-0.5">{flight.returnFlight.duration || "3h 08m"}</span>
              <div className="w-12 sm:w-28 h-px bg-slate-300 dark:bg-slate-700 relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute left-0" />
                <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 rotate-90 bg-white dark:bg-slate-900 px-0.5" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-0" />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-600 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                {flight.returnFlight.stops === 0 ? "Non Stop" : `${flight.returnFlight.stops} Stop${flight.returnFlight.stops > 1 ? "s" : ""}`}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{returnArrDetails.time}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                {flight.returnFlight.destinationName || originName} ({flight.returnFlight.destination || originCode})
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">{returnArrDetails.dayDate}</p>
            </div>
          </div>

          {/* Layover banner if return stops > 0 */}
          {flight.returnFlight.stops > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300 text-center">
              {flight.returnFlight.layoverInfo || `Change of plane required | Stopover of 1hr 05m in Connection Airport`}
            </div>
          )}
        </div>
      )}

      {/* ── Baggage Allowance & Extra Baggage Options Row ── */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/20 space-y-2">
        {/* Baggage items with dimensions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">Baggage Policy:</span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full font-semibold text-slate-700 dark:text-slate-300">
              👜 Personal Item (40 x 30 x 15 cm) • <strong className="text-emerald-600">FREE</strong>
            </span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full font-semibold text-slate-700 dark:text-slate-300">
              🎒 Carry-on Bag (55 x 40 x 20 cm, 7kg) • <strong className="text-emerald-600">FREE</strong>
            </span>
          </div>

          {/* Add Extra Baggage Controller */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Add Extra Checked Bag (23kg):</span>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setExtraBagsCount((prev) => Math.max(0, prev - 1))}
                className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
              >
                −
              </button>
              <span className="w-6 text-center font-black text-xs text-blue-600">{extraBagsCount}</span>
              <button
                type="button"
                onClick={() => setExtraBagsCount((prev) => Math.min(2, prev + 1))}
                className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
              >
                +
              </button>
            </div>
            <span className="text-[11px] font-bold text-emerald-600">+$35/bag</span>
          </div>
        </div>
      </div>

      {/* ── Detailed Flight & Fare Modal ── */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              Flight Details & Fare Rules
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Complete flight itinerary, baggage specifications, and fare inclusions for {originCode} → {destinationCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 my-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Outbound Leg Details */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-extrabold text-blue-600 text-sm flex items-center gap-2">
                  <Plane className="w-4 h-4 rotate-45" /> Depart: {originName} ({originCode}) → {destinationName} ({destinationCode})
                </span>
                <span className="text-xs font-bold text-slate-500">{depDetails.dayDate}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Airline</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{flight.airline}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Flight No.</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{flightNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Cabin Class</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{travelClass}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Flight Duration</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{flight.duration || "3h 26m"}</p>
                </div>
              </div>
            </div>

            {/* Return Leg Details */}
            {flight.returnFlight && returnDepDetails && returnArrDetails && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="font-extrabold text-blue-600 text-sm flex items-center gap-2">
                    <Plane className="w-4 h-4 -rotate-45" /> Return: {destinationName} ({destinationCode}) → {originName} ({originCode})
                  </span>
                  <span className="text-xs font-bold text-slate-500">{returnDepDetails.dayDate}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium">Airline</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{flight.returnFlight.airline || flight.airline}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Flight No.</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{returnFlightNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Cabin Class</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{travelClass}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Flight Duration</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{flight.returnFlight.duration || "3h 08m"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Baggage Dimensions & Policy Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Luggage className="w-4 h-4 text-blue-600" />
                Baggage Size & Dimension Limits
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 p-1">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">👜 Personal Item (Underseat)</p>
                    <p className="text-slate-400 text-[11px]">Max size: 40 x 30 x 15 cm (fits under seat in front of you)</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">Included Free</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">🎒 Cabin Carry-on Bag</p>
                    <p className="text-slate-400 text-[11px]">Max size: 55 x 40 x 20 cm (Weight limit: 7 kg / 15 lbs)</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">Included Free</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">🧳 Checked Baggage (Hold)</p>
                    <p className="text-slate-400 text-[11px]">Max size: 158 cm total L+W+H (Weight limit: 23 kg / 50 lbs)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">${extraBagFeePerUnit}/bag</span>
                    <button
                      type="button"
                      onClick={() => setExtraBagsCount((prev) => (prev === 0 ? 1 : 0))}
                      className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                    >
                      {extraBagsCount > 0 ? "Added ✓" : "+ Add Bag"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Flight Amenities & Inclusions */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 block mb-2">✨ Included Amenities:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <Wifi className="w-3.5 h-3.5 text-blue-500" /> High-speed Wi-Fi
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> In-seat Power & USB
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Complimentary Snacks/Drinks
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> 24/7 Travel Assistance
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Fare with Selected Add-ons:</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">USD ${formattedPrice}</p>
            </div>
            <Link
              href={`/book/${flight.id}?extraBags=${extraBagsCount}`}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-blue-600/30 text-sm"
            >
              PROCEED TO BOOKING
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
