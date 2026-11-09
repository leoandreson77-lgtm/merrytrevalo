import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useLocation, useSearch } from "wouter";
import { Calendar as CalendarIcon, ArrowRightLeft, ChevronDown, Users } from "lucide-react";
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
  const [, setLocation] = useLocation();
  const search = useSearch();
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
  const [travelClass, setTravelClass] = useState("Economy/Premium Economy");
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
    
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto rounded-3xl border border-border bg-card p-4 sm:p-6 -mt-24 relative z-10 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-6 text-xl">
          <button
            type="button"
            onClick={() => {
              setTripType("oneway");
              setReturnDate(undefined);
            }}
            className={cn(
              "inline-flex items-center gap-2 text-base font-semibold",
              tripType === "oneway" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className={cn("h-4 w-4 rounded-full border", tripType === "oneway" ? "border-primary bg-primary" : "border-muted-foreground")} />
            One Way
          </button>
          <button
            type="button"
            onClick={() => setTripType("round")}
            className={cn(
              "inline-flex items-center gap-2 text-base font-semibold",
              tripType === "round" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className={cn("h-4 w-4 rounded-full border", tripType === "round" ? "border-primary bg-primary" : "border-muted-foreground")} />
            Round Trip
          </button>
          <button type="button" className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground">
            <span className="h-4 w-4 rounded-full border border-muted-foreground" />
            Multi City
          </button>
        </div>
        <p className="text-muted-foreground font-medium">Search International and Domestic Flights</p>
      </div>
      <div className="mb-4 text-sm text-muted-foreground">
        {tripType === "round" ? "Round Trip" : "One Way"} • {totalTravellers} Traveller{totalTravellers > 1 ? "s" : ""} • {travelClass}
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="rounded-2xl border border-border bg-background overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 relative grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 border-b md:border-b-0 md:border-r border-border">
                <p className="text-sm text-muted-foreground mb-2">From</p>
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

              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-2">To</p>
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
                className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-border bg-card text-primary shadow"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-3 border-t lg:border-t-0 lg:border-l border-border">
              <div className="p-4 border-b md:border-b-0 md:border-r border-border">
                <p className="text-sm text-muted-foreground mb-2">Departure</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between p-0 text-left hover:bg-transparent"
                    >
                      <span className="text-lg font-bold text-foreground">
                        {date ? format(date, "dd MMM''yy") : "Select date"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-primary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-4" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="p-4 border-b md:border-b-0 md:border-r border-border">
                <p className="text-sm text-muted-foreground mb-2">Return</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between p-0 text-left hover:bg-transparent"
                    >
                      <span className="text-lg font-bold text-foreground">
                        {returnDate
                          ? date
                            ? `${format(date, "dd MMM'")}yy - ${format(returnDate, "dd MMM'")}yy`
                            : format(returnDate, "dd MMM''yy")
                          : tripType === "round"
                            ? "Add return"
                            : "Not needed"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-primary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus className="p-4" disabled={(d) => date ? d < date : false} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Travellers & Class</p>
                <Popover open={travellersOpen} onOpenChange={setTravellersOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between p-0 text-left hover:bg-transparent"
                    >
                      <span>
                        <span className="text-2xl font-bold text-foreground">{totalTravellers}</span>
                        <span className="text-foreground ml-1">Traveller{totalTravellers > 1 ? "s" : ""}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-primary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(92vw,420px)] p-4 space-y-4" align="end">
                    <div className="space-y-3">
                      {[{ label: "Adults", value: adults, min: 1, setter: setAdults }, { label: "Children", value: children, min: 0, setter: setChildren }, { label: "Infants", value: infants, min: 0, setter: setInfants }].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => updateCounter(item.setter, item.value - 1, item.min)}>−</Button>
                            <span className="w-6 text-center font-semibold">{item.value}</span>
                            <Button type="button" variant="outline" size="sm" onClick={() => updateCounter(item.setter, item.value + 1, item.min)}>+</Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Choose travel class</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Economy/Premium Economy", "Premium Economy", "Business", "First Class"].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={travelClass === value ? "default" : "outline"}
                            className="h-9"
                            onClick={() => setTravelClass(value)}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button type="button" className="w-full" onClick={() => setTravellersOpen(false)}>
                      Apply
                    </Button>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1">
                  <Users className="h-4 w-4" /> {travelClass}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="text-sm font-bold text-foreground w-full sm:w-auto">SPECIAL FARES</p>
            {["Regular", "Student", "Armed Forces", "Senior Citizen", "Doctor and Nurses"].map((fare, index) => (
              <button
                key={fare}
                type="button"
                onClick={() => setSelectedFare(fare)}
                className={cn(
                  "px-4 py-2 rounded-xl border text-sm font-medium",
                  selectedFare === fare
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground bg-background",
                )}
              >
                {fare}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 flex items-center justify-between flex-wrap gap-3">
          <label className="inline-flex items-center gap-3 text-foreground font-medium">
            <Checkbox checked={zeroCancellation} onCheckedChange={(checked) => setZeroCancellation(checked === true)} />
            Add Zero Cancellation
          </label>
          <p className="text-muted-foreground">Get 100% refund on cancellation</p>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            className="h-14 min-w-[260px] rounded-full text-3xl font-extrabold tracking-wide"
          >
            SEARCH
          </Button>
        </div>
      </form>
    </div>
  );
}
