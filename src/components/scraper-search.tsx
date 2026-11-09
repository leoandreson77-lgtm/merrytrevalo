import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AirportAutocomplete } from "@/components/airport-autocomplete";
import { resolveAirportSuggestion } from "@/lib/airport-resolver";

type ScraperMethod = "serpapi" | "oxylabs" | "html" | "url";

export function ScraperSearch() {
  const [method, setMethod] = useState<ScraperMethod>("serpapi");
  const [formData, setFormData] = useState({
    departure: "",
    departureDisplay: "",
    arrival: "",
    arrivalDisplay: "",
    outbound_date: "",
    return_date: "",
    url: "",
    html: "",
  });

  const scrapeFlights = useMutation({
    mutationFn: async (variables: { departure: string; arrival: string }) => {
      const body: Record<string, any> = { method };
      const departure = variables.departure;
      const arrival = variables.arrival;

      switch (method) {
        case "serpapi":
          if (!departure || !arrival || !formData.outbound_date) {
            throw new Error("Please fill in all required fields");
          }
          body.departure = departure;
          body.arrival = arrival;
          body.outbound_date = formData.outbound_date;
          if (formData.return_date) body.return_date = formData.return_date;
          break;

        case "url":
          if (!formData.url) throw new Error("Please enter a Google Flights URL");
          body.url = formData.url;
          body.method = "oxylabs";
          break;

        case "html":
          if (!formData.html) throw new Error("Please enter HTML content");
          body.html = formData.html;
          break;

        case "oxylabs":
          if (!formData.url) throw new Error("Please enter a Google Flights URL");
          body.url = formData.url;
          body.method = "oxylabs";
          break;
      }

      const endpoint =
        method === "html"
          ? "/api/scraper/html"
          : "/api/scraper/google-flights";

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAirportChange = (field: "departure" | "arrival", code: string, displayText: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: code,
      [`${field}Display`]: displayText,
    }));
  };

  const handleSearch = async () => {
    const resolveAirportCode = async (currentCode: string, currentDisplay: string) => {
      if (currentCode) return currentCode;
      const airport = await resolveAirportSuggestion(currentDisplay, "airport");
      return String(airport?.code || "").trim();
    };

    const departure = await resolveAirportCode(formData.departure, formData.departureDisplay);
    const arrival = await resolveAirportCode(formData.arrival, formData.arrivalDisplay);

    if (!departure || !arrival) {
      return;
    }

    scrapeFlights.mutate({ departure, arrival });
  };

  return (
    <div className="w-full space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Flight Scraper</h2>

        <Tabs value={method} onValueChange={(v) => setMethod(v as ScraperMethod)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="serpapi">Search (SerpApi)</TabsTrigger>
            <TabsTrigger value="url">Google URL</TabsTrigger>
            <TabsTrigger value="oxylabs">Advanced</TabsTrigger>
            <TabsTrigger value="html">Parse HTML</TabsTrigger>
          </TabsList>

          {/* SerpApi Method */}
          <TabsContent value="serpapi" className="space-y-4">
            <p className="text-sm text-gray-600">
              Search for flights using airport codes and dates
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  From (Departure)
                </label>
                <AirportAutocomplete
                  value={formData.departure}
                  displayValue={formData.departureDisplay}
                  onChange={(code, displayText) => handleAirportChange("departure", code, displayText)}
                  placeholder="Search departure airport"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  To (Arrival)
                </label>
                <AirportAutocomplete
                  value={formData.arrival}
                  displayValue={formData.arrivalDisplay}
                  onChange={(code, displayText) => handleAirportChange("arrival", code, displayText)}
                  placeholder="Search arrival airport"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Departure Date *
                </label>
                <Input
                  type="date"
                  name="outbound_date"
                  value={formData.outbound_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Return Date (Optional)
                </label>
                <Input
                  type="date"
                  name="return_date"
                  value={formData.return_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </TabsContent>

          {/* URL Method */}
          <TabsContent value="url" className="space-y-4">
            <p className="text-sm text-gray-600">
              Paste a Google Flights URL to scrape with Oxylabs API
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                Google Flights URL
              </label>
              <textarea
                className="w-full p-3 border rounded-md font-mono text-sm"
                rows={4}
                placeholder="https://www.google.com/travel/flights/search?..."
                name="url"
                value={formData.url}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-2">
                Get URL from Google Flights by searching, then copy it here
              </p>
            </div>
          </TabsContent>

          {/* Oxylabs Method */}
          <TabsContent value="oxylabs" className="space-y-4">
            <p className="text-sm text-gray-600">
              Use Oxylabs premium API for advanced scraping
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                Google Flights URL
              </label>
              <textarea
                className="w-full p-3 border rounded-md font-mono text-sm"
                rows={4}
                placeholder="https://www.google.com/travel/flights/search?..."
                name="url"
                value={formData.url}
                onChange={handleInputChange}
              />
            </div>
            <Alert className="bg-blue-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Requires OXYLABS_USERNAME and OXYLABS_PASSWORD in .env
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* HTML Method */}
          <TabsContent value="html" className="space-y-4">
            <p className="text-sm text-gray-600">
              Parse raw HTML content for flight data
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                HTML Content
              </label>
              <textarea
                className="w-full p-3 border rounded-md font-mono text-xs"
                rows={6}
                placeholder="<html>...</html>"
                name="html"
                value={formData.html}
                onChange={handleInputChange}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {scrapeFlights.isError && (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {scrapeFlights.error instanceof Error
                ? scrapeFlights.error.message
                : "An error occurred"}
            </AlertDescription>
          </Alert>
        )}

        {/* Search Button */}
        <div className="mt-6">
          <Button
            onClick={handleSearch}
            disabled={scrapeFlights.isPending}
            className="w-full"
            size="lg"
          >
            {scrapeFlights.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {scrapeFlights.isPending ? "Scraping..." : "Search Flights"}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {scrapeFlights.data && (
        <ScraperResults data={scrapeFlights.data} />
      )}
    </div>
  );
}

function ScraperResults({ data }: { data: any }) {
  const { success, count, flights, method, timestamp, error } = data;

  if (!success || error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error || "Failed to scrape flights"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Found {count} Flights
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Method: {method} • {new Date(timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {flights.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No flights found</p>
        ) : (
          flights.map((flight: any, idx: number) => (
            <FlightCard key={idx} flight={flight} index={idx} />
          ))
        )}
      </div>
    </Card>
  );
}

function FlightCard({ flight, index }: { flight: any; index: number }) {
  const { price, time, airline, stops, duration } = flight;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{airline}</h4>
          <p className="text-gray-600 text-sm">{time}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">${price}</p>
          <p className="text-sm text-gray-600">{stops} stop{stops !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {duration && (
        <div className="text-sm text-gray-500 flex items-center gap-4">
          <span>Duration: {duration}</span>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
      >
        View Details
      </Button>
    </div>
  );
}
