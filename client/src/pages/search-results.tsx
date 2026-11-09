import { useSearchFlights } from "@/hooks/use-flights";
import { useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { FlightCard } from "@/components/flight-card";
import { SearchWidget } from "@/components/search-widget";
import { CombinedFlightSearch } from "@/components/combined-flight-search";
// AirportSchedule removed per request
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Frown, Plane, Share2, Copy, Mail, MessageCircle, Sliders, X } from "lucide-react";
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
        <div className="relative w-full max-w-md h-20 mb-6">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-border" />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            animate={{ x: [0, 260, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Plane className="w-10 h-10 text-muted-foreground" />
          </motion.div>
        </div>

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
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  
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

  const [selectedFare, setSelectedFare] = useState("Regular");
  const [zeroCancellation, setZeroCancellation] = useState(false);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [selectedOnward, setSelectedOnward] = useState<string | number | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<string | number | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareFlight, setShareFlight] = useState<any>(null);
  // Live airport schedule UI removed
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Filter states
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(new Set());
  const [selectedStops, setSelectedStops] = useState<Set<number | string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Number.MAX_SAFE_INTEGER]);
  const [departureTimeRanges, setDepartureTimeRanges] = useState<Set<string>>(new Set());
  const [arrivalTimeRanges, setArrivalTimeRanges] = useState<Set<string>>(new Set());

  const typedFlights = (flights || []) as SearchFlight[];

  // Get unique airlines and stops for filter options
  const uniqueAirlines = useMemo(() => {
    const airlines = new Set(typedFlights.map((f) => f.airline));
    return Array.from(airlines).sort();
  }, [typedFlights]);

  const uniqueStops = useMemo(() => {
    const stops = new Set(typedFlights.map((f) => f.stops));
    return Array.from(stops).sort((a, b) => a - b);
  }, [typedFlights]);

  const priceStats = useMemo(() => {
    const prices = typedFlights.map((f) => f.price);
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: Number.MAX_SAFE_INTEGER };
  }, [typedFlights]);

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

  

  // Main filters
  const filteredFlights = useMemo(() => {
    if (!typedFlights.length) return [];
    return typedFlights.filter((flight) => {
      // Non-stop filter
      if (nonStopOnly && flight.stops !== 0) return false;
      
      // Airline filter
      if (selectedAirlines.size > 0 && !selectedAirlines.has(flight.airline)) return false;
      
      // Stops filter
      if (selectedStops.size > 0 && !selectedStops.has(flight.stops)) return false;
      
      // Price filter
      if (flight.price < priceRange[0] || flight.price > priceRange[1]) return false;
      
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
  }, [typedFlights, nonStopOnly, selectedAirlines, selectedStops, priceRange, departureTimeRanges, arrivalTimeRanges]);

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

  return (
    <Layout>
      <div className="bg-primary pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
          <p className="text-primary-foreground/80">Showing the best options for your trip</p>
        </div>
      </div>
      
      <div className="px-4">
        <SearchWidget />
      </div>

      {/* Full Search Results */}
      <div className="px-4 mt-8">
        {hasSearchCriteria ? (
          <CombinedFlightSearch
            origin={origin}
            destination={destination}
            date={date ? new Date(date) : undefined}
            returnDate={returnDate ? new Date(returnDate) : undefined}
            tripType={(tripType === "oneway" ? "oneway" : "round") as "oneway" | "round"}
            passengers={parseInt(passengers || "1", 10)}
            adults={adults}
            children={children}
            infants={infants}
            travelClass={travelClass || undefined}
            packageType={packageType || undefined}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        ) : null}
      </div>

      {/* Live Airport Schedules removed */}

      <div id="results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-40">
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
        ) : typedFlights.length > 0 && tripType === "round" ? (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            <aside className="hidden lg:block rounded-2xl border border-border bg-card p-5 h-fit sticky top-20 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-5">Filters</h3>
              <div className="space-y-6">
                {/* Non-Stop Filter */}
                <div>
                  <label className="inline-flex items-center gap-2 font-semibold text-sm mb-3">
                    <Checkbox checked={nonStopOnly} onCheckedChange={(v) => setNonStopOnly(v === true)} />
                    Non Stop Only
                  </label>
                </div>

                {/* Stops Filter — opens in small window on click */}
                {uniqueStops.length > 0 && (
                  <div>
                    <button type="button" className="font-semibold text-sm mb-3 text-left w-full" onClick={() => setActiveFilter('stops')}>Stops</button>
                    <div className="space-y-2">
                      {uniqueStops.slice(0, 3).map((stop) => (
                        <label key={stop} className="inline-flex items-center gap-2 text-sm cursor-default">
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
                      {uniqueStops.length > 3 && <p className="text-xs text-muted-foreground">More options available — click to open</p>}
                    </div>
                  </div>
                )}

                {/* Airlines Filter */}
                {uniqueAirlines.length > 0 && (
                  <div>
                    <button type="button" className="font-semibold text-sm mb-3 text-left w-full" onClick={() => setActiveFilter('airlines')}>Airlines</button>
                    <div className="space-y-2">
                      {uniqueAirlines.slice(0, 6).map((airline) => (
                        <label key={airline} className="inline-flex items-center gap-2 text-sm cursor-default">
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
                      {uniqueAirlines.length > 6 && <p className="text-xs text-muted-foreground">More airlines — click to open</p>}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div>
                  <button type="button" className="font-semibold text-sm mb-3 text-left w-full" onClick={() => setActiveFilter('price')}>Price Range</button>
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">Quick preview — open to adjust full range</div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatUsdFromCents(priceRange[0])}</span>
                      <span>{formatUsdFromCents(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Departure Time Filter */}
                <div>
                  <button type="button" className="font-semibold text-sm mb-3 text-left w-full" onClick={() => setActiveFilter('departure')}>Departure Time</button>
                  <div className="grid grid-cols-2 gap-2">
                    {['morning','afternoon','evening','night'].slice(0,2).map((label) => (
                      <div key={label} className="px-2 py-2 rounded text-xs font-medium border bg-background border-border text-foreground">{label}</div>
                    ))}
                  </div>
                </div>

                {/* Arrival Time Filter */}
                <div>
                  <button type="button" className="font-semibold text-sm mb-3 text-left w-full" onClick={() => setActiveFilter('arrival')}>Arrival Time</button>
                  <div className="grid grid-cols-2 gap-2">
                    {['morning','afternoon','evening','night'].slice(0,2).map((label) => (
                      <div key={label} className="px-2 py-2 rounded text-xs font-medium border bg-background border-border text-foreground">{label}</div>
                    ))}
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
                    title="Clear all filters"
                    className="w-full py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </aside>

            <div className="space-y-4">
              <h3 className="text-4xl font-extrabold leading-tight">Flights from {origin} to {destination}, and back</h3>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <section className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border font-bold text-xl">{origin} → {destination}</div>
                  <div className="space-y-2 p-4">
                    <AnimatePresence>
                      {onwardOptions.map((flight) => (
                        <motion.div
                          layout
                          key={`onward-${flight.id}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${selectedOnward === flight.id ? "border-primary bg-primary/8 shadow-lg shadow-primary/20" : "border-border bg-background hover:border-primary/50 hover:shadow-md"}`}
                          onClick={() => setSelectedOnward(flight.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <AirlineLogo code={(flight as any).airlineCode} name={flight.airline} />
                                <div>
                                  <p className="font-bold text-lg text-foreground">{flight.airline}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{flight.flightNumber || "Flight"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShareFlight(flight);
                                  setShareDialogOpen(true);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                title="Share this flight"
                              >
                                <Share2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                              <div className="text-right">
                                <p className={`text-lg font-extrabold ${selectedOnward === flight.id ? "text-primary" : "text-foreground"}`}>{formatUsdFromCents(flight.price)}</p>
                                <p className="text-xs text-muted-foreground">/adult</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                            <div>
                              <p className="text-2xl font-extrabold">{formatClock(flight.departureTime)}</p>
                              <p className="text-xs text-muted-foreground mt-1">{flight.origin}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="text-xs text-muted-foreground font-medium">{flight.duration}</p>
                              <div className="w-8 h-px bg-border my-1"></div>
                              <p className="text-xs text-muted-foreground">{flight.stops === 0 ? "Direct" : `${flight.stops} stop`}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-extrabold">{formatClock(flight.arrivalTime)}</p>
                              <p className="text-xs text-muted-foreground mt-1">{flight.destination}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border font-bold text-xl">{destination} → {origin}</div>
                  <div className="space-y-2 p-4">
                    <AnimatePresence>
                      {returnOptions.map((flight) => (
                        <motion.div
                          layout
                          key={`return-${flight.id}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${String(selectedReturn) === String(flight.id) ? "border-primary bg-primary/8 shadow-lg shadow-primary/20" : "border-border bg-background hover:border-primary/50 hover:shadow-md"}`}
                          onClick={() => setSelectedReturn(String(flight.id))}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <AirlineLogo code={(flight as any).airlineCode} name={flight.airline} />
                                <div>
                                  <p className="font-bold text-lg text-foreground">{flight.airline}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">Return Flight</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShareFlight(flight);
                                  setShareDialogOpen(true);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                title="Share this flight"
                              >
                                <Share2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                              <div className="text-right">
                                <p className={`text-lg font-extrabold ${String(selectedReturn) === String(flight.id) ? "text-primary" : "text-foreground"}`}>{formatUsdFromCents(flight.price)}</p>
                                <p className="text-xs text-muted-foreground">/adult</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                            <div>
                              <p className="text-2xl font-extrabold">{formatClock(flight.departureTime)}</p>
                              <p className="text-xs text-muted-foreground mt-1">{flight.origin}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="text-xs text-muted-foreground font-medium">{flight.duration}</p>
                              <div className="w-8 h-px bg-border my-1"></div>
                              <p className="text-xs text-muted-foreground">{flight.stops === 0 ? "Direct" : `${flight.stops} stop`}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-extrabold">{formatClock(flight.arrivalTime)}</p>
                              <p className="text-xs text-muted-foreground mt-1">{flight.destination}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : typedFlights.length > 0 ? (
          <div className="space-y-8">
            {/* Regular Flight Cards */}
            <div className="space-y-6">
              {typedFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight as any} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card p-16 rounded-3xl border border-border text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Frown className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No flights found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any flights matching your search criteria. Try adjusting your dates or locations.
            </p>
          </div>
        )}
      </div>

      {tripType === "round" && selectedOnwardFlight && selectedReturnFlight && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#082446] text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-center">
            <div className="text-sm">
              <p className="text-white/80">Departure • {selectedOnwardFlight.airline}</p>
              <p className="text-2xl font-extrabold">{formatClock(selectedOnwardFlight.departureTime)} → {formatClock(selectedOnwardFlight.arrivalTime)}</p>
              <p className="text-white/70">{formatUsdFromCents(selectedOnwardFlight.price)}</p>
            </div>
            <div className="text-sm">
              <p className="text-white/80">Return • {selectedReturnFlight.airline}</p>
              <p className="text-2xl font-extrabold">{formatClock(selectedReturnFlight.departureTime)} → {formatClock(selectedReturnFlight.arrivalTime)}</p>
              <p className="text-white/70">{formatUsdFromCents(selectedReturnFlight.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Total</p>
              <p className="text-4xl font-extrabold mb-3">{formatUsdFromCents(combinedPrice)}</p>
              <Button
                className="rounded-full px-8 h-12 text-lg font-bold"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("tripType", "round");
                  params.set("totalPrice", String(combinedPrice));
                  if (selectedReturnFlight) {
                    params.set("rtAirline", selectedReturnFlight.airline);
                    params.set("rtOrigin", selectedReturnFlight.origin);
                    params.set("rtDest", selectedReturnFlight.destination);
                    params.set("rtDep", String(selectedReturnFlight.departureTime));
                    params.set("rtArr", String(selectedReturnFlight.arrivalTime));
                    params.set("rtDur", selectedReturnFlight.duration);
                    params.set("rtStops", String(selectedReturnFlight.stops));
                    params.set("rtPrice", String(selectedReturnFlight.price));
                  }
                  window.location.href = `/book/${selectedOnwardFlight!.id}?${params.toString()}`;
                }}
              >
                REQUEST QUOTE
              </Button>
            </div>
          </div>
        </div>
      )}
        
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
