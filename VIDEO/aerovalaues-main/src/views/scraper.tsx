import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ScraperFlightsGrid,
  ScraperFlightsList,
  ScraperComparisonTable,
} from "@/components/scraper-results-view";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Calendar,
} from "lucide-react";

type ViewMode = "grid" | "list" | "table";

export function ScraperPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [method, setMethod] = useState<"serpapi" | "url">("serpapi");
  const [formData, setFormData] = useState({
    departure: "",
    arrival: "",
    outbound_date: "",
    return_date: "",
    url: "",
  });

  const scrapeFlights = useMutation({
    mutationFn: async () => {
      const body: Record<string, any> = { method };

      if (method === "serpapi") {
        if (
          !formData.departure ||
          !formData.arrival ||
          !formData.outbound_date
        ) {
          throw new Error("Please fill in all required fields");
        }
        body.departure = formData.departure;
        body.arrival = formData.arrival;
        body.outbound_date = formData.outbound_date;
        if (formData.return_date) body.return_date = formData.return_date;
      } else {
        if (!formData.url) throw new Error("Please enter a valid URL");
        body.url = formData.url;
        body.method = "oxylabs";
      }

      const response = await fetch("/api/scraper/google-flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Scraping failed");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    scrapeFlights.mutate();
  };

  const flightData = scrapeFlights.data?.flights || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Flight Scraper</h1>
          <p className="text-gray-600">
            Search real-time flight data from Google Flights
          </p>
        </div>

        {/* Search Card */}
        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Method Selection */}
            <div>
              <h3 className="font-semibold mb-4">Search Method</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="serpapi"
                    checked={method === "serpapi"}
                    onChange={(e) => setMethod(e.target.value as "serpapi")}
                  />
                  <span className="text-sm">Quick Search (SerpApi)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="url"
                    checked={method === "url"}
                    onChange={(e) => setMethod(e.target.value as "url")}
                  />
                  <span className="text-sm">Google Flights URL</span>
                </label>
              </div>
            </div>

            {/* Input Fields */}
            {method === "serpapi" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    From *
                  </label>
                  <Input
                    placeholder="NYC, LAX, LHR..."
                    name="departure"
                    value={formData.departure}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">To *</label>
                  <Input
                    placeholder="NYC, LAX, CDG..."
                    name="arrival"
                    value={formData.arrival}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Depart *
                  </label>
                  <Input
                    type="date"
                    name="outbound_date"
                    value={formData.outbound_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Return
                  </label>
                  <Input
                    type="date"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Google Flights URL *
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg font-mono text-sm"
                  rows={3}
                  placeholder="https://www.google.com/travel/flights/search?..."
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {/* Error Message */}
            {scrapeFlights.isError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {scrapeFlights.error instanceof Error
                    ? scrapeFlights.error.message
                    : "An error occurred"}
                </AlertDescription>
              </Alert>
            )}

            {/* Search Button */}
            <Button
              type="submit"
              disabled={scrapeFlights.isPending}
              className="w-full"
              size="lg"
            >
              {scrapeFlights.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {scrapeFlights.isPending ? "Searching..." : "Search Flights"}
            </Button>
          </form>
        </Card>

        {/* Results */}
        {scrapeFlights.data && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  {flightData.length} Flights Found
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(scrapeFlights.data.timestamp).toLocaleString()}
                </p>
              </div>
              {flightData.length > 0 && (
                <div className="space-y-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 cursor-pointer"
                  >
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Method: {scrapeFlights.data.method}
                  </Badge>
                </div>
              )}
            </div>

            {/* View Mode Tabs */}
            {flightData.length > 0 && (
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as ViewMode)}
                defaultValue="grid"
              >
                <TabsList className="grid w-full max-w-xs grid-cols-3">
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="grid">
                    <ScraperFlightsGrid flights={flightData} />
                  </TabsContent>

                  <TabsContent value="list">
                    <ScraperFlightsList flights={flightData} />
                  </TabsContent>

                  <TabsContent value="table">
                    <ScraperComparisonTable flights={flightData} />
                  </TabsContent>
                </div>
              </Tabs>
            )}

            {/* Empty State */}
            {flightData.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No flights found. Try adjusting your search criteria.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Info Cards */}
        {!scrapeFlights.data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard
              icon={<Calendar className="h-6 w-6" />}
              title="Real-Time Data"
              description="Get live flight information from Google Flights"
            />
            <InfoCard
              icon={<TrendingDown className="h-6 w-6" />}
              title="Best Prices"
              description="Compare prices across multiple airlines instantly"
            />
            <InfoCard
              icon={<AlertCircle className="h-6 w-6" />}
              title="Multiple Methods"
              description="Choose between SerpApi or URL-based scraping"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 text-center">
      <div className="flex justify-center mb-4 text-blue-600">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Card>
  );
}
