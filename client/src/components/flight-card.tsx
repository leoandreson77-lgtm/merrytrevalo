import { Plane, Info, BriefcaseBusiness, Clock, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Flight } from "@shared/schema";

function AirlineLogo({ code, name }: { code?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!code || failed) {
    return (
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Plane className="w-6 h-6 text-primary" />
      </div>
    );
  }
  return (
    <img
      src={`https://pics.avs.io/70/70/${code}.png`}
      alt={name}
      onError={() => setFailed(true)}
      className="w-12 h-12 rounded-full object-contain bg-white border border-border p-1 shrink-0"
    />
  );
}

interface FlightCardProps {
  flight: Flight & {
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
    };
  };
}

function formatPeriodTime(date: Date) {
  const hour = date.getHours();
  let period = "Night";
  if (hour >= 5 && hour < 12) period = "Morning";
  else if (hour >= 12 && hour < 17) period = "Afternoon";
  else if (hour >= 17 && hour < 21) period = "Evening";

  return `${period} ${format(date, "h:mm a")}`;
}

function formatPriceFromCents(price: number | undefined | null) {
  if (!Number.isFinite(Number(price))) return "Price unavailable";

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(price) / 100);
}

export function FlightCard({ flight }: FlightCardProps) {
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);
  const returnDepTime = flight.returnFlight ? new Date(flight.returnFlight.departureTime) : null;
  const returnArrTime = flight.returnFlight ? new Date(flight.returnFlight.arrivalTime) : null;
  const amenities = Array.isArray(flight.amenities) ? flight.amenities : [];
  const luggage = Array.isArray(flight.luggage) ? flight.luggage : [];

  const originLabel = flight.originName && flight.originName !== flight.origin
    ? `${flight.originName} (${flight.origin})`
    : flight.origin;
  const destinationLabel = flight.destinationName && flight.destinationName !== flight.destination
    ? `${flight.destinationName} (${flight.destination})`
    : flight.destination;
  const originCountryLabel = flight.originCountryName || "";
  const destinationCountryLabel = flight.destinationCountryName || "";
  const returnOriginLabel = flight.returnFlight
    ? flight.returnFlight.originName && flight.returnFlight.originName !== flight.returnFlight.origin
      ? `${flight.returnFlight.originName} (${flight.returnFlight.origin})`
      : flight.returnFlight.origin
    : "";
  const returnDestinationLabel = flight.returnFlight
    ? flight.returnFlight.destinationName && flight.returnFlight.destinationName !== flight.returnFlight.destination
      ? `${flight.returnFlight.destinationName} (${flight.returnFlight.destination})`
      : flight.returnFlight.destination
    : "";

  // Format price from cents (stored as USD * 100)
  const formattedPrice = formatPriceFromCents(flight.price);
  const passengerLabel = flight.passengers && flight.passengers > 1
    ? `Total for ${flight.passengers} passengers`
    : "Total for 1 passenger";
  const tripLabel = flight.tripType === "round" ? "Round Trip" : "One Way";
  const packageLabel = flight.packageType
    ? `${flight.packageType.charAt(0).toUpperCase()}${flight.packageType.slice(1)} Package`
    : "Solo Package";
  const isRoundTrip = flight.tripType === "round";

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        <div className="space-y-5">
          {/* Airline header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <AirlineLogo code={(flight as any).airlineCode} name={flight.airline} />
              <div>
                <h4 className="font-bold text-foreground text-lg leading-tight">{flight.airline}</h4>
                <p className="text-sm text-muted-foreground">Flight {flight.flightNumber}</p>
              </div>
            </div>
            <div className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              {flight.stops === 0 ? "Direct" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
            </div>
            <div
              className={cn(
                "text-xs font-semibold border rounded-full px-3 py-1",
                isRoundTrip
                  ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200",
              )}
            >
              {isRoundTrip ? "↔ Round Trip" : "→ One Way"} • {packageLabel}
            </div>
          </div>

          {/* Route timeline */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">{formatPeriodTime(depTime)}</p>
                <p className="text-sm font-semibold text-foreground truncate">{originLabel}</p>
                {originCountryLabel ? (
                  <p className="text-xs text-muted-foreground truncate">{originCountryLabel}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">Departure</p>
              </div>

              <div className="flex-1 px-3">
                <div className="w-full h-px bg-border relative">
                  <div className="w-2 h-2 rounded-full bg-border absolute -left-1 -top-0.5" />
                  <Plane className="w-4 h-4 text-primary absolute left-1/2 -translate-x-1/2 -top-2" />
                  <div className="w-2 h-2 rounded-full bg-border absolute -right-1 -top-0.5" />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">{flight.duration}</p>
              </div>

              <div className="min-w-0 text-right">
                <p className="text-2xl font-bold text-foreground">{formatPeriodTime(arrTime)}</p>
                <p className="text-sm font-semibold text-foreground truncate">{destinationLabel}</p>
                {destinationCountryLabel ? (
                  <p className="text-xs text-muted-foreground truncate">{destinationCountryLabel}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">Arrival</p>
              </div>
            </div>
          </div>

          {flight.returnFlight && returnDepTime && returnArrTime && (
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Return Flight</p>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-foreground">{formatPeriodTime(returnDepTime)}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{returnOriginLabel}</p>
                  <p className="text-xs text-muted-foreground">Departure</p>
                </div>

                <div className="flex-1 px-3">
                  <div className="w-full h-px bg-border relative">
                    <div className="w-2 h-2 rounded-full bg-border absolute -left-1 -top-0.5" />
                    <Plane className="w-4 h-4 text-primary absolute left-1/2 -translate-x-1/2 -top-2" />
                    <div className="w-2 h-2 rounded-full bg-border absolute -right-1 -top-0.5" />
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">{flight.returnFlight.duration}</p>
                </div>

                <div className="min-w-0 text-right">
                  <p className="text-2xl font-bold text-foreground">{formatPeriodTime(returnArrTime)}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{returnDestinationLabel}</p>
                  <p className="text-xs text-muted-foreground">Arrival</p>
                </div>
              </div>
            </div>
          )}

          {/* Full details rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="w-4 h-4" /> Travel Date
              </p>
              <p className="font-semibold text-foreground mt-1">{format(depTime, "EEE, dd MMM yyyy")}</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="flex items-center gap-2 text-muted-foreground font-medium">
                <Clock className="w-4 h-4" /> Total Duration
              </p>
              <p className="font-semibold text-foreground mt-1">{flight.duration}</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="flex items-center gap-2 text-muted-foreground font-medium">
                <MapPin className="w-4 h-4" /> Route
              </p>
              <p className="font-semibold text-foreground mt-1 truncate">{originLabel} to {destinationLabel}</p>
            </div>
          </div>

          {(amenities.length > 0 || luggage.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {amenities.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                    <Info className="w-3.5 h-3.5" /> Amenities ({amenities.length})
                  </p>
                  <div className="flex items-start gap-2 flex-wrap">
                    {amenities.map((item, index) => (
                      <span key={`amenity-${index}-${item}`} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground border border-border">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {luggage.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2">
                    <BriefcaseBusiness className="w-3.5 h-3.5" /> Luggage ({luggage.length})
                  </p>
                  <div className="flex items-start gap-2 flex-wrap">
                    {luggage.map((item, index) => (
                      <span key={`luggage-${index}-${item}`} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground border border-border">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price + action */}
        <div className="lg:w-[220px] flex flex-row lg:flex-col items-center justify-between lg:justify-center lg:border-l border-border lg:pl-6 pt-2 lg:pt-0 border-t lg:border-t-0">
          <div className="text-center lg:mb-4">
            <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">Total Price</p>
            <p className="text-3xl font-extrabold text-foreground leading-none">{formattedPrice}</p>
            <p className="text-xs text-muted-foreground mt-1">{passengerLabel}</p>
          </div>
          <Link href={`/book/${flight.id}`} className="w-full sm:w-auto lg:w-full">
            <Button className="w-full rounded-xl font-bold shadow-md hover:shadow-lg transition-all group-hover:-translate-y-0.5 px-8 py-6">
              View Full Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
