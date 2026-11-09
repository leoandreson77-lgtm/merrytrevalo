import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "./db";



function normalizeCode(value: any) {
  return String(value || "").trim().toUpperCase();
}

function normalizeText(value: any) {
  return String(value || "").trim();
}

function normalizeForSearch(value: any) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "") // smart quotes
    .replace(/[^a-z0-9\s]/gi, " ") // replace punctuation with space
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: any) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isIataCode(value: any) {
  return /^[A-Z]{3}$/.test(normalizeCode(value));
}

function getAirportField(item: any, keys: any) {
  for (const key of keys) {
    const value = item?.[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function mapAirportDocument(item: any) {
  const code = normalizeCode(getAirportField(item, ["code", "iata_code", "iata", "airport_code", "iataCode"]));
  const name = getAirportField(item, ["name", "airport_name", "full_name", "airportName"]);
  const city = getAirportField(item, ["city", "municipality", "city_name", "cityName"]);
  const country = getAirportField(item, ["country", "country_name", "iso_country", "countryCode"]);
  const location = getAirportField(item, ["location"]) || [city, country].filter(Boolean).join(", ");

  return {
    code,
    iata_code: code,
    name,
    city,
    country,
    location,
    latitude: item?.latitude ?? item?.lat,
    longitude: item?.longitude ?? item?.lon,
  };
}

const METRO_CODE_MAP: Record<string, { metro: string; namePattern: string }> = {
  // London Airports
  LHR: { metro: "LON", namePattern: "Heathrow" },
  LGW: { metro: "LON", namePattern: "Gatwick" },
  LTN: { metro: "LON", namePattern: "Luton" },
  STN: { metro: "LON", namePattern: "Stansted" },
  LCY: { metro: "LON", namePattern: "City" },
  SEN: { metro: "LON", namePattern: "Southend" },

  // New York Airports
  JFK: { metro: "NYC", namePattern: "Kennedy" },
  LGA: { metro: "NYC", namePattern: "LaGuardia" },
  EWR: { metro: "NYC", namePattern: "Newark" },

  // Paris Airports
  CDG: { metro: "PAR", namePattern: "Charles de Gaulle" },
  ORY: { metro: "PAR", namePattern: "Orly" },

  // Tokyo Airports
  HND: { metro: "TYO", namePattern: "Haneda" },
  NRT: { metro: "TYO", namePattern: "Narita" },

  // Chicago Airports
  ORD: { metro: "CHI", namePattern: "O'Hare" },
  MDW: { metro: "CHI", namePattern: "Midway" },

  // Washington D.C. Airports
  IAD: { metro: "WAS", namePattern: "Dulles" },
  DCA: { metro: "WAS", namePattern: "Reagan" },
};

function buildAirportFilter(query: any) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return {};

  const upperQuery = String(query).trim().toUpperCase();
  const metroMapping = METRO_CODE_MAP[upperQuery];

  if (metroMapping) {
    const regexName = new RegExp(escapeRegExp(metroMapping.namePattern), "i");
    return {
      $or: [
        { code: metroMapping.metro, name: regexName },
        { iata_code: metroMapping.metro, name: regexName }
      ]
    };
  }

  const regex = new RegExp(escapeRegExp(normalizedQuery), "i");

  return {
    $or: [
      { code: regex },
      { iata_code: regex },
      { iata: regex },
      { airport_code: regex },
      { name: regex },
      { airport_name: regex },
      { full_name: regex },
      { city: regex },
      { municipality: regex },
      { city_name: regex },
      { country: regex },
      { country_name: regex },
      { iso_country: regex },
      { aliases: regex },
    ],
  };
}

function scoreAirportResult(item: any, query: any) {
  const normalizedQuery = normalizeForSearch(query);
  const normalizedCode = normalizeCode(query);

  const code = normalizeCode(item.code);
  const name = normalizeForSearch(item.name);
  const city = normalizeForSearch(item.city);

  if (code === normalizedCode) return -100;
  if (city === normalizedQuery) return -80;
  if (code.startsWith(normalizedCode)) return -50;
  if (city.startsWith(normalizedQuery)) return -30;
  if (name.startsWith(normalizedQuery)) return -20;
  if (name.includes(normalizedQuery)) return -10;
  return 0;
}

function matchesAllTokens(item: any, query: any) {
  const tokens = normalizeForSearch(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return false;

  const haystack = normalizeForSearch([item.code, item.name, item.city, item.country].filter(Boolean).join(" "));
  return tokens.every((token) => haystack.includes(token));
}

const CURATED_AIRPORTS = [
  { code: "DFW", iata_code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States", location: "Dallas, Texas, United States" },
  { code: "DAL", iata_code: "DAL", name: "Dallas Love Field Airport", city: "Dallas", country: "United States", location: "Dallas, Texas, United States" },
  { code: "MIA", iata_code: "MIA", name: "Miami International Airport", city: "Miami", country: "United States", location: "Miami, Florida, United States" },
  { code: "FLL", iata_code: "FLL", name: "Fort Lauderdale-Hollywood International Airport", city: "Fort Lauderdale", country: "United States", location: "Fort Lauderdale, Florida, United States" },
  { code: "JFK", iata_code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", location: "New York, NY, United States" },
  { code: "LGA", iata_code: "LGA", name: "LaGuardia Airport", city: "New York", country: "United States", location: "New York, NY, United States" },
  { code: "EWR", iata_code: "EWR", name: "Newark Liberty International Airport", city: "New York", country: "United States", location: "Newark, NJ, United States" },
  { code: "LAX", iata_code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", location: "Los Angeles, CA, United States" },
  { code: "ORD", iata_code: "ORD", name: "Chicago O'Hare International Airport", city: "Chicago", country: "United States", location: "Chicago, IL, United States" },
  { code: "MDW", iata_code: "MDW", name: "Chicago Midway International Airport", city: "Chicago", country: "United States", location: "Chicago, IL, United States" },
  { code: "SFO", iata_code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", location: "San Francisco, CA, United States" },
  { code: "LAS", iata_code: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States", location: "Las Vegas, NV, United States" },
  { code: "HNL", iata_code: "HNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "United States", location: "Honolulu, Hawaii, United States" },
  { code: "ATL", iata_code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", location: "Atlanta, GA, United States" },
  { code: "SEA", iata_code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", location: "Seattle, WA, United States" },
  { code: "BOS", iata_code: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "United States", location: "Boston, MA, United States" },
  { code: "DEN", iata_code: "DEN", name: "Denver International Airport", city: "Denver", country: "United States", location: "Denver, CO, United States" },
  { code: "PHX", iata_code: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States", location: "Phoenix, AZ, United States" },
  { code: "IAH", iata_code: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States", location: "Houston, TX, United States" },
  { code: "SAN", iata_code: "SAN", name: "San Diego International Airport", city: "San Diego", country: "United States", location: "San Diego, CA, United States" },
  { code: "MCO", iata_code: "MCO", name: "Orlando International Airport", city: "Orlando", country: "United States", location: "Orlando, FL, United States" },
  { code: "TPA", iata_code: "TPA", name: "Tampa International Airport", city: "Tampa", country: "United States", location: "Tampa, FL, United States" },
  { code: "LHR", iata_code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", location: "London, United Kingdom" },
  { code: "LGW", iata_code: "LGW", name: "London Gatwick Airport", city: "London", country: "United Kingdom", location: "London, United Kingdom" },
  { code: "DXB", iata_code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", location: "Dubai, UAE" },
  { code: "CDG", iata_code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", location: "Paris, France" },
  { code: "DEL", iata_code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", location: "New Delhi, India" },
  { code: "BOM", iata_code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", location: "Mumbai, India" },
  { code: "AUS", iata_code: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "United States", location: "Austin, Texas, United States" },
  { code: "SYD", iata_code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", location: "Sydney, NSW, Australia" },
  { code: "MEL", iata_code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", location: "Melbourne, VIC, Australia" },
  { code: "BNE", iata_code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", location: "Brisbane, QLD, Australia" },
  { code: "SIN", iata_code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", location: "Singapore" },
  { code: "HKG", iata_code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", location: "Hong Kong" },
];

async function fetchAirportDocuments(query: any) {
  let docs: any[] = [];
  try {
    const db = await getDb();
    const collection = db.collection("airports");
    docs = await collection.find(buildAirportFilter(query)).limit(200).toArray();
  } catch (e) {
    docs = [];
  }
  
  const mapped = docs.map(mapAirportDocument).filter((item) => isIataCode(item.code));

  // Search curated airports fallback as well
  const qNorm = normalizeForSearch(query);
  const qUpper = normalizeCode(query);
  const curatedMatches = CURATED_AIRPORTS.filter((a: any) => {
    const haystack = normalizeForSearch(`${a.code} ${a.name} ${a.city} ${a.country}`);
    const isMetroMatch =
      (qUpper === "NYC" && ["JFK", "LGA", "EWR", "NYC"].includes(a.code)) ||
      (qUpper === "LON" && ["LHR", "LGW", "STN"].includes(a.code)) ||
      (qUpper === "CHI" && ["ORD", "MDW"].includes(a.code)) ||
      (qUpper === "WAS" && ["IAD", "DCA"].includes(a.code));
    return haystack.includes(qNorm) || a.code === qUpper || isMetroMatch;
  });

  const combined = [...mapped, ...curatedMatches];
  return uniqueBy(combined, (a: any) => a.code);
}

async function searchAirportDocuments(query: any) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return [];

  const docs = await fetchAirportDocuments(normalizedQuery);
  const narrowed = docs.filter((item) => matchesAllTokens(item, query));
  const source = narrowed.length > 0 ? narrowed : docs;

  return source
    .sort((left, right) => scoreAirportResult(left, query) - scoreAirportResult(right, query) || left.code.localeCompare(right.code))
    .slice(0, 10);
}

function buildSearchTerms(item: any) {
  return [item.code, item.name, item.city, item.country, ...(Array.isArray(item.aliases) ? item.aliases : [])]
    .filter(Boolean)
    .map((value) => normalizeForSearch(value));
}

const CURATED_AIRLINES = [
  { code: "AA", name: "American Airlines", city: "Dallas", country: "United States", aliases: ["American", "American Airlines", "AA"] },
  { code: "BA", name: "British Airways", city: "London", country: "United Kingdom", aliases: ["British", "British Airways", "BA"] },
  { code: "EK", name: "Emirates", city: "Dubai", country: "United Arab Emirates", aliases: ["Emirates", "EK"] },
  { code: "EY", name: "Etihad Airways", city: "Abu Dhabi", country: "United Arab Emirates", aliases: ["Etihad", "Etihad Airways", "EY"] },
  { code: "FZ", name: "flydubai", city: "Dubai", country: "United Arab Emirates", aliases: ["flydubai", "Fly Dubai", "FZ"] },
  { code: "JL", name: "Japan Airlines", city: "Tokyo", country: "Japan", aliases: ["Japan Airlines", "JAL", "JL"] },
  { code: "LH", name: "Lufthansa", city: "Frankfurt", country: "Germany", aliases: ["Lufthansa", "LH"] },
  { code: "QR", name: "Qatar Airways", city: "Doha", country: "Qatar", aliases: ["Qatar", "Qatar Airways", "QR"] },
  { code: "SA", name: "South African Airways", city: "Johannesburg", country: "South Africa", aliases: ["South African", "South African Airways", "SA"] },
  { code: "SQ", name: "Singapore Airlines", city: "Singapore", country: "Singapore", aliases: ["Singapore Airlines", "SIA", "SQ"] },
  { code: "UA", name: "United Airlines", city: "Chicago", country: "United States", aliases: ["United", "United Airlines", "UA"] },
  { code: "WN", name: "Southwest Airlines", city: "Dallas", country: "United States", aliases: ["Southwest", "Southwest Airlines", "WN"] },
];

function parseIataAirlinesCsv() {
  const filePath = resolve(process.cwd(), "src/lib/data/iata_airlines.csv");
  if (!existsSync(filePath)) return [];

  const contents = readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  return lines.slice(1).flatMap((line) => {
    const parts = line.split("^");
    const code = normalizeCode(parts[0]);
    const icao = normalizeCode(parts[1]);
    const name = normalizeText(parts[2]);
    const alias = normalizeText(parts.slice(3).join("^") || "");

    if (!code || !name) return [];

    return [{
      code,
      name,
      city: "",
      country: "",
      aliases: [icao, alias, name, code].filter(Boolean),
    }];
  });
}

function dedupeAirlines(items: any) {
  const seen = new Set();
  return items.filter((item: any) => {
    const key = `${item.code || ""}|${item.name || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const AIRLINES = dedupeAirlines([...CURATED_AIRLINES, ...parseIataAirlinesCsv()]);

function scoreMatches(items: any, query: any) {
  const normalizedQuery = normalizeCode(query);
  const textQuery = normalizeText(query).toLowerCase();

  return items
    .map((item: any) => {
      const terms = buildSearchTerms(item);
      const exactMatch = terms.some((term) => term === textQuery || term === normalizedQuery);
      const prefixMatch = terms.some((term) => term.startsWith(textQuery) || term.startsWith(normalizedQuery));
      const containsMatch = terms.some((term) => term.includes(textQuery) || term.includes(normalizedQuery));
      const score = exactMatch ? 0 : prefixMatch ? 1 : containsMatch ? 2 : 3;
      return { item, score };
    })
    .sort((left: any, right: any) => left.score - right.score || left.item.code.localeCompare(right.item.code))
    .map(({ item }: any) => item);
}

function searchCatalog(query: any, catalog: any) {
  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery.length < 1) return [];

  const matches = catalog.filter((item: any) => {
    const haystack = normalizeForSearch(`${item.code} ${item.name} ${item.city} ${item.country || ""}`);
    return haystack.includes(normalizedQuery) || item.code.startsWith(normalizeCode(query));
  });

  const source = matches.length > 0 ? matches : catalog;
  return scoreMatches(source, normalizedQuery).slice(0, 10).map((item: any) => ({ ...item }));
}

export function searchAirports(query: any) {
  return searchMongoAirportsByQuery(query, "airport");
}

export function searchAirlines(query: any) {
  return searchCatalog(query, AIRLINES);
}

export async function searchIataCodesByType(query: any, type: string = "airport") {
  return type === "airline" ? searchAirlines(query) : searchAirports(query);
}

export async function suggestAirports(query: any) {
  return searchMongoAirportsByQuery(query, "airport");
}

export function suggestAirlines(query: any) {
  return searchAirlines(query);
}

function mapAirportForApi(airport: any) {
  return {
    code: airport.code || "",
    name: airport.name,
    city: airport.city || "",
    country: airport.country || "",
    location: [airport.city, airport.country].filter(Boolean).join(", "),
  };
}

function uniqueBy(items: any, keyBuilder: any) {
  const seen = new Set();
  const results = [];
  for (const item of items) {
    const key = keyBuilder(item);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item);
  }
  return results;
}

export async function searchMongoAirportsByQuery(query: any, scope: any = "airport") {
  const normalizedScope = String(scope || "airport").trim().toLowerCase();

  if (normalizedScope === "city") return searchMongoCities(query);
  if (normalizedScope === "country") return searchMongoCountries(query);

  return searchAirportDocuments(query);
}

export async function searchMongoCities(query: any) {
  const q = normalizeForSearch(query);
  if (!q) return [];

  const docs = await fetchAirportDocuments(q);
  const matches = docs.filter((airport: any) => airport.city);

  return uniqueBy(matches, (airport: any) => `${normalizeForSearch(airport.city)}|${normalizeForSearch(airport.country)}`)
    .map((airport: any) => ({
      city: airport.city || "",
      country: airport.country || "",
      location: [airport.city, airport.country].filter(Boolean).join(", "),
    }))
    .sort((a: any, b: any) => String(a.city).localeCompare(String(b.city)))
    .slice(0, 25);
}

export async function searchMongoCountries(query: any) {
  const q = normalizeForSearch(query);
  if (!q) return [];

  const docs = await fetchAirportDocuments(q);
  const matches = docs.filter((airport: any) => airport.country);

  return uniqueBy(matches, (airport: any) => normalizeForSearch(airport.country))
    .map((airport: any) => ({
      country: airport.country || "",
      countryCode: airport.country || "",
    }))
    .sort((a: any, b: any) => String(a.country).localeCompare(String(b.country)))
    .slice(0, 25);
}

export async function getAirportsByCountryCode(countryCode: any) {
  const raw = String(countryCode || "").trim();
  if (!raw) return [];

  const normalizedRaw = normalizeForSearch(raw);
  const normalizedCode = normalizeCode(raw);

  const db = await getDb();
  const collection = db.collection("airports");
  const docs = await collection.find({
    $or: [
      { country_code: normalizedCode },
      { iata_country_code: normalizedCode },
      { iso_country: normalizedCode },
      { countryCode: normalizedCode },
      { country: new RegExp(escapeRegExp(normalizedRaw), "i") },
      { country_name: new RegExp(escapeRegExp(normalizedRaw), "i") },
    ],
  }).limit(200).toArray();

  return docs
    .map(mapAirportDocument)
    .filter((item) => isIataCode(item.code));
}
