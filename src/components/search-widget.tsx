"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ArrowRightLeft,
  ChevronDown,
  Users,
  Search,
  Plane,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AirportAutocomplete } from "@/components/airport-autocomplete";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { resolveAirportSuggestion } from "@/lib/airport-resolver";

function extractIataCode(text: string) {
  const value = String(text || "").trim();
  const bracketMatch = value.match(/\(([A-Za-z]{3})\)$/);
  if (bracketMatch) return bracketMatch[1].toUpperCase();

  const plainMatch = value.match(/^([A-Za-z]{3})$/);
  if (plainMatch) return plainMatch[1].toUpperCase();

  return "";
}

// Popular US quick-route pills for instant 1-click query
const POPULAR_ROUTES = [
  { from: "JFK", fromLabel: "New York (JFK)", to: "MIA", toLabel: "Miami (MIA)" },
  { from: "LAX", fromLabel: "Los Angeles (LAX)", to: "JFK", toLabel: "New York (JFK)" },
  { from: "ORD", fromLabel: "Chicago (ORD)", to: "LAS", toLabel: "Las Vegas (LAS)" },
  { from: "SFO", fromLabel: "San Francisco (SFO)", to: "HNL", toLabel: "Honolulu (HNL)" },
  { from: "DFW", fromLabel: "Dallas (DFW)", to: "CUN", toLabel: "Cancun (CUN)" },
];

export function SearchWidget() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const search = searchParamsHook.toString() ? "?" + searchParamsHook.toString() : "";
  const searchParams = new URLSearchParams(search);
  const { toast } = useToast();

  const initialOrigin = searchParams.get("origin") || "";
  const initialDestination = searchParams.get("destination") || "";
  const initialTripType = (searchParams.get("tripType") as "round" | "oneway" | "multi") || "round";
  const initialDate = searchParams.get("date");
  const initialReturnDate = searchParams.get("returnDate");

  // Default to 7 days from now for departure if empty, 14 days for return
  const today = useMemo(() => new Date(), []);
  const defaultDeparture = useMemo(() => addDays(today, 7), [today]);
  const defaultReturn = useMemo(() => addDays(today, 14), [today]);

  const [tripType, setTripType] = useState<"round" | "oneway" | "multi">(initialTripType);
  const [origin, setOrigin] = useState(initialOrigin);
  const [originDisplay, setOriginDisplay] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [destinationDisplay, setDestinationDisplay] = useState(initialDestination);
  const [date, setDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : defaultDeparture
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialReturnDate ? new Date(initialReturnDate) : defaultReturn
  );

  // Popover controls
  const [departureOpen, setDepartureOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Travellers
  const [adults, setAdults] = useState(Math.max(Number(searchParams.get("passengers") || "1"), 1));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");
  const [selectedFare, setSelectedFare] = useState(searchParams.get("fareType") || "Regular");

  // Multi-City Legs
  const [multiLegs, setMultiLegs] = useState<
    { origin: string; originDisplay: string; destination: string; destinationDisplay: string; date: Date | undefined }[]
  >([
    { origin: initialOrigin, originDisplay: initialOrigin, destination: initialDestination, destinationDisplay: initialDestination, date: initialDate ? new Date(initialDate) : defaultDeparture },
    { origin: initialDestination, originDisplay: initialDestination, destination: "", destinationDisplay: "", date: undefined },
  ]);

  // Keep state in sync with URL search params changes
  useEffect(() => {
    const orig = searchParamsHook.get("origin");
    const dest = searchParamsHook.get("destination");
    const d = searchParamsHook.get("date");
    const retD = searchParamsHook.get("returnDate");
    const type = searchParamsHook.get("tripType");
    const fare = searchParamsHook.get("fareType");

    if (orig !== null && orig !== origin) {
      setOrigin(orig);
      setOriginDisplay(orig);
    }
    if (dest !== null && dest !== destination) {
      setDestination(dest);
      setDestinationDisplay(dest);
    }
    if (d) setDate(new Date(d));
    if (retD) setReturnDate(new Date(retD));
    if (type === "oneway" || type === "round" || type === "multi") setTripType(type);
    if (fare) setSelectedFare(fare);
  }, [searchParamsHook]);

  const totalTravellers = useMemo(
    () => Math.max(adults + children + infants, 1),
    [adults, children, infants],
  );

  const packageType: "solo" | "couple" | "family" = useMemo(() => {
    if (totalTravellers >= 4) return "family";
    if (totalTravellers === 2) return "couple";
    return "solo";
  }, [totalTravellers]);

  const updateCounter = (
    setter: Dispatch<SetStateAction<number>>,
    nextValue: number,
    min = 0,
    max = 9,
  ) => {
    setter(Math.min(Math.max(nextValue, min), max));
  };

  const handleSwapAirports = () => {
    setIsSwapping(true);
    const tempOrigin = origin;
    const tempOriginDisplay = originDisplay;
    setOrigin(destination);
    setOriginDisplay(destinationDisplay);
    setDestination(tempOrigin);
    setDestinationDisplay(tempOriginDisplay);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleQuickRouteSelect = (route: typeof POPULAR_ROUTES[0]) => {
    setOrigin(route.from);
    setOriginDisplay(route.fromLabel);
    setDestination(route.to);
    setDestinationDisplay(route.toLabel);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolveAirportCode = async (currentCode: string, currentDisplay: string) => {
      const trimmedDisplay = String(currentDisplay || "").trim();
      const parsedCode = currentCode || extractIataCode(trimmedDisplay);
      if (parsedCode) return parsedCode;

      const airport = await resolveAirportSuggestion(trimmedDisplay, "airport");
      return String(airport?.code || "").trim();
    };

    setIsSubmitting(true);

    try {
      let finalOrigin = await resolveAirportCode(origin, originDisplay);
      let finalDestination = await resolveAirportCode(destination, destinationDisplay);

      // Graceful fallback for demo or quick picks
      if (!finalOrigin && originDisplay) finalOrigin = originDisplay.slice(0, 3).toUpperCase();
      if (!finalDestination && destinationDisplay) finalDestination = destinationDisplay.slice(0, 3).toUpperCase();

      if (!finalOrigin || !finalDestination) {
        toast({
          title: "Select airports",
          description: "Please enter where you're flying from and where to.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (finalOrigin === finalDestination) {
        toast({
          title: "Invalid route",
          description: "Departure and arrival airports cannot be identical.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const departureDate = date || defaultDeparture;

      if (tripType === "round") {
        const retDate = returnDate || addDays(departureDate, 7);
        if (retDate < departureDate) {
          toast({
            title: "Invalid dates",
            description: "Return date must be after departure date.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const params = new URLSearchParams();
      params.append("origin", finalOrigin);
      params.append("destination", finalDestination);
      params.append("date", departureDate.toISOString().split("T")[0]);
      params.append("tripType", tripType);
      params.append("package", packageType);
      params.append("passengers", String(totalTravellers));
      params.append("adults", String(adults));
      params.append("children", String(children));
      params.append("infants", String(infants));
      params.append("travelClass", travelClass);
      params.append("fareType", selectedFare);

      if (tripType === "round" && returnDate) {
        params.append("returnDate", returnDate.toISOString().split("T")[0]);
      }

      if (tripType === "multi") {
        const defaultDateStr = departureDate.toISOString().split("T")[0];
        const legItems: string[] = [];
        for (let i = 0; i < multiLegs.length; i++) {
          const leg = multiLegs[i];
          const origCode = leg.origin || finalOrigin;
          const destCode = leg.destination || finalDestination;
          const legDate = leg.date ? leg.date.toISOString().split("T")[0] : defaultDateStr;
          legItems.push(origCode + "-" + destCode + "-" + legDate);
        }
        params.append("legs", legItems.join("|"));
      }

      const targetUrl = "/search?" + params.toString();
      router.push(targetUrl);
    } catch (err: any) {
      toast({
        title: "Search error",
        description: err?.message || "Could not execute flight search.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="search-flights" className="w-full max-w-6xl mx-auto -mt-20 sm:-mt-24 relative z-20 px-3 sm:px-4">
      {/* ── Main Container ── */}
      <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(2,132,199,0.22)] border border-slate-200/90 backdrop-blur-xl relative transition-all">
        
        {/* ── Top Header: Trip Type Tabs + Popular Routes ── */}
        <div className="bg-[#F5F8FC] px-4 sm:px-6 py-3.5 border-b border-slate-200/80 rounded-t-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Segmented Trip Type */}
            <div className="inline-flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl">
              {(["round", "oneway", "multi"] as const).map((type) => {
                const isActive = tripType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTripType(type);
                      if (type === "oneway") setReturnDate(undefined);
                      else if (type === "round" && !returnDate) setReturnDate(defaultReturn);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-md shadow-sky-500/25"
                        : "text-[#64748B] hover:text-[#0284C7]"
                    )}
                  >
                    {type === "round" ? "Round Trip" : type === "oneway" ? "One Way" : "Multi-City"}
                  </button>
                );
              })}
            </div>

            {/* Micro reassurance tag */}
            <div className="hidden md:flex items-center gap-2 text-xs text-[#64748B] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
              <span>Search 500+ Airlines &bull; Real-Time US Domestic Fares &bull; No Booking Fees</span>
            </div>
          </div>

          {/* Quick Route Suggestions Bar */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Popular Routes:
            </span>
            {POPULAR_ROUTES.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                type="button"
                onClick={() => handleQuickRouteSelect(route)}
                className="shrink-0 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#2676D9] text-[#172B46] font-semibold hover:text-[#2676D9] transition-all shadow-2xs cursor-pointer"
              >
                {route.from} ➔ {route.to}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/90">
            
            {/* Origin & Destination (5 cols) */}
            <div className="lg:col-span-5 relative grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
              
              {/* From */}
              <div className="p-4 hover:bg-[#F5F8FC]/60 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">Flying From</span>
                </div>
                <AirportAutocomplete
                  value={origin}
                  displayValue={originDisplay}
                  onChange={(code, display) => {
                    setOrigin(code);
                    setOriginDisplay(display);
                  }}
                  placeholder="Where from? (e.g. NYC, LAX)"
                  size="compact"
                />
              </div>

              {/* To */}
              <div className="p-4 hover:bg-[#F5F8FC]/60 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">Flying To</span>
                </div>
                <AirportAutocomplete
                  value={destination}
                  displayValue={destinationDisplay}
                  onChange={(code, display) => {
                    setDestination(code);
                    setDestinationDisplay(display);
                  }}
                  placeholder="Where to? (e.g. Miami, Las Vegas)"
                  size="compact"
                />
              </div>

              {/* Interactive Swap Button */}
              <button
                type="button"
                onClick={handleSwapAirports}
                aria-label="Swap Origin and Destination"
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border border-slate-300 text-[#102B4E] shadow-md hover:shadow-lg hover:border-[#2676D9] hover:text-[#2676D9] hover:scale-105 active:scale-95 flex items-center justify-center transition-all z-20 cursor-pointer",
                  isSwapping && "rotate-180"
                )}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Dates & Passengers (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90">
              
              {/* Departure Date */}
              <div className="p-4 hover:bg-[#F5F8FC]/60 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#2676D9]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">Departure</span>
                </div>
                <Popover open={departureOpen} onOpenChange={setDepartureOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-lg sm:text-xl font-black text-[#172B46] leading-tight">
                          {date ? format(date, "MMM dd") : "--"}
                        </div>
                        <div className="text-xs font-medium text-[#64748B]">
                          {date ? format(date, "EEEE, yyyy") : "Pick date"}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        setDepartureOpen(false);
                        if (tripType === "round") {
                          if (newDate && (!returnDate || returnDate < newDate)) {
                            setReturnDate(addDays(newDate, 7));
                          }
                          setTimeout(() => setReturnOpen(true), 150);
                        }
                      }}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return Date */}
              <div className={cn(
                "p-4 transition-colors",
                tripType === "oneway" ? "opacity-60 bg-slate-50/50" : "hover:bg-[#F5F8FC]/60"
              )}>
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#2676D9]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">Return</span>
                </div>
                {tripType === "oneway" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTripType("round");
                      setReturnDate(addDays(date || new Date(), 7));
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-100/70 cursor-pointer"
                  >
                    <div className="text-lg sm:text-xl font-bold text-slate-400 leading-tight">--</div>
                    <div className="text-xs font-bold text-[#2676D9]">+ Add Return Flight</div>
                  </button>
                ) : (
                  <Popover open={returnOpen} onOpenChange={setReturnOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-lg sm:text-xl font-black text-[#172B46] leading-tight">
                            {returnDate ? format(returnDate, "MMM dd") : "--"}
                          </div>
                          <div className="text-xs font-medium text-[#64748B]">
                            {returnDate ? format(returnDate, "EEEE, yyyy") : "Pick date"}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={(newDate) => {
                          setReturnDate(newDate);
                          setReturnOpen(false);
                        }}
                        disabled={(d) => date ? d < date : d < new Date()}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Travellers & Cabin Class */}
              <div className="p-4 hover:bg-[#F5F8FC]/60 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-[#2676D9]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">Travellers & Class</span>
                </div>
                <Popover open={travellersOpen} onOpenChange={setTravellersOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-lg sm:text-xl font-black text-[#172B46] leading-tight">
                          {totalTravellers} <span className="text-sm font-semibold text-[#64748B]">Passenger{totalTravellers > 1 ? "s" : ""}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#2676D9]">
                          {travelClass}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 space-y-4 z-[9999]" align="end">
                    <div className="font-bold text-sm text-[#172B46] pb-2 border-b border-slate-100">
                      Passengers
                    </div>

                    {/* Passenger Counters */}
                    <div className="space-y-3">
                      {[
                        { label: "Adults", desc: "12+ yrs", value: adults, min: 1, setter: setAdults },
                        { label: "Children", desc: "2–11 yrs", value: children, min: 0, setter: setChildren },
                        { label: "Infants", desc: "Under 2 yrs", value: infants, min: 0, setter: setInfants },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm text-[#172B46]">{item.label}</div>
                            <div className="text-xs text-[#64748B]">{item.desc}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateCounter(item.setter, item.value - 1, item.min)}
                              disabled={item.value <= item.min}
                              className="w-8 h-8 rounded-lg border border-slate-200 font-bold text-[#172B46] disabled:opacity-40 hover:bg-slate-100 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-bold text-sm text-[#172B46]">{item.value}</span>
                            <button
                              type="button"
                              onClick={() => updateCounter(item.setter, item.value + 1, item.min)}
                              disabled={item.value >= 9}
                              className="w-8 h-8 rounded-lg border border-slate-200 font-bold text-[#172B46] disabled:opacity-40 hover:bg-slate-100 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cabin Class Selection */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Cabin Class</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {["Economy", "Premium Economy", "Business", "First Class"].map((cls) => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setTravelClass(cls)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-colors",
                              travelClass === cls
                                ? "bg-[#102B4E] text-white shadow-xs"
                                : "bg-slate-100 text-[#172B46] hover:bg-slate-200"
                            )}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="w-full bg-[#2676D9] hover:bg-[#102B4E] text-white font-bold rounded-xl text-xs py-2 cursor-pointer"
                      onClick={() => setTravellersOpen(false)}
                    >
                      Done
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* ── Multi-City Additional Legs Manager ── */}
          {tripType === "multi" && (
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Multi-City Flight Itinerary</span>
                <span className="text-slate-400">Add up to 5 flight legs</span>
              </div>

              {multiLegs.map((leg, index) => (
                <div key={`leg-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 items-center">
                  <div className="md:col-span-1 text-xs font-extrabold text-slate-400">
                    Leg {index + 1}
                  </div>
                  <div className="md:col-span-4">
                    <AirportAutocomplete
                      value={leg.origin}
                      displayValue={leg.originDisplay}
                      onChange={(code, display) => {
                        const updated = [...multiLegs];
                        updated[index].origin = code;
                        updated[index].originDisplay = display;
                        setMultiLegs(updated);
                      }}
                      placeholder={`Leg ${index + 1} Origin`}
                      size="compact"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <AirportAutocomplete
                      value={leg.destination}
                      displayValue={leg.destinationDisplay}
                      onChange={(code, display) => {
                        const updated = [...multiLegs];
                        updated[index].destination = code;
                        updated[index].destinationDisplay = display;
                        setMultiLegs(updated);
                      }}
                      placeholder={`Leg ${index + 1} Destination`}
                      size="compact"
                    />
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-full justify-between rounded-xl font-bold text-xs">
                          <span>{leg.date ? format(leg.date, "dd MMM yyyy") : "Pick date"}</span>
                          <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[9999]" align="end">
                        <Calendar
                          mode="single"
                          selected={leg.date}
                          onSelect={(d) => {
                            const updated = [...multiLegs];
                            updated[index].date = d;
                            setMultiLegs(updated);
                          }}
                          initialFocus
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    {multiLegs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setMultiLegs(multiLegs.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 p-2 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {multiLegs.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    const lastDest = multiLegs[multiLegs.length - 1]?.destination || "";
                    const lastDestDisplay = multiLegs[multiLegs.length - 1]?.destinationDisplay || "";
                    setMultiLegs([
                      ...multiLegs,
                      { origin: lastDest, originDisplay: lastDestDisplay, destination: "", destinationDisplay: "", date: undefined }
                    ]);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  + Add Another Leg
                </button>
              )}
            </div>
          )}

          {/* ── Bottom Action Bar: Special Fares & Search CTA ── */}
          <div className="border-t border-slate-200/90 bg-[#F5F8FC]/80 px-4 sm:px-6 py-4 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Special Fares */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#64748B] mr-1">
                  Special Fares:
                </span>
                {["Regular", "Student", "Senior", "Military"].map((fare) => (
                  <button
                    key={fare}
                    type="button"
                    onClick={() => setSelectedFare(fare)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                      selectedFare === fare
                        ? "bg-[#0284C7] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-[#172B46] hover:border-[#0284C7]"
                    )}
                  >
                    {fare}
                  </button>
                ))}
              </div>

              {/* Submit CTA Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-[#0284C7] via-[#2563EB] to-[#1D4ED8] hover:from-[#0369A1] hover:to-[#1E40AF] text-white font-black text-base px-10 py-6 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Searching Available Flights...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>SEARCH FLIGHTS</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
