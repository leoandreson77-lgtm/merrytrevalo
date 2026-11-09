import { useSearchFlights } from "@/hooks/use-flights";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/layout";
import { FlightCard } from "@/components/flight-card";
import { SearchWidget } from "@/components/search-widget";
import { CompanyPhone } from "@/components/company-phone";
import { CombinedFlightSearch } from "@/components/combined-flight-search";
// AirportSchedule removed per request
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Frown, Plane, Share2, Copy, Mail, MessageCircle, Sliders, X, Phone } from "lucide-react";
import FilterDrawer from "@/components/filter-drawer";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useMemo, useState, useEffect } from "react";

function AirlineLogo({ code, name }: { code?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!code || failed) {
    return <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{name.slice(0, 2).toUpperCase()}</div>;
  }
  return (
    <img
      src={`https://pics.avs.io/70/70/${code}.png`}
      alt={name}
      onError={() => setFailed(true)}
      className="w-8 h-8 rounded-full object-contain bg-white border border-border p-0.5 shrink-0"
    />
  );
}

type SearchFlight = {
  id: string | number;
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string | Date;
  arrivalTime: string | Date;
  duration: string;
  stops: number;
  price: number;
  returnFlight?: {
    airline?: string;
    airlineCode?: string;
    origin: string;
    destination: string;
    departureTime: string | Date;
    arrivalTime: string | Date;
    duration: string;
    stops: number;
  };
};

function inferAirlineCode(flight: Partial<SearchFlight>) {
  const direct = String((flight as any)?.airlineCode || "").trim().toUpperCase();
  if (/^[A-Z0-9]{2,3}$/.test(direct)) return direct;
  const flightNo = String(flight?.flightNumber || "").trim().toUpperCase();
  const match = flightNo.match(/^([A-Z0-9]{2,3})\s*\d/);
  return match ? match[1] : undefined;
}

function getTimeOfDay(date: string | Date): string {
  const d = new Date(date);
  const hour = d.getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatClock(value: string | Date) {
  return format(new Date(value), "HH:mm");
}

function formatUsdFromCents(cents: number) {
  if (!Number.isFinite(Number(cents))) return "Price unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format((Number(cents) || 0) / 100);
}

function SearchingEffect() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm">
      <div className="h-2 rounded-full bg-green-100 overflow-hidden mb-10">
        <motion.div
          className="h-full bg-green-500"
          initial={{ width: "15%" }}
          animate={{ width: ["25%", "75%", "45%", "90%"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Plane className="w-16 h-16 text-primary animate-pulse mb-6" />
        <h3 className="text-3xl font-extrabold text-foreground mb-2">
          Hold on, we’re fetching flights for you
        </h3>
        <p className="text-muted-foreground">Searching across airlines for the best fares...</p>
      </div>
    </div>
  );
}

interface ShareFlightModalProps {
  open: boolean;
  flight: any;
  onOpenChange: (open: boolean) => void;
}

function ShareFlightModal({ open, flight, onOpenChange }: ShareFlightModalProps) {
  if (!flight) return null;
  
  const shareText = `Check out this flight: ${flight.airline} ${flight.flightNumber} from ${flight.origin} to ${flight.destination} at ${formatUsdFromCents(flight.price)}/adult`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    alert("Flight details copied to clipboard!");
  };

  const handleEmail = () => {
    window.location.href = `mailto:?subject=Amazing Flight Deal&body=${encodeURIComponent(shareText)}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Flight</DialogTitle>
          <DialogDescription>Share the flight details with your friends</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Flight Details</p>
            <p className="text-sm text-muted-foreground">{shareText}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Copy className="w-5 h-5" />
              <span className="text-xs font-medium">Copy</span>
            </button>
            <button
              type="button"
              onClick={handleEmail}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="text-xs font-medium">Email</span>
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-medium">WhatsApp</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SearchResultsPage() {
  const searchParams = useSearchParams();
  
  const origin = searchParams.get("origin") || undefined;
  const destination = searchParams.get("destination") || undefined;
  const date = searchParams.get("date") || undefined;
  const returnDate = searchParams.get("returnDate") || undefined;
  const tripType = searchParams.get("tripType") || undefined;
  const packageType = searchParams.get("package") || undefined;
  const passengers = searchParams.get("passengers") || undefined;
  const adults = searchParams.get("adults") || undefined;
  const children = searchParams.get("children") || undefined;
  const infants = searchParams.get("infants") || undefined;
  const travelClass = searchParams.get("travelClass") || undefined;
  const hasSearchCriteria = Boolean(origin && destination && date);

  const { data: flights, isLoading, error } = useSearchFlights({
    origin,
    destination,
    date,
    returnDate,
    tripType,
    packageType,
    passengers,
    adults,
    children,
    infants,
    travelClass,
  });

  const fareFromUrl = searchParams.get("fareType") || "Regular";
  const [selectedFare, setSelectedFare] = useState(fareFromUrl);
  const [zeroCancellation, setZeroCancellation] = useState(false);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [selectedOnward, setSelectedOnward] = useState<string | number | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<string | number | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareFlight, setShareFlight] = useState<any>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showModifySearch, setShowModifySearch] = useState(!hasSearchCriteria);

  // Sync selectedFare with URL parameter updates
  useEffect(() => {
    const f = searchParams.get("fareType");
    if (f) setSelectedFare(f);
  }, [searchParams]);

  // Filter states
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(new Set());
  const [selectedStops, setSelectedStops] = useState<Set<number | string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [departureTimeRanges, setDepartureTimeRanges] = useState<Set<string>>(new Set());
  const [arrivalTimeRanges, setArrivalTimeRanges] = useState<Set<string>>(new Set());

  const typedFlights = (flights || []) as SearchFlight[];

  // Calculate special fare discount multiplier
  const fareDiscountMultiplier = useMemo(() => {
    const f = selectedFare.toLowerCase();
    if (f.includes("armed") || f.includes("forces")) return 0.85; // 15% Off
    if (f.includes("doctor") || f.includes("nurse")) return 0.85; // 15% Off
    if (f.includes("senior")) return 0.88; // 12% Off
    if (f.includes("student")) return 0.90; // 10% Off
    return 1.0; // Regular
  }, [selectedFare]);

  // Get unique airlines and stops for filter options
  const uniqueAirlines = useMemo(() => {
    const airlines = new Set(typedFlights.map((f) => f.airline));
    return Array.from(airlines).sort();
  }, [typedFlights]);

  const uniqueStops = useMemo(() => {
    const stops = new Set(typedFlights.map((f) => f.stops));
    return Array.from(stops).sort((a, b) => a - b);
  }, [typedFlights]);

  // Price stats computed in DOLLARS (not cents) to match Slider & Filter
  const priceStats = useMemo(() => {
    const dollars = typedFlights.map((f) => Math.round((f.price * fareDiscountMultiplier) / 100));
    return dollars.length
      ? { min: Math.min(...dollars), max: Math.max(...dollars) }
      : { min: 0, max: 5000 };
  }, [typedFlights, fareDiscountMultiplier]);

  // Auto-init price range from actual data when flights load
  useEffect(() => {
    if (typedFlights.length > 0) {
      setPriceRange([priceStats.min, priceStats.max]);
    }
  }, [priceStats.min, priceStats.max]);

  function toggleAirline(airline: string) {
    const updated = new Set(selectedAirlines);
    if (updated.has(airline)) updated.delete(airline);
    else updated.add(airline);
    setSelectedAirlines(updated);
  }

  function toggleStop(stop: number | string) {
    const updated = new Set(selectedStops);
    if (updated.has(stop)) updated.delete(stop);
    else updated.add(stop);
    setSelectedStops(updated);
  }

  function toggleDepartureTimeRange(label: string) {
    const updated = new Set(departureTimeRanges);
    if (updated.has(label)) updated.delete(label);
    else updated.add(label);
    setDepartureTimeRanges(updated);
  }

  function toggleArrivalTimeRange(label: string) {
    const updated = new Set(arrivalTimeRanges);
    if (updated.has(label)) updated.delete(label);
    else updated.add(label);
    setArrivalTimeRanges(updated);
  }

  function clearAllFilters() {
    setNonStopOnly(false);
    setSelectedAirlines(new Set());
    setSelectedStops(new Set());
    setPriceRange([priceStats.min, priceStats.max]);
    setDepartureTimeRanges(new Set());
    setArrivalTimeRanges(new Set());
  }

  // Main filters & special fare application
  const filteredFlights = useMemo(() => {
    if (!typedFlights.length) return [];
    return typedFlights
      .map((flight) => {
        const discountedPriceCents = Math.round(flight.price * fareDiscountMultiplier);
        return {
          ...flight,
          originalPrice: flight.price,
          price: discountedPriceCents,
          selectedFare,
          fareDiscountPercentage: Math.round((1 - fareDiscountMultiplier) * 100),
        };
      })
      .filter((flight) => {
        // Non-stop filter
        if (nonStopOnly && flight.stops !== 0) return false;
        
        // Airline filter
        if (selectedAirlines.size > 0 && !selectedAirlines.has(flight.airline)) return false;
        
        // Stops filter
        if (selectedStops.size > 0 && !selectedStops.has(flight.stops)) return false;
        
        // Price filter (in Dollars)
        const priceInDollars = Math.round(flight.price / 100);
        if (priceInDollars < priceRange[0] || priceInDollars > priceRange[1]) return false;
        
        // Departure time filter
        if (departureTimeRanges.size > 0) {
          const depTime = getTimeOfDay(flight.departureTime);
          if (!departureTimeRanges.has(depTime)) return false;
        }
        
        // Arrival time filter
        if (arrivalTimeRanges.size > 0) {
          const arrTime = getTimeOfDay(flight.arrivalTime);
          if (!arrivalTimeRanges.has(arrTime)) return false;
        }
        
        return true;
      });
  }, [typedFlights, fareDiscountMultiplier, selectedFare, nonStopOnly, selectedAirlines, selectedStops, priceRange, departureTimeRanges, arrivalTimeRanges]);

  const onwardOptions = filteredFlights;

  // Build return options: prefer real returnFlight from Amadeus, otherwise synthesize from outbound flights
  const returnOptionsRaw = filteredFlights.filter((f) => !!f.returnFlight);
  const returnOptions = returnOptionsRaw.length > 0
    ? returnOptionsRaw.map((flight) => ({
        id: String(flight.id),
      airline: flight.returnFlight?.airline || flight.airline,
      airlineCode: flight.returnFlight?.airlineCode || inferAirlineCode(flight),
        price: Math.round(flight.price * 0.46),
        origin: flight.returnFlight!.origin,
        destination: flight.returnFlight!.destination,
        departureTime: flight.returnFlight!.departureTime,
        arrivalTime: flight.returnFlight!.arrivalTime,
        duration: flight.returnFlight!.duration,
        stops: flight.returnFlight!.stops,
        isSynthesized: false,
      }))
    : filteredFlights.map((flight) => {
        // Use the returnDate from URL params, fall back to departure + 7 days
        let baseDateStr = returnDate;
        if (!baseDateStr) {
          const dep = new Date(flight.departureTime as string);
          dep.setDate(dep.getDate() + 7);
          baseDateStr = dep.toISOString().slice(0, 10);
        }
        const outboundDep = new Date(flight.departureTime as string);
        const [yr, mo, dy] = baseDateStr.split("-").map(Number);
        const depDate = new Date(yr, mo - 1, dy, outboundDep.getHours(), outboundDep.getMinutes(), 0);
        const match = flight.duration.match(/(\d+)h\s*(\d+)m/);
        const totalMins = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
        const arrDate = new Date(depDate.getTime() + totalMins * 60 * 1000);
        return {
          id: `ret-${flight.id}`,
          airline: flight.airline,
          airlineCode: inferAirlineCode(flight),
          price: Math.round(flight.price * 0.47),
          origin: flight.destination,
          destination: flight.origin,
          departureTime: depDate.toISOString() as string | Date,
          arrivalTime: arrDate.toISOString() as string | Date,
          duration: flight.duration,
          stops: flight.stops,
          isSynthesized: true,
        };
      });

  const selectedOnwardFlight = onwardOptions.find((item) => String(item.id) === String(selectedOnward)) || null;
  const selectedReturnFlight = returnOptions.find((item) => String(item.id) === String(selectedReturn)) || null;
  const combinedPrice = (selectedOnwardFlight?.price || 0) + (selectedReturnFlight?.price || 0);

  // Compute lowest prices matrix by airline & stops
  const matrixData = useMemo(() => {
    if (!typedFlights.length) return [];

    const map = new Map<string, { airline: string; airlineCode?: string; nonStop: number | null; oneStop: number | null; multiStop: number | null }>();

    for (const f of typedFlights) {
      const key = f.airline;
      if (!map.has(key)) {
        map.set(key, { airline: f.airline, airlineCode: inferAirlineCode(f), nonStop: null, oneStop: null, multiStop: null });
      }
      const entry = map.get(key)!;
      if (f.stops === 0) {
        if (entry.nonStop === null || f.price < entry.nonStop) entry.nonStop = f.price;
      } else if (f.stops === 1) {
        if (entry.oneStop === null || f.price < entry.oneStop) entry.oneStop = f.price;
      } else {
        if (entry.multiStop === null || f.price < entry.multiStop) entry.multiStop = f.price;
      }
    }

    return Array.from(map.values()).slice(0, 4);
  }, [typedFlights]);

  return (
    <Layout>
      {/* ── Top Bar Summary (Matches Cheapvuelos blue header bar) ── */}
      {hasSearchCriteria && (
        <div className="sticky top-16 z-30 bg-[#004b93] text-white shadow-md border-b border-blue-900 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg border border-blue-400/40 transition-all text-xs shrink-0"
            >
              Filters 🔻
            </button>

            <div className="text-center font-bold truncate px-2">
              <span className="text-white font-black">{origin} ↔ {destination}</span>
              <span className="mx-2 hidden sm:inline">•</span>
              <span className="hidden sm:inline font-medium text-blue-100">
                {passengers || "1"} Traveler | {date ? format(new Date(date), "EEE, dd MMM") : "Date"} | {travelClass || "Economy"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowModifySearch((prev) => !prev);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 bg-white text-blue-900 hover:bg-blue-50 font-bold px-3 py-1.5 rounded-lg transition-all text-xs shadow-sm shrink-0 cursor-pointer"
            >
              {showModifySearch ? "✕ Close Search" : "🔍 Modify Search"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 pt-8 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Flight Search Results</h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-1">
              Comparing 500+ airlines for lowest unpublished fares
            </p>
          </div>
          {hasSearchCriteria && !showModifySearch && (
            <button
              type="button"
              onClick={() => setShowModifySearch(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              Change Flight / Dates
            </button>
          )}
        </div>
      </div>
      
      {/* Search Widget: Collapsible on /search for maximum fluidity */}
      {showModifySearch && (
        <div className="px-4 transition-all">
          <SearchWidget />
        </div>
      )}

      <div id="results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-40">
        {/* ── Airlines & Stops Matrix Box (Cheapvuelos Style) ── */}
        {matrixData.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6 p-4">
            <div className="flex items-center gap-4 overflow-x-auto pb-1">
              <div className="border-r border-slate-200 dark:border-slate-800 pr-4 shrink-0">
                <p className="text-[11px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest leading-tight">AIRLINES »</p>
                <p className="text-[11px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest leading-tight mt-0.5">STOPS 🠗</p>
                <div className="mt-3 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <p>Non Stop</p>
                  <p>1 Stop</p>
                  <p>2 + Stop</p>
                </div>
              </div>

              {matrixData.map((m) => (
                <div key={m.airline} className="text-center min-w-[100px] border-r border-slate-100 dark:border-slate-800 last:border-r-0 pr-3 shrink-0">
                  <div className="flex justify-center mb-3">
                    <AirlineLogo code={m.airlineCode} name={m.airline} />
                  </div>
                  <div className="space-y-2 text-xs font-bold">
                    <p className="text-slate-900 dark:text-white">{m.nonStop ? `$${Math.round(m.nonStop / 100)}` : "-"}</p>
                    <p className="text-slate-900 dark:text-white">{m.oneStop ? `$${Math.round(m.oneStop / 100)}` : "-"}</p>
                    <p className="text-slate-900 dark:text-white">{m.multiStop ? `$${Math.round(m.multiStop / 100)}` : "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Notice Banner ── */}
        {hasSearchCriteria && (
          <div className="p-3.5 mb-6 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-red-500">Note: *</span> All Fares displayed are quoted in USD and inclusive of base fare, taxes and all fees. Additional baggage fees may apply as per the airline policies. Some flights displayed either may be for flexible dates or nearby airport(s).
          </div>
        )}

        <div className="rounded-2xl border border-border bg-background px-4 py-3 mb-6 flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground text-sm">Fare type:</p>
          {["Regular", "Student", "Armed Forces", "Senior Citizen", "Doctor and Nurses"].map((fare) => (
            <button
              key={fare}
              type="button"
              onClick={() => setSelectedFare(fare)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${selectedFare === fare ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-foreground"}`}
            >
              {fare}
            </button>
          ))}

          <div className="h-6 w-px bg-border mx-1" />

          <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Checkbox checked={zeroCancellation} onCheckedChange={(v) => setZeroCancellation(v === true)} />
            Add Zero Cancellation
          </label>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-md border border-border" onClick={() => setFiltersOpen(true)} aria-label="Open filters">
              <Sliders className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-foreground">
              {isLoading
                ? "Searching..."
                : hasSearchCriteria
                  ? flights?.length
                    ? `${flights.length} flights found`
                    : "No flights found"
                  : "Enter your trip details to search"}
            </h2>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Sorted by <span className="text-foreground font-bold cursor-pointer">Best Price</span>
          </div>
        </div>

        <FilterDrawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          fares={["Regular", "Student", "Armed Forces", "Senior Citizen", "Doctor and Nurses"]}
          selectedFare={selectedFare}
          setSelectedFare={setSelectedFare}
          zeroCancellation={zeroCancellation}
          setZeroCancellation={setZeroCancellation}
          totalResults={typedFlights.length}

          uniqueAirlines={uniqueAirlines}
          selectedAirlines={selectedAirlines}
          toggleAirline={toggleAirline}

          uniqueStops={uniqueStops}
          selectedStops={selectedStops}
          toggleStop={toggleStop}

          priceMin={priceStats.min}
          priceMax={priceStats.max}
          priceRange={priceRange}
          setPriceRange={setPriceRange}

          departureTimeRanges={departureTimeRanges}
          toggleDepartureTimeRange={toggleDepartureTimeRange}
          arrivalTimeRanges={arrivalTimeRanges}
          toggleArrivalTimeRange={toggleArrivalTimeRange}
          onApply={() => {
            // Close handled by drawer; scroll after a short delay to allow exit animation
            setFiltersOpen(false);
            setTimeout(() => {
              const el = document.getElementById('results');
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 80; // offset for header
                window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
              }
            }, 340);
          }}
        />

        {!hasSearchCriteria ? (
          <div className="bg-card p-16 rounded-3xl border border-border text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Plane className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Start a search to see fares</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Add an origin, destination, and departure date above. Once the search runs, prices will appear here.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-5">
            <SearchingEffect />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="w-full h-40 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-8 rounded-2xl border border-destructive/20 text-center">
            <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
            <p>We couldn't fetch your flights at this time. Please try again.</p>
          </div>
        ) : typedFlights.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block rounded-2xl border border-border bg-card p-5 h-fit sticky top-28 max-h-[80vh] overflow-y-auto shadow-sm">
              <h3 className="text-lg font-bold mb-5 text-foreground">Filter Results</h3>
              <div className="space-y-6">
                {/* Non-Stop Filter */}
                <div>
                  <label className="inline-flex items-center gap-2 font-semibold text-sm cursor-pointer text-foreground">
                    <Checkbox checked={nonStopOnly} onCheckedChange={(v) => setNonStopOnly(v === true)} />
                    Non Stop Only
                  </label>
                </div>

                {/* Stops Filter */}
                {uniqueStops.length > 0 && (
                  <div>
                    <button type="button" className="font-semibold text-sm mb-3 text-left w-full text-foreground" onClick={() => setActiveFilter('stops')}>Stops</button>
                    <div className="space-y-2">
                      {uniqueStops.slice(0, 3).map((stop) => (
                        <label key={stop} className="inline-flex items-center gap-2 text-sm cursor-pointer text-foreground">
                          <Checkbox
                            checked={selectedStops.has(stop)}
                            onCheckedChange={(checked) => {
                              const updated = new Set(selectedStops);
                              if (checked) updated.add(stop);
                              else updated.delete(stop);
                              setSelectedStops(updated);
                            }}
                          />
                          <span>{stop === 0 ? "Non-stop" : `${stop} Stop${stop > 1 ? "s" : ""}`}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Airlines Filter */}
                {uniqueAirlines.length > 0 && (
                  <div>
                    <button type="button" className="font-semibold text-sm mb-3 text-left w-full text-foreground" onClick={() => setActiveFilter('airlines')}>Airlines</button>
                    <div className="space-y-2">
                      {uniqueAirlines.slice(0, 6).map((airline) => (
                        <label key={airline} className="inline-flex items-center gap-2 text-sm cursor-pointer text-foreground">
                          <Checkbox
                            checked={selectedAirlines.has(airline)}
                            onCheckedChange={(checked) => {
                              const updated = new Set(selectedAirlines);
                              if (checked) updated.add(airline);
                              else updated.delete(airline);
                              setSelectedAirlines(updated);
                            }}
                          />
                          <span className="truncate">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <button type="button" className="font-semibold text-sm mb-2 text-left w-full text-foreground" onClick={() => setActiveFilter('price')}>Price Range</button>
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>{formatUsdFromCents(priceRange[0])}</span>
                    <span>{formatUsdFromCents(priceRange[1])}</span>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedAirlines.size > 0 || selectedStops.size > 0 || departureTimeRanges.size > 0 || arrivalTimeRanges.size > 0 || nonStopOnly || priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNonStopOnly(false);
                      setSelectedAirlines(new Set());
                      setSelectedStops(new Set());
                      setPriceRange([priceStats.min, priceStats.max]);
                      setDepartureTimeRanges(new Set());
                      setArrivalTimeRanges(new Set());
                    }}
                    className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Flight Cards List */}
            <div className="space-y-6">
              {filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight as any} />
                ))
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-8 rounded-3xl text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
                  <h3 className="text-xl font-black text-amber-900 dark:text-amber-200">No flights match your selected filters</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 max-w-md mx-auto">
                    Try clearing your active filters or call our reservation desk directly for unlisted phone-only fares.
                  </p>
                  <Button
                    type="button"
                    onClick={clearAllFilters}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md"
                  >
                    Reset All Filters
                  </Button>
                </div>
              )}

              {/* Call Agent Section when filtered or zero results */}
              {filteredFlights.length === 0 && (
                <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl text-center flex flex-col items-center">
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-extrabold uppercase tracking-widest mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                    ⚡ Phone Exclusive Secret Airline Deals
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-white leading-tight">
                    Looking for Unlisted Fares from <span className="text-blue-400">{origin || "Your City"}</span> to <span className="text-blue-400">{destination || "Destination"}</span>?
                  </h3>

                  <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg mb-8 font-medium leading-relaxed">
                    Certain published fares on online engines are sold out or restricted. Speak directly with our flight booking desk for <strong className="text-yellow-400 font-bold">Unpublished Phone-Only Fares — Save up to 40% Off!</strong>
                  </p>

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
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300 font-semibold pt-6 border-t border-white/10 w-full max-w-3xl">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400 font-bold">✓</span> 24/7 Agent Support
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400 font-bold">✓</span> Instant Ticket E-Dispatch
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400 font-bold">✓</span> Zero Booking Fee
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400 font-bold">✓</span> Price Match Guarantee
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl text-center flex flex-col items-center">
            {/* Background Glow Effects */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              ⚡ Phone Exclusive Secret Airline Deals
            </div>

            {/* Main Heading */}
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-white leading-tight">
              Looking for Unlisted Fares from <span className="text-blue-400">{origin || "Your City"}</span> to <span className="text-blue-400">{destination || "Destination"}</span>?
            </h3>

            {/* Subtext */}
            <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg mb-8 font-medium leading-relaxed">
              Certain published fares on online engines are sold out or restricted. Speak directly with our flight booking desk for <strong className="text-yellow-400 font-bold">Unpublished Phone-Only Fares — Save up to 40% Off!</strong>
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
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300 font-semibold pt-6 border-t border-white/10 w-full max-w-3xl">
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> 24/7 Agent Support
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Instant Ticket E-Dispatch
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Zero Booking Fee
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-400 font-bold">✓</span> Price Match Guarantee
              </div>
            </div>
          </div>
        )}
      </div>
        
        {/* Small filter window (no overlay) */}
        <AnimatePresence>
          {activeFilter && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="fixed left-1/2 top-24 z-60 w-full max-w-md -translate-x-1/2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-border p-4"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-bold">{activeFilter === 'stops' ? 'Stops' : activeFilter === 'airlines' ? 'Airlines' : activeFilter === 'price' ? 'Price Range' : activeFilter === 'departure' ? 'Departure Time' : 'Arrival Time'}</h4>
                <button onClick={() => setActiveFilter(null)} aria-label="Close" className="p-2 rounded-md">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 max-h-72 overflow-auto">
                {activeFilter === 'stops' && (
                  <div className="space-y-2">
                    {uniqueStops.map((stop) => (
                      <label key={String(stop)} className="inline-flex items-center gap-2 w-full">
                        <Checkbox checked={selectedStops.has(stop)} onCheckedChange={(c) => {
                          const updated = new Set(selectedStops);
                          if (c) updated.add(stop); else updated.delete(stop);
                          setSelectedStops(updated);
                        }} />
                        <span>{stop === 0 ? 'Non-stop' : `${stop} Stop${stop > 1 ? 's' : ''}`}</span>
                      </label>
                    ))}
                  </div>
                )}

                {activeFilter === 'airlines' && (
                  <div className="space-y-2">
                    {uniqueAirlines.map((air) => (
                      <label key={air} className="inline-flex items-center gap-2 w-full">
                        <Checkbox checked={selectedAirlines.has(air)} onCheckedChange={(c) => {
                          const updated = new Set(selectedAirlines);
                          if (c) updated.add(air); else updated.delete(air);
                          setSelectedAirlines(updated);
                        }} />
                        <span className="truncate">{air}</span>
                      </label>
                    ))}
                  </div>
                )}

                {activeFilter === 'price' && (
                  <div>
                    <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} min={priceStats.min} max={priceStats.max} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{formatUsdFromCents(priceRange[0])}</span>
                      <span>{formatUsdFromCents(priceRange[1])}</span>
                    </div>
                  </div>
                )}

                {activeFilter === 'departure' && (
                  <div className="grid grid-cols-2 gap-2">
                    {['morning','afternoon','evening','night'].map((label) => (
                      <button key={label} type="button" onClick={() => toggleDepartureTimeRange(label)} className={`px-3 py-2 rounded-lg border text-sm ${departureTimeRanges.has(label) ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-foreground'}`}>
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </button>
                    ))}
                  </div>
                )}

                {activeFilter === 'arrival' && (
                  <div className="grid grid-cols-2 gap-2">
                    {['morning','afternoon','evening','night'].map((label) => (
                      <button key={label} type="button" onClick={() => toggleArrivalTimeRange(label)} className={`px-3 py-2 rounded-lg border text-sm ${arrivalTimeRanges.has(label) ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-foreground'}`}>
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ShareFlightModal open={shareDialogOpen} flight={shareFlight} onOpenChange={setShareDialogOpen} />
    </Layout>
  );
}
