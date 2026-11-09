import { useMutation, useQuery } from "@tanstack/react-query";

export interface ScraperOptions {
  method?: "serpapi" | "oxylabs" | "html" | "url";
  departure?: string;
  arrival?: string;
  outbound_date?: string;
  return_date?: string;
  url?: string;
  html?: string;
}

export interface ScraperFlight {
  id: string;
  price: number;
  time: string;
  airline: string;
  stops: number;
  duration?: string;
  fullDetail?: string;
}

export interface ScraperResponse {
  success: boolean;
  count: number;
  flights: ScraperFlight[];
  timestamp: string;
  method: string;
  error?: string;
}

/**
 * Hook for scraping flights with the scraper API
 */
export function useScrapeFlights() {
  return useMutation<ScraperResponse, Error, ScraperOptions>({
    mutationFn: async (options) => {
      const endpoint =
        options.method === "html"
          ? "/api/scraper/html"
          : "/api/scraper/google-flights";

      const body: Record<string, any> = {
        method: options.method || "serpapi",
      };

      if (options.departure) body.departure = options.departure;
      if (options.arrival) body.arrival = options.arrival;
      if (options.outbound_date) body.outbound_date = options.outbound_date;
      if (options.return_date) body.return_date = options.return_date;
      if (options.url) body.url = options.url;
      if (options.html) body.html = options.html;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Scraping failed");
      }

      return response.json();
    },
  });
}

/**
 * Hook for batch scraping multiple flights
 */
export function useBatchScrapeFlights() {
  return useMutation<
    { success: boolean; total: number; results: any[] },
    Error,
    { flights: ScraperOptions[]; method?: string }
  >({
    mutationFn: async ({ flights, method = "serpapi" }) => {
      const response = await fetch("/api/scraper/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flights, method }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Batch scraping failed");
      }

      return response.json();
    },
  });
}

/**
 * Hook for parsing Google Flights URLs
 */
export function useParseGoogleFlightsURL(url: string) {
  return useQuery({
    queryKey: ["parse-url", url],
    queryFn: async () => {
      const response = await fetch(
        `/api/scraper/parse-url?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error("Failed to parse URL");
      }

      return response.json();
    },
    enabled: !!url && url.includes("google.com/travel"),
  });
}

/**
 * Utility to format flight price
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * Utility to parse flight time (e.g., "8:00 AM → 11:30 AM")
 */
export function parseFlightTime(timeStr: string) {
  const [departure, arrival] = timeStr.split(" → ");
  return { departure: departure?.trim(), arrival: arrival?.trim() };
}

/**
 * Filter and sort flights
 */
export function filterFlights(
  flights: ScraperFlight[],
  options: {
    maxPrice?: number;
    maxStops?: number;
    airline?: string;
    sortBy?: "price" | "stops" | "time";
  }
): ScraperFlight[] {
  let filtered = [...flights];

  const maxPrice = options.maxPrice;
  if (maxPrice) {
    filtered = filtered.filter((f) => f.price <= maxPrice);
  }

  const maxStops = options.maxStops;
  if (maxStops !== undefined) {
    filtered = filtered.filter((f) => f.stops <= maxStops);
  }

  if (options.airline) {
    filtered = filtered.filter((f) =>
      f.airline.toLowerCase().includes(options.airline!.toLowerCase())
    );
  }

  // Sort
  if (options.sortBy === "price") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (options.sortBy === "stops") {
    filtered.sort((a, b) => a.stops - b.stops);
  }

  return filtered;
}

/**
 * Get best deals from flights
 */
export function getBestDeals(flights: ScraperFlight[]) {
  if (flights.length === 0) {
    return { cheapest: null, nonstop: null };
  }

  const cheapest = flights.reduce((min, f) =>
    f.price < min.price ? f : min
  );
  const nonstop = flights.find((f) => f.stops === 0);

  return { cheapest, nonstop };
}
