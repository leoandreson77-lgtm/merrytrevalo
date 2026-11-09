import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, ArrowRightLeft, ChevronDown, Users, Search, Plane, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AirportAutocomplete } from "@/components/airport-autocomplete";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { resolveAirportSuggestion } from "@/lib/airport-resolver";

function extractIataCode(text: string) {
  const value = String(text || "").trim();
  const bracketMatch = value.match(/\(([A-Za-z]{3})\)$/);
  if (bracketMatch) return bracketMatch[1].toUpperCase();

  const plainMatch = value.match(/^([A-Za-z]{3})$/);
  if (plainMatch) return plainMatch[1].toUpperCase();

  return "";
}

export function SearchWidget() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const search = searchParamsHook.toString() ? "?" + searchParamsHook.toString() : "";
  const searchParams = new URLSearchParams(search);
  const { toast } = useToast();

  const initialOrigin = searchParams.get("origin") || "";
  const initialDestination = searchParams.get("destination") || "";
  const initialTripType = searchParams.get("tripType") === "oneway" ? "oneway" : "round";
  const initialDate = searchParams.get("date");
  const initialReturnDate = searchParams.get("returnDate");

  const [tripType, setTripType] = useState<"round" | "oneway">(initialTripType);
  const [origin, setOrigin] = useState(initialOrigin);
  const [originDisplay, setOriginDisplay] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [destinationDisplay, setDestinationDisplay] = useState(initialDestination);
  const [date, setDate] = useState<Date | undefined>(initialDate ? new Date(initialDate) : undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialReturnDate ? new Date(initialReturnDate) : undefined,
  );
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [adults, setAdults] = useState(Math.max(Number(searchParams.get("passengers") || "1"), 1));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");
  const [zeroCancellation, setZeroCancellation] = useState(false);
  const [selectedFare, setSelectedFare] = useState("Regular");

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
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolveAirportCode = async (currentCode: string, currentDisplay: string) => {
      const trimmedDisplay = String(currentDisplay || "").trim();
      const parsedCode = currentCode || extractIataCode(trimmedDisplay);
      if (parsedCode) return parsedCode;

      const airport = await resolveAirportSuggestion(trimmedDisplay, "airport");
      return String(airport?.code || "").trim();
    };

    const finalOrigin = await resolveAirportCode(origin, originDisplay);
    const finalDestination = await resolveAirportCode(destination, destinationDisplay);

    if (finalOrigin && finalOrigin !== origin) {
      setOrigin(finalOrigin);
    }

    if (finalDestination && finalDestination !== destination) {
      setDestination(finalDestination);
    }

    if (!finalOrigin || !finalDestination || !date) {
      toast({
        title: "Missing inputs",
        description: "Please select origin, destination, and departure date.",
        variant: "destructive",
      });
      return;
    }

    if (tripType === "round") {
      if (!returnDate) {
        toast({
          title: "Return date required",
          description: "Please select a return date for round trip.",
          variant: "destructive",
        });
        return;
      }

      if (returnDate < date) {
        toast({
          title: "Invalid return date",
          description: "Return date must be after departure date.",
          variant: "destructive",
        });
        return;
      }
    }

    const params = new URLSearchParams();
    params.append("origin", finalOrigin);
    params.append("destination", finalDestination);
    params.append("date", date.toISOString().split("T")[0]);
    params.append("tripType", tripType);
    params.append("package", packageType);
    params.append("passengers", String(totalTravellers));
    params.append("adults", String(adults));
    params.append("children", String(children));
    params.append("infants", String(infants));
    params.append("travelClass", travelClass);
    params.append("zeroCancellation", zeroCancellation ? "1" : "0");
    params.append("fareType", selectedFare);

    if (tripType === "round" && returnDate) {
      params.append("returnDate", returnDate.toISOString().split("T")[0]);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto -mt-24 relative z-10">
      {/* ── Main Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        
        {/* ── Header: Trip Type + Title ── */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800 dark:to-slate-800/80 px-5 sm:px-7 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
              {(["oneway", "round", "multi"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    if (type === "multi") return;
                    setTripType(type as "round" | "oneway");
                    if (type === "oneway") setReturnDate(undefined);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    type === "multi" && "opacity-40 cursor-not-allowed",
                    (type === "oneway" && tripType === "oneway") || (type === "round" && tripType === "round")
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  {type === "oneway" ? "One Way" : type === "round" ? "Round Trip" : "Multi City"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Plane className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Search International & Domestic Flights</span>
            </div>
          </div>
        </div>

        {/* ── Search Form ── */}
        <form onSubmit={handleSearch}>
          {/* ── Input Fields Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* From / To Section */}
            <div className="lg:col-span-5 relative grid grid-cols-1 sm:grid-cols-2">
              {/* From */}
              <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-700/60 group hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">From</p>
                </div>
                <AirportAutocomplete
                  value={origin}
                  displayValue={originDisplay}
                  onChange={(code, display) => {
                    setOrigin(code);
                    setOriginDisplay(display);
                  }}
                  placeholder="Enter city or airport"
                  size="compact"
                />
              </div>

              {/* To */}
              <div className="p-4 sm:p-5 border-b lg:border-b-0 group hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">To</p>
                </div>
                <AirportAutocomplete
                  value={destination}
                  displayValue={destinationDisplay}
                  onChange={(code, display) => {
                    setDestination(code);
                    setDestinationDisplay(display);
                  }}
                  placeholder="Where to?"
                  size="compact"
                />
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={() => {
                  const nextOrigin = destination;
                  const nextOriginDisplay = destinationDisplay;
                  setOrigin(nextOrigin);
                  setOriginDisplay(nextOriginDisplay);
                  setDestination(origin);
                  setDestinationDisplay(originDisplay);
                }}
                className="hidden sm:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-600 shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:text-white hover:shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-200 z-20"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Departure / Return / Travellers */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 lg:border-l border-slate-200/80 dark:border-slate-700/60">
              {/* Departure */}
              <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-700/60 group hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Departure</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between p-0 text-left hover:bg-transparent"
                    >
                      <div>
                        <span className="block text-xl font-black text-slate-900 dark:text-white">
                          {date ? format(date, "dd") : "--"}
                        </span>
                        <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                          {date ? format(date, "MMM''yy, EEE") : "Select date"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-blue-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-4" />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return */}
              <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-slate-200/80 dark:border-slate-700/60 group hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Return</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between p-0 text-left hover:bg-transparent"
                    >
                      <div>
                        {returnDate ? (
                          <>
                            <span className="block text-xl font-black text-slate-900 dark:text-white">
                              {format(returnDate, "dd")}
                            </span>
                            <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                              {format(returnDate, "MMM''yy, EEE")}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="block text-xl font-black text-slate-900 dark:text-white">--</span>
                            <span className="block text-sm font-medium text-slate-400">
                              {tripType === "round" ? "Add return" : "Not needed"}
                            </span>
                          </>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-blue-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus className="p-4" disabled={(d) => date ? d < date : false} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Travellers & Class */}
              <div className="p-4 sm:p-5 group hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Travellers & Class</p>
                </div>
                <Popover open={travellersOpen} onOpenChange={setTravellersOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between p-0 text-left hover:bg-transparent"
                    >
                      <div>
                        <span className="text-xl font-black text-slate-900 dark:text-white">{totalTravellers}</span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1.5">Traveller{totalTravellers > 1 ? "s" : ""}</span>
                        <span className="block text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">{travelClass}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-blue-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(92vw,420px)] p-5 space-y-5" align="end">
                    <div className="space-y-3">
                      {[
                        { label: "Adults", subtitle: "12+ years", value: adults, min: 1, setter: setAdults },
                        { label: "Children", subtitle: "2–11 years", value: children, min: 0, setter: setChildren },
                        { label: "Infants", subtitle: "Under 2", value: infants, min: 0, setter: setInfants },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-white">{item.label}</span>
                            <span className="block text-xs text-slate-400 mt-0.5">{item.subtitle}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => updateCounter(item.setter, item.value - 1, item.min)} className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors font-bold">−</button>
                            <span className="w-6 text-center font-bold text-slate-800 dark:text-white">{item.value}</span>
                            <button type="button" onClick={() => updateCounter(item.setter, item.value + 1, item.min)} className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors font-bold">+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Travel Class</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Economy", "Premium Economy", "Business", "First Class"].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setTravelClass(value)}
                            className={cn(
                              "px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200",
                              travelClass === value
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600"
                            )}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl" onClick={() => setTravellersOpen(false)}>
                      Apply
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* ── Bottom Bar: Fares + Search ── */}
          <div className="border-t border-slate-200/80 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-blue-50/30 dark:from-slate-800/80 dark:to-slate-800/40 px-5 sm:px-7 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Special Fares */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">Special Fares</span>
                {["Regular", "Student", "Armed Forces", "Senior Citizen", "Doctor & Nurses"].map((fare) => (
                  <button
                    key={fare}
                    type="button"
                    onClick={() => setSelectedFare(fare)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200",
                      selectedFare === fare
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600"
                    )}
                  >
                    {fare}
                  </button>
                ))}
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-base px-10 py-6 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
              >
                <Search className="w-5 h-5 mr-2" />
                SEARCH FLIGHTS
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
