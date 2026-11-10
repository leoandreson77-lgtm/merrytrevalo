"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useFlight, useCreateBooking } from "@/hooks/use-flights";
import { Layout } from "@/components/layout";
import { useState } from "react";
import { ArrowLeft, Plane, ShieldCheck, CheckCircle2, BriefcaseBusiness, Info, CreditCard, Lock, Phone, ArrowRight } from "lucide-react";
import { CompanyPhone } from "@/components/company-phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function formatPeriodTime(date: Date) {
  const hour = date.getHours();
  let period = "Night";
  if (hour >= 5 && hour < 12) period = "Morning";
  else if (hour >= 12 && hour < 17) period = "Afternoon";
  else if (hour >= 17 && hour < 21) period = "Evening";

  return `${period} ${format(date, "h:mm a")}`;
}

// ── Card Brand Logo Renderer ──
function CardBrandLogo({ type }: { type: string }) {
  switch (type) {
    case "visa":
      return (
        <div className="flex items-center bg-[#1A1F71] text-white px-2.5 py-1 rounded-md text-[11px] font-black tracking-widest shadow-sm border border-blue-900 animate-in fade-in zoom-in-95 duration-200">
          <span className="italic">VISA</span>
        </div>
      );
    case "mastercard":
      return (
        <div className="flex items-center bg-[#0A0E1A] px-2.5 py-1 rounded-md shadow-sm border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] -mr-1.5"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90"></div>
          <span className="text-[10px] font-extrabold text-white ml-1.5 hidden sm:inline">Mastercard</span>
        </div>
      );
    case "amex":
      return (
        <div className="bg-[#006FCF] text-white px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider shadow-sm border border-blue-600 animate-in fade-in zoom-in-95 duration-200">
          AMEX
        </div>
      );
    case "rupay":
      return (
        <div className="bg-[#032D6B] text-white px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider shadow-sm border border-emerald-600 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
          <span className="text-emerald-400">Ru</span><span className="text-orange-400">Pay</span>
        </div>
      );
    case "discover":
      return (
        <div className="bg-[#231F20] text-white px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider shadow-sm border border-amber-600 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-2 h-2 rounded-full bg-[#F9A01B]"></div>
          DISCOVER
        </div>
      );
    default:
      return null;
  }
}

// ── Luhn Algorithm Mod 10 Checksum ──
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// ── Card Network Brand Detector ──
function detectCardType(cardNumber: string): { type: string; label: string; badgeColor: string } {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) return { type: "visa", label: "Visa", badgeColor: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700" };
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return { type: "mastercard", label: "Mastercard", badgeColor: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700" };
  if (/^3[47]/.test(digits)) return { type: "amex", label: "Amex", badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-700" };
  if (/^(60|65|81|82|508)/.test(digits)) return { type: "rupay", label: "RuPay", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700" };
  if (/^(6011|65|64[4-9])/.test(digits)) return { type: "discover", label: "Discover", badgeColor: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700" };
  return { type: "unknown", label: "Card", badgeColor: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" };
}

// ── Format Card Number with Spaces ──
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  if (/^3[47]/.test(digits)) {
    // Amex 4-6-5 format
    const parts = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean);
    return parts.join(" ");
  }
  // Standard 4-4-4-4 format
  const parts = digits.match(/.{1,4}/g) || [];
  return parts.join(" ");
}

// ── Format Expiration Date MM/YY ──
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

// ── Individual Validation Functions ──
function validateCardholderName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Cardholder name is required";
  if (trimmed.length < 2) return "Cardholder name must be at least 2 characters";
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return null;
}

function validateCardNumber(cardNumber: string): string | null {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits) return "Card number is required";
  if (digits.length < 12) return "Card number must be at least 12 digits";
  if (digits.length > 19) return "Card number cannot exceed 19 digits";
  if (!luhnCheck(digits)) return "Invalid card number (checksum failed)";
  return null;
}

function validateCardExpiry(exp: string): string | null {
  const clean = exp.trim();
  if (!clean) return "Expiration date is required";
  if (!/^\d{2}\/\d{2}$/.test(clean)) return "Expiration date must be formatted as MM/YY";
  
  const [mmStr, yyStr] = clean.split("/");
  const month = parseInt(mmStr, 10);
  const year = 2000 + parseInt(yyStr, 10);
  
  if (isNaN(month) || month < 1 || month > 12) return "Invalid month (must be 01 to 12)";
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Card has expired";
  }
  if (year > currentYear + 25) {
    return "Invalid expiration year";
  }
  return null;
}

function validateCvv(cvv: string, cardType: string): string | null {
  const digits = cvv.replace(/\D/g, "");
  if (!digits) return "CVV security code is required";
  if (cardType === "amex") {
    if (digits.length !== 4) return "Amex CVV must be exactly 4 digits";
  } else {
    if (digits.length !== 3 && digits.length !== 4) return "CVV must be 3 digits (or 4 for Amex)";
  }
  return null;
}

export function BookingPage() {
  const { id } = useParams() as { id: string };
  const urlParams = useSearchParams();

  // Return flight data passed from search results page
  const urlTripType = urlParams.get("tripType") || undefined;
  const urlTotalPrice = urlParams.get("totalPrice");
  const urlReturnFlight = urlParams.get("rtAirline") ? {
    airline: urlParams.get("rtAirline")!,
    origin: urlParams.get("rtOrigin")!,
    destination: urlParams.get("rtDest")!,
    departureTime: urlParams.get("rtDep")!,
    arrivalTime: urlParams.get("rtArr")!,
    duration: urlParams.get("rtDur")!,
    stops: Number(urlParams.get("rtStops") || 0),
    price: Number(urlParams.get("rtPrice") || 0),
  } : null;

  const { data: flight, isLoading, error } = useFlight(id);
  const bookingMutation = useCreateBooking();

  const [formData, setFormData] = useState({
    passengerName: "",
    email: "",
    phone: "",
    bornOn: "",
    title: "mr",
    gender: "m",
    passportDetails: "",
    preferredContact: "email",
    cabinPreference: "",
    travelWindow: "",
    specialRequests: "",
    // Card & Payment details
    cardholderName: "",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
    billingZip: "",
    billingAddress: "",
  });

  const [cardErrors, setCardErrors] = useState<{
    cardholderName?: string | null;
    cardNumber?: string | null;
    cardExp?: string | null;
    cardCvv?: string | null;
  }>({});

  const [cardValidationNotice, setCardValidationNotice] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const hasEmail = formData.email.trim().length > 0;
  const hasPhone = formData.phone.trim().length > 0;
  const bookingSource = (flight as any)?.source === "duffel" ? "duffel" : "local";
  const duffelOfferId = (flight as any)?.duffel?.offerId || "";

  const detectedBrand = detectCardType(formData.cardNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight) return;

    // Validate all card fields on submission
    const nameErr = validateCardholderName(formData.cardholderName);
    const numErr = validateCardNumber(formData.cardNumber);
    const expErr = validateCardExpiry(formData.cardExp);
    const cvvErr = validateCvv(formData.cardCvv, detectedBrand.type);

    setCardErrors({
      cardholderName: nameErr,
      cardNumber: numErr,
      cardExp: expErr,
      cardCvv: cvvErr,
    });

    setTouchedFields({
      cardholderName: true,
      cardNumber: true,
      cardExp: true,
      cardCvv: true,
    });

    if (nameErr || numErr || expErr || cvvErr) {
      setCardValidationNotice(null);
      return; // Block submission if any card field is invalid!
    }

    // Display required format validation notice
    const successMsg = "Card details format validated successfully. Payment gateway is not connected yet.";
    setCardValidationNotice(successMsg);

    // SECURITY: Do NOT send card details (Number, CVV, Exp, Cardholder Name) to backend API
    bookingMutation.mutate({
      passengerName: formData.passengerName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      bornOn: formData.bornOn.trim(),
      title: formData.title.trim(),
      gender: formData.gender.trim(),
      passportDetails: formData.passportDetails.trim() || "P12345678",
      bookingSource,
      duffelOfferId,
      passengers: [
        {
          passengerName: formData.passengerName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          bornOn: formData.bornOn.trim(),
          title: formData.title.trim(),
          gender: formData.gender.trim(),
          passportDetails: formData.passportDetails.trim() || "P12345678",
        },
      ],
      preferredContact: formData.preferredContact,
      cabinPreference: formData.cabinPreference,
      travelWindow: formData.travelWindow.trim(),
      specialRequests: formData.specialRequests.trim(),
      flightId: String(id || flight.id || "1"),
      flight: {
        id: flight.id,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        originName: (flight as any)?.originName,
        destination: flight.destination,
        destinationName: (flight as any)?.destinationName,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        stops: flight.stops,
        tripType: (flight as any)?.tripType || urlTripType,
        packageType: (flight as any)?.packageType,
        passengers: (flight as any)?.passengers,
        returnDate: (flight as any)?.returnDate,
        returnFlight: (flight as any)?.returnFlight || urlReturnFlight,
        price: flight.price,
        amenities: (flight as any)?.amenities,
        luggage: (flight as any)?.luggage,
        source: (flight as any)?.source,
        duffel: (flight as any)?.duffel,
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Skeleton className="w-32 h-8 mb-8" />
          <div className="space-y-8">
            <Skeleton className="w-full h-96 rounded-2xl" />
            <Skeleton className="w-full h-96 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !flight) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl text-center flex flex-col items-center">
            {/* Background Glow Effects */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              ⚡ Special Unlisted Phone Fares Available
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-white leading-tight">
              Selected Online Flight Deal Expired or Sold Out!
            </h2>

            {/* Subtext */}
            <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg mb-8 font-medium leading-relaxed">
              Online airline inventories change dynamically. Don't worry — speak directly with our flight booking desk to lock in <strong className="text-yellow-400 font-bold">Unpublished Phone-Only Rates — Save up to 40% Off!</strong>
            </p>

            {/* Primary Call Buttons Container */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mb-8 z-10">
              <CompanyPhone
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-green-500/30 hover:scale-105 transition-all duration-200 border-2 border-white/20"
              >
                {(_raw, displayVal) => (
                  <>
                    <Phone className="w-6 h-6 animate-bounce" />
                    <span>Call Desk: {displayVal}</span>
                  </>
                )}
              </CompanyPhone>

              <Link
                href="/search"
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-base px-6 py-4 rounded-2xl border border-white/20 transition-all duration-200"
              >
                <span>Return to Search</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300 font-semibold pt-6 border-t border-white/10 w-full max-w-3xl">
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> 24/7 Live Desk Support
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Instant Ticket E-Dispatch
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Zero Booking Fee
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Best Price Guarantee
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const formattedPrice = formatUsd(flight.price / 100);

  const totalFormattedPrice = urlTotalPrice
    ? formatUsd(Number(urlTotalPrice) / 100)
    : formattedPrice;

  const amenities = Array.isArray((flight as any)?.amenities) ? (flight as any).amenities : [];
  const luggage = Array.isArray((flight as any)?.luggage) ? (flight as any).luggage : [];
  const departureDate = new Date(flight.departureTime);
  const arrivalDate = new Date(flight.arrivalTime);
  // Use returnFlight from the fetched flight, or fall back to URL-passed data
  const returnFlight = (flight as any)?.returnFlight || urlReturnFlight;
  const returnDepartureDate = returnFlight?.departureTime ? new Date(returnFlight.departureTime) : null;
  const returnArrivalDate = returnFlight?.arrivalTime ? new Date(returnFlight.arrivalTime) : null;
  // Determine trip type: from flight data, or from URL param
  const isRoundTrip = (flight as any)?.tripType === "round" || urlTripType === "round" || !!returnFlight;
  const rawDestination = (flight?.destination === flight?.origin && returnFlight?.origin)
    ? returnFlight.origin
    : flight?.destination;
  const originLabel = (flight as any)?.originName && (flight as any).originName !== flight.origin
    ? `${(flight as any).originName} (${flight.origin})`
    : flight.origin;
  const destinationLabel = (flight as any)?.destinationName && (flight as any).destinationName !== rawDestination
    ? `${(flight as any).destinationName} (${rawDestination})`
    : rawDestination;
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
  const packageLabel = (flight as any)?.packageType
    ? `${(flight as any).packageType.charAt(0).toUpperCase()}${(flight as any).packageType.slice(1)} Package`
    : "Solo Package";
  const passengerCount = Number((flight as any)?.passengers || 1);
  const inquiryPoints = [
    amenities.length ? `${amenities.length} amenity options` : null,
    luggage.length ? `${luggage.length} baggage details` : null,
    returnFlight ? "return leg included" : null,
    passengerCount > 1 ? `${passengerCount} travellers` : "1 traveller",
  ].filter(Boolean) as string[];

  return (
    <Layout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_25%),linear-gradient(to_bottom,_rgba(248,250,252,1),_rgba(255,255,255,1))]">
        <div className="max-w-7xl mx-auto px-4 py-10 lg:py-14">
        <Link href="/search" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to results
        </Link>

        <div className="mb-8 lg:mb-10 grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6 lg:gap-8 items-stretch">
          <div className="rounded-[2rem] border border-border bg-card/95 backdrop-blur shadow-xl shadow-slate-200/50 p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-2">Flight enquiry</p>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">Request a tailored quote</h1>
                <p className="text-muted-foreground mt-3 max-w-2xl">
                  Share your traveller details and preferences. We’ll collect the request and prepare it for follow-up instead of placing a booking immediately.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("text-sm font-bold px-3 py-1 rounded-full border", isRoundTrip ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
                  {isRoundTrip ? "↔ Round Trip" : "→ One Way"}
                </span>
                <span className="text-sm font-semibold px-3 py-1 rounded-full border bg-muted text-foreground border-border">{packageLabel}</span>
                <span className="text-sm font-semibold px-3 py-1 rounded-full border bg-muted text-foreground border-border">{passengerCount} Traveller{passengerCount > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
              {inquiryPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-border bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700">
                  {point}
                </div>
              ))}
            </div>

            {/* Route Map */}
            <div className="mb-8 p-6 bg-gradient-to-br from-slate-50 to-sky-50 rounded-2xl border border-slate-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left flex-1">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Departure</p>
                  <p className="text-xl font-bold text-primary">{originLabel}</p>
                  <p className="text-muted-foreground mt-2">{format(departureDate, "EEE, MMM dd, yyyy")}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatPeriodTime(departureDate)}</p>
                </div>

                <div className="flex flex-col items-center my-6 md:my-0 flex-1">
                  <div className="w-full h-px bg-border relative mb-4 hidden md:block">
                    <Plane className="w-5 h-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-card p-0.5 rounded" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">
                    {flight.stops === 0 ? "✈️ Direct Flight" : `🛑 ${flight.stops} Stop (${(flight as any).layoverInfo || "Layover Connection"})`}
                  </p>
                </div>

                <div className="text-center md:text-right flex-1">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Arrival</p>
                  <p className="text-xl font-bold text-primary">{destinationLabel}</p>
                  <p className="text-muted-foreground mt-2">{format(arrivalDate, "EEE, MMM dd, yyyy")}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatPeriodTime(arrivalDate)}</p>
                </div>
              </div>
            </div>

            {returnFlight && returnDepartureDate && returnArrivalDate && (
              <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-4">Return Flight</p>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left flex-1">
                    <p className="text-sm text-muted-foreground font-medium mb-2">Departure</p>
                    <p className="text-xl font-bold text-primary">{returnOriginLabel}</p>
                    <p className="text-muted-foreground mt-2">{format(returnDepartureDate, "EEE, MMM dd, yyyy")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{formatPeriodTime(returnDepartureDate)}</p>
                  </div>

                  <div className="flex flex-col items-center my-6 md:my-0 flex-1">
                    <div className="w-full h-px bg-border relative mb-4 hidden md:block">
                      <Plane className="w-5 h-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-card p-0.5 rounded" />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-2">
                      {returnFlight.stops === 0 ? "✈️ Direct Flight" : `🛑 ${returnFlight.stops} Stop (${(returnFlight as any).layoverInfo || "Layover Connection"})`}
                    </p>
                  </div>

                  <div className="text-center md:text-right flex-1">
                    <p className="text-sm text-muted-foreground font-medium mb-2">Arrival</p>
                    <p className="text-xl font-bold text-primary">{returnDestinationLabel}</p>
                    <p className="text-muted-foreground mt-2">{format(returnArrivalDate, "EEE, MMM dd, yyyy")}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{formatPeriodTime(returnArrivalDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {!returnFlight && isRoundTrip && (
              <div className="mb-8 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
                Round Trip selected, but return leg details are not available in this fare result.
              </div>
            )}

            {/* Airline & Flight Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-background rounded-2xl border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-2">Airline</p>
                <p className="text-xl font-bold text-foreground">{flight.airline}</p>
              </div>
              <div className="p-4 bg-background rounded-2xl border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-2">Flight Number</p>
                <p className="text-xl font-bold text-foreground">{flight.flightNumber}</p>
              </div>
            </div>

            {/* Amenities Section */}
            {amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Amenities Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {amenities.map((amenity: string, index: number) => (
                    <div key={`amenity-${index}-${amenity}`} className="p-3 bg-muted rounded-lg border border-border flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Luggage Section */}
            {luggage.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BriefcaseBusiness className="w-5 h-5 text-primary" />
                  Baggage Allowance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {luggage.map((item: string, index: number) => (
                    <div key={`luggage-${index}-${item}`} className="p-4 bg-muted rounded-lg border border-border">
                      <p className="text-sm font-medium text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Summary */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-cyan-50 rounded-2xl border border-primary/15 mt-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">Outbound Fare</span>
                <span className="font-medium">{formattedPrice}</span>
              </div>
              {isRoundTrip && urlReturnFlight && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">Return Fare</span>
                  <span className="font-medium">{formatUsd(Number(urlReturnFlight.price || 0) / 100)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="font-medium text-green-600">Included</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Estimated Quote</span>
                <span className="text-2xl font-extrabold text-primary">
                  {urlTotalPrice ? formatUsd(Number(urlTotalPrice) / 100) : formattedPrice}
                </span>
              </div>
            </div>
          </div>

          <div className="xl:sticky xl:top-8 space-y-6 self-start">
            <div className="rounded-[2rem] border border-border bg-card shadow-xl shadow-slate-200/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-2">Inquiry summary</p>
              <h2 className="text-2xl font-bold mb-3">Tell us how to reach you</h2>
              <p className="text-sm text-muted-foreground mb-6">
                No payment is taken here. This form captures the request so the team can review the trip and follow up.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Route</span><span className="font-medium text-right">{originLabel} → {destinationLabel}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Trip type</span><span className="font-medium">{isRoundTrip ? "Round trip" : "One way"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Travellers</span><span className="font-medium">{passengerCount}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Fare estimate</span><span className="font-medium">{urlTotalPrice ? formatUsd(Number(urlTotalPrice) / 100) : formattedPrice}</span></div>
              </div>
              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                Add traveller details, contact preference, and special requests below. We’ll save it as a quote request.
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card shadow-xl shadow-slate-200/40 p-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Passenger enquiry details</h1>
            <p className="text-muted-foreground">Capture the traveller data needed to prepare a follow-up quote.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Passenger Details</h3>
                <p className="text-sm text-muted-foreground">Use passport-accurate details for future ticketing.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="passengerName" className="font-semibold text-foreground">Full Name</Label>
                <Input id="passengerName" name="passengerName" placeholder="e.g. John Doe" required value={formData.passengerName} onChange={handleChange} className="h-12 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-foreground">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="e.g. john@example.com" required={!hasPhone} value={formData.email} onChange={handleChange} className="h-12 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone" className="font-semibold text-foreground">Phone Number</Label>
                  {formData.phone.length > 0 && (
                    <span className={`text-xs font-bold ${
                      formData.phone.replace(/\D/g, "").length >= 10 && !/^(\d)\1{9,}$/.test(formData.phone.replace(/\D/g, "")) ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {formData.phone.replace(/\D/g, "").length >= 10 && !/^(\d)\1{9,}$/.test(formData.phone.replace(/\D/g, "")) ? "✓ Valid Number" : "⚠️ Enter 10+ valid digits"}
                    </span>
                  )}
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  required={!hasEmail}
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-12 rounded-xl bg-background font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredContact" className="font-semibold text-foreground">Preferred Contact</Label>
                <Select value={formData.preferredContact} onValueChange={(value) => setFormData((prev) => ({ ...prev, preferredContact: value }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="Choose contact method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bornOn" className="font-semibold text-foreground">Date of Birth *</Label>
                <Input
                  id="bornOn"
                  name="bornOn"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  required
                  value={formData.bornOn}
                  onChange={handleChange}
                  className="h-12 rounded-xl bg-background font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold text-foreground">Title *</Label>
                <Select value={formData.title} onValueChange={(value) => setFormData((prev) => ({ ...prev, title: value }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="Choose title" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr</SelectItem>
                    <SelectItem value="mrs">Mrs</SelectItem>
                    <SelectItem value="ms">Ms</SelectItem>
                    <SelectItem value="dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="font-semibold text-foreground">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="Choose gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">Male</SelectItem>
                    <SelectItem value="f">Female</SelectItem>
                    <SelectItem value="x">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportDetails" className="font-semibold text-foreground">Passport Number</Label>
                <Input id="passportDetails" name="passportDetails" placeholder="A12345678" required value={formData.passportDetails} onChange={handleChange} className="h-12 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cabinPreference" className="font-semibold text-foreground">Cabin Preference</Label>
                <Select value={formData.cabinPreference} onValueChange={(value) => setFormData((prev) => ({ ...prev, cabinPreference: value }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="Choose cabin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium_economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specialRequests" className="font-semibold text-foreground">Special Requests</Label>
                <Textarea id="specialRequests" name="specialRequests" rows={3} placeholder="Meal preference, baggage notes, seating preference, or anything else we should know." value={formData.specialRequests} onChange={handleChange} className="rounded-xl bg-background resize-none" />
              </div>
            </div>

            {/* ── Payment & Card Details Section ── */}
            <div className="pt-6 border-t border-border space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Payment & Card Details</h3>
                    <p className="text-xs text-muted-foreground">Used to secure your booking & flight ticket guarantee.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted
                </div>
              </div>

              {/* Card Format Validation Success Notice */}
              {cardValidationNotice && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold leading-snug">{cardValidationNotice}</p>
                    <p className="text-xs opacity-90 mt-0.5">Your ticket inquiry has been submitted securely to our travel desk.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                {/* Cardholder Name */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cardholderName" className="font-semibold text-foreground text-xs uppercase tracking-wider">Cardholder Name *</Label>
                    {touchedFields.cardholderName && !cardErrors.cardholderName && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓ Valid Name</span>
                    )}
                  </div>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    placeholder="Name as printed on card"
                    required
                    value={formData.cardholderName}
                    onBlur={() => {
                      setTouchedFields((prev) => ({ ...prev, cardholderName: true }));
                      setCardErrors((prev) => ({ ...prev, cardholderName: validateCardholderName(formData.cardholderName) }));
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, cardholderName: val }));
                      if (touchedFields.cardholderName) {
                        setCardErrors((prev) => ({ ...prev, cardholderName: validateCardholderName(val) }));
                      }
                    }}
                    className={`h-12 rounded-xl bg-background font-semibold ${
                      touchedFields.cardholderName && cardErrors.cardholderName ? "border-red-500 ring-2 ring-red-500/20" : ""
                    }`}
                  />
                  {touchedFields.cardholderName && cardErrors.cardholderName && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                      ⚠️ {cardErrors.cardholderName}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cardNumber" className="font-semibold text-foreground text-xs uppercase tracking-wider">
                      Card Number *
                    </Label>
                    {touchedFields.cardNumber && !cardErrors.cardNumber ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓ Valid Card Number</span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">Visa, Mastercard, Amex, RuPay, Discover</span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 z-10" />
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="4111 1111 1111 1111"
                      required
                      maxLength={23}
                      value={formData.cardNumber}
                      onBlur={() => {
                        setTouchedFields((prev) => ({ ...prev, cardNumber: true }));
                        setCardErrors((prev) => ({ ...prev, cardNumber: validateCardNumber(formData.cardNumber) }));
                      }}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        setFormData((prev) => ({ ...prev, cardNumber: formatted }));
                        if (touchedFields.cardNumber) {
                          setCardErrors((prev) => ({ ...prev, cardNumber: validateCardNumber(formatted) }));
                        }
                      }}
                      className={`h-12 pl-11 pr-28 rounded-xl bg-background font-mono font-bold tracking-wider text-base ${
                        touchedFields.cardNumber && cardErrors.cardNumber ? "border-red-500 ring-2 ring-red-500/20" : ""
                      }`}
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none z-10">
                      {detectedBrand.type !== "unknown" && (
                        <CardBrandLogo type={detectedBrand.type} />
                      )}
                    </div>
                  </div>
                  {touchedFields.cardNumber && cardErrors.cardNumber && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                      ⚠️ {cardErrors.cardNumber}
                    </p>
                  )}
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cardExp" className="font-semibold text-foreground text-xs uppercase tracking-wider">Expiration Date *</Label>
                    {touchedFields.cardExp && !cardErrors.cardExp && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓ Valid Expiry</span>
                    )}
                  </div>
                  <Input
                    id="cardExp"
                    name="cardExp"
                    placeholder="MM/YY"
                    required
                    maxLength={5}
                    value={formData.cardExp}
                    onBlur={() => {
                      setTouchedFields((prev) => ({ ...prev, cardExp: true }));
                      setCardErrors((prev) => ({ ...prev, cardExp: validateCardExpiry(formData.cardExp) }));
                    }}
                    onChange={(e) => {
                      const formatted = formatExpiry(e.target.value);
                      setFormData((prev) => ({ ...prev, cardExp: formatted }));
                      if (touchedFields.cardExp) {
                        setCardErrors((prev) => ({ ...prev, cardExp: validateCardExpiry(formatted) }));
                      }
                    }}
                    className={`h-12 rounded-xl bg-background font-mono font-bold text-center text-sm ${
                      touchedFields.cardExp && cardErrors.cardExp ? "border-red-500 ring-2 ring-red-500/20 text-red-500" : ""
                    }`}
                  />
                  {touchedFields.cardExp && cardErrors.cardExp && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                      ⚠️ {cardErrors.cardExp}
                    </p>
                  )}
                </div>

                {/* CVV */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cardCvv" className="font-semibold text-foreground text-xs uppercase tracking-wider">
                      CVV / Security Code *
                    </Label>
                    {touchedFields.cardCvv && !cardErrors.cardCvv && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">✓ Valid CVV</span>
                    )}
                  </div>
                  <Input
                    id="cardCvv"
                    name="cardCvv"
                    type="password"
                    placeholder={detectedBrand.type === "amex" ? "4 digits" : "3 digits"}
                    required
                    maxLength={4}
                    value={formData.cardCvv}
                    onBlur={() => {
                      setTouchedFields((prev) => ({ ...prev, cardCvv: true }));
                      setCardErrors((prev) => ({ ...prev, cardCvv: validateCvv(formData.cardCvv, detectedBrand.type) }));
                    }}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setFormData((prev) => ({ ...prev, cardCvv: digits }));
                      if (touchedFields.cardCvv) {
                        setCardErrors((prev) => ({ ...prev, cardCvv: validateCvv(digits, detectedBrand.type) }));
                      }
                    }}
                    className={`h-12 rounded-xl bg-background font-mono font-bold text-center text-sm ${
                      touchedFields.cardCvv && cardErrors.cardCvv ? "border-red-500 ring-2 ring-red-500/20" : ""
                    }`}
                  />
                  {touchedFields.cardCvv && cardErrors.cardCvv && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                      ⚠️ {cardErrors.cardCvv}
                    </p>
                  )}
                </div>

                {/* Billing Zip Code */}
                <div className="space-y-2">
                  <Label htmlFor="billingZip" className="font-semibold text-foreground text-xs uppercase tracking-wider">Billing Zip / Postal Code</Label>
                  <Input
                    id="billingZip"
                    name="billingZip"
                    placeholder="e.g. 10001"
                    value={formData.billingZip}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-background font-semibold text-sm"
                  />
                </div>

                {/* Billing Address */}
                <div className="space-y-2">
                  <Label htmlFor="billingAddress" className="font-semibold text-foreground text-xs uppercase tracking-wider">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    name="billingAddress"
                    placeholder="Street Address, City, State"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-background text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                🔒 By completing this form, your ticket request & card details will be securely saved and forwarded to our travel desk to issue your flight itinerary.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-cyan-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? "Processing Payment & Request..." : `Complete Booking & Confirm • ${totalFormattedPrice}`}
            </Button>
          </form>
        </div>
        </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
