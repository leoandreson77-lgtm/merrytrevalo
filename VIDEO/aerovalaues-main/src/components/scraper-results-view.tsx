import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingDown, Zap } from "lucide-react";

interface ScraperFlightResult {
  id: string;
  price: number;
  time: string;
  airline: string;
  stops: number;
  duration?: string;
  fullDetail?: string;
}

interface ScraperFlightsGridProps {
  flights: ScraperFlightResult[];
  onSelectFlight?: (flight: ScraperFlightResult) => void;
  isLoading?: boolean;
}

export function ScraperFlightsGrid({
  flights,
  onSelectFlight,
  isLoading,
}: ScraperFlightsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-100 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No flights found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flights.map((flight) => (
        <Card
          key={flight.id}
          className="p-4 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onSelectFlight?.(flight)}
        >
          <div className="space-y-3">
            {/* Header with Price */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-600 truncate">
                  {flight.airline}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${flight.price}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="py-2 border-y">
              <p className="text-sm font-medium text-gray-800">
                {flight.time}
              </p>
              {flight.duration && (
                <p className="text-xs text-gray-500 mt-1">{flight.duration}</p>
              )}
            </div>

            {/* Stops Badge */}
            <div className="flex gap-2">
              {flight.stops === 0 ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Zap className="h-3 w-3 mr-1" />
                  Non-stop
                </Badge>
              ) : (
                <Badge variant="outline">
                  {flight.stops} Stop{flight.stops !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Select Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onSelectFlight?.(flight)}
            >
              Select
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ScraperFlightsList({
  flights,
  onSelectFlight,
}: {
  flights: ScraperFlightResult[];
  onSelectFlight?: (flight: ScraperFlightResult) => void;
}) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No flights found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flights.map((flight, idx) => (
        <Card
          key={flight.id}
          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onSelectFlight?.(flight)}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Flight Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-gray-800 truncate">
                    {flight.airline}
                  </p>
                  <p className="text-sm text-gray-600">{flight.time}</p>
                </div>
                {flight.duration && (
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {flight.duration}
                  </p>
                )}
              </div>
            </div>

            {/* Stops */}
            <div className="text-center text-sm">
              {flight.stops === 0 ? (
                <Badge className="bg-green-100 text-green-800">Non-stop</Badge>
              ) : (
                <Badge variant="outline">{flight.stops}S</Badge>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                ${flight.price}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFlight?.(flight);
                }}
              >
                Select
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ScraperComparisonTable({
  flights,
  onSelectFlight,
}: {
  flights: ScraperFlightResult[];
  onSelectFlight?: (flight: ScraperFlightResult) => void;
}) {
  if (flights.length === 0) {
    return <div className="text-gray-500 text-center py-8">No flights</div>;
  }

  // Sort by price
  const sorted = [...flights].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const fastest = [...flights].sort((a, b) => {
    const timeA = a.duration ? parseInt(a.duration) : 999;
    const timeB = b.duration ? parseInt(b.duration) : 999;
    return timeA - timeB;
  })[0];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold">Airline</th>
            <th className="px-4 py-3 text-left font-semibold">Time</th>
            <th className="px-4 py-3 text-left font-semibold">Duration</th>
            <th className="px-4 py-3 text-left font-semibold">Stops</th>
            <th className="px-4 py-3 text-right font-semibold">Price</th>
            <th className="px-4 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr
              key={flight.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 font-medium">{flight.airline}</td>
              <td className="px-4 py-3">{flight.time}</td>
              <td className="px-4 py-3">{flight.duration || "—"}</td>
              <td className="px-4 py-3">
                {flight.stops === 0 ? (
                  <Badge className="bg-green-100 text-green-800">
                    Nonstop
                  </Badge>
                ) : (
                  <Badge variant="outline">{flight.stops}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right font-bold text-blue-600">
                ${flight.price}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectFlight?.(flight)}
                >
                  Book
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Best Deals */}
      {cheapest && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Cheapest
              </p>
              <p className="text-lg font-bold text-blue-600">
                ${cheapest.price}
              </p>
              <p className="text-sm text-gray-700">{cheapest.airline}</p>
            </div>
            {fastest && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Fastest
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {fastest.duration}
                </p>
                <p className="text-sm text-gray-700">{fastest.airline}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
