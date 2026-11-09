import axios from "axios";
import { load } from "cheerio";

/**
 * Google Flights Web Scraper
 * Fetches and parses flight data from Google Flights URLs
 */

/**
 * Extract price from flight listing element
 */
function getPrice(element: any) {
  try {
    const priceText = element(".BVAVmf .YMlIz").text();
    const price = parseInt(priceText.replace(/[^0-9]/g, ""));
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

/**
 * Extract departure and arrival times from flight listing
 */
function getTime(element: any) {
  try {
    const timeContainer = element(".Ir0Voe .zxVSec");
    const times = timeContainer.find("span.eoY5cb").map((i: any, el: any) => {
      return element(el).text();
    }).get();
    return times.join(" → ");
  } catch {
    return null;
  }
}

/**
 * Extract airline name from flight listing
 */
function getAirline(element: any) {
  try {
    const airlineContainer = element(".Ir0Voe .sSHqwe");
    const airlines = airlineContainer.find("span").map((i: any, el: any) => {
      const text = element(el).text();
      return text.trim() ? text : null;
    }).get().filter(Boolean);
    return airlines.join("; ") || null;
  } catch {
    return null;
  }
}

/**
 * Extract number of stops from flight listing
 */
function getStops(element: any) {
  try {
    const stopsText = element(".Ir0Voe").text();
    const stopsMatch = stopsText.match(/(\d+)\s*stop/i);
    if (stopsMatch) return parseInt(stopsMatch[1]);
    
    // Check for nonstop
    if (stopsText.match(/nonstop/i)) return 0;
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse flight data from Google Flights HTML
 */
function extractFlightDataFromHtml(html: any) {
  const $ = load(html);
  const flights: any[] = [];

  // Find all flight listing containers
  const flightListings = $("li.pIav2d");

  if (flightListings.length === 0) {
    console.warn("No flight listings found on page");
    return flights;
  }

  flightListings.each((index: any, listing: any) => {
    const element = $(listing);
    const price = getPrice(element);
    const time = getTime(element);
    const airline = getAirline(element);
    const stops = getStops(element);

    if (price && time && airline) {
      flights.push({
        id: `flight_${index}`,
        price,
        time,
        airline,
        stops: stops !== null ? stops : -1,
        fullDetail: element.text(),
      });
    }
  });

  return flights;
}

/**
 * Scrape Google Flights using external API (Oxylabs or similar)
 */
async function scrapeWithOxylabsAPI(url: any, username: any, password: any) {
  if (!username || !password) {
    throw new Error("Oxylabs credentials not provided");
  }

  const payload = {
    source: "google",
    render: "html",
    url: url,
  };

  try {
    const response = await axios.post(
      "https://realtime.oxylabs.io/v1/queries",
      payload,
      {
        auth: {
          username,
          password,
        },
        timeout: 30000,
      }
    );

    const html = response.data?.results?.[0]?.content;
    if (!html) {
      throw new Error("No HTML content in Oxylabs response");
    }

    return extractFlightDataFromHtml(html);
  } catch (error: any) {
    console.error("Oxylabs API error:", error.message);
    throw error;
  }
}

/**
 * Scrape Google Flights using SerpApi
 */
async function scrapeWithSerpAPI(departure: any, arrival: any, outbound_date: any, return_date: any = null, apiKey: any) {
  if (!apiKey) {
    throw new Error("SerpApi key not provided");
  }

  try {
    const params: any = {
      api_key: apiKey,
      engine: "google_flights",
      departure_id: departure,
      arrival_id: arrival,
      outbound_date,
      type: return_date ? "2" : "1", // 1 for oneway, 2 for round trip
    };

    if (return_date) {
      params.return_date = return_date;
    }

    const response = await axios.get("https://serpapi.com/search", {
      params,
      timeout: 30000,
    });

    const flights: any[] = [];
    const flightsData = response.data?.best_flights || [];

    flightsData.forEach((flight: any, index: any) => {
      flights.push({
        id: `flight_${index}`,
        price: flight.price,
        time: `${flight.departure_time} → ${flight.arrival_time}`,
        airline: flight.airline || flight.airlines?.join(", "),
        stops: flight.stops || 0,
        duration: flight.duration,
        fullDetail: JSON.stringify(flight),
      });
    });

    return flights;
  } catch (error: any) {
    console.error("SerpApi error:", error.message);
    throw error;
  }
}

/**
 * Main scraper function - handles different scraping methods
 */
export async function scrapeFlights(options: any) {
  const {
    url,
    method = "oxylabs", // 'oxylabs', 'serpapi', or 'html'
    departure,
    arrival,
    outbound_date,
    return_date,
    oxylabs_username,
    oxylabs_password,
    serpapi_key,
    html_content,
  } = options;

  try {
    let flights: any[] = [];

    switch (method) {
      case "oxylabs":
        if (!url) throw new Error("URL required for Oxylabs scraping");
        flights = await scrapeWithOxylabsAPI(url, oxylabs_username, oxylabs_password);
        break;

      case "serpapi":
        if (!departure || !arrival || !outbound_date) {
          throw new Error("Departure, arrival, and outbound_date required for SerpApi");
        }
        flights = await scrapeWithSerpAPI(
          departure,
          arrival,
          outbound_date,
          return_date,
          serpapi_key
        );
        break;

      case "html":
        if (!html_content) throw new Error("HTML content required for direct parsing");
        flights = extractFlightDataFromHtml(html_content);
        break;

      default:
        throw new Error(`Unknown scraping method: ${method}`);
    }

    return {
      success: true,
      count: flights.length,
      flights,
      timestamp: new Date().toISOString(),
      method,
    };
  } catch (error: any) {
    console.error("Scraping error:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      method,
    };
  }
}

/**
 * Batch scrape multiple flight routes
 */
export async function scrapeMultipleFlights(flightConfigs: any, method = "oxylabs", credentials = {}) {
  const results: any[] = [];

  for (const config of flightConfigs) {
    const options = {
      ...config,
      method,
      ...credentials,
    };

    const result = await scrapeFlights(options);
    results.push({
      config,
      ...result,
    });
  }

  return results;
}

/**
 * Parse Google Flights URL to extract parameters
 */
export function parseGoogleFlightsURL(url: any) {
  try {
    const urlObj = new URL(url);
    const params: any = {};

    // Extract from query parameters using forEach to avoid downlevelIteration typescript issue
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return {
      url,
      params,
      valid: true,
    };
  } catch (error: any) {
    return {
      url,
      valid: false,
      error: error.message,
    };
  }
}
