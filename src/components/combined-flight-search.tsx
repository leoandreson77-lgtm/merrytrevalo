import { useMemo } from "react";
import { useSearchFlights } from "@/hooks/use-flights";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CombinedSearchProps {
  origin: string;
  destination: string;
  date: Date | undefined;
  returnDate?: Date | undefined;
  tripType: "oneway" | "round";
  passengers: number;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  packageType?: string;
}

export function CombinedFlightSearch({
  origin,
  destination,
  date,
  returnDate,
  tripType,
  passengers,
  adults,
  children,
  infants,
  travelClass,
  packageType,
  onOpenFilters,
}: CombinedSearchProps & { onOpenFilters?: () => void }) {
  // Unified search result from backend aggregation layer
  const {
    data: flights,
    isLoading: isLoadingAmadeus,
    error: amadeusError,
  } = useSearchFlights(
    {
      origin,
      destination,
      date: date ? date.toISOString().split("T")[0] : undefined,
      returnDate: returnDate ? returnDate.toISOString().split("T")[0] : undefined,
      tripType,
      packageType,
      passengers: String(passengers),
      adults: adults !== undefined ? String(adults) : undefined,
      children: children !== undefined ? String(children) : undefined,
      infants: infants !== undefined ? String(infants) : undefined,
      travelClass,
    } as any,
  );

  const totalFlights = useMemo(() => flights?.length || 0, [flights]);
  const apiPreview = useMemo(() => {
    if (!flights || flights.length === 0) return null;

    const typedFlights = flights as any[];
    const sources = Array.from(new Set(typedFlights.map((flight) => flight?.source || "amadeus")));

    return {
      count: flights.length,
      sources,
      primaryFlight: typedFlights[0] || null,
      sample: typedFlights.slice(0, 2),
    };
  }, [flights]);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        {isLoadingAmadeus && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        )}

        {amadeusError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading flights
            </AlertDescription>
          </Alert>
        )}

        {flights && flights.length === 0 && !isLoadingAmadeus && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No flights found. Try adjusting your search criteria.
            </AlertDescription>
          </Alert>
        )}

        {flights && flights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Found {flights.length} flights</p>
              {onOpenFilters ? (
                <Button variant="ghost" className="sm:hidden p-2" onClick={onOpenFilters} aria-label="Open filters">
                  <Sliders className="w-5 h-5" />
                </Button>
              ) : null}
            </div>

            {/* API response preview removed per request */}

            {/* Main flight cards are rendered by SearchResultsPage below this section. */}
          </div>
        )}
      </div>
    </div>
  );
}

export default CombinedFlightSearch;
