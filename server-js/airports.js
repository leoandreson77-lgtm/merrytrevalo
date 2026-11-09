import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeForSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "") // smart quotes
    .replace(/[^a-z0-9\s]/gi, " ") // replace punctuation with space
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isIataCode(value) {
  return /^[A-Z]{3}$/.test(normalizeCode(value));
}

function getAirportField(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function mapAirportDocument(item) {
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

function buildAirportFilter(query) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return {};

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

function scoreAirportResult(item, query) {
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

function matchesAllTokens(item, query) {
  const tokens = normalizeForSearch(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return false;

  const haystack = normalizeForSearch([item.code, item.name, item.city, item.country].filter(Boolean).join(" "));
  return tokens.every((token) => haystack.includes(token));
}

async function fetchAirportDocuments(query) {
  const db = await getDb();
  const collection = db.collection("airports");
  const docs = await collection.find(buildAirportFilter(query)).limit(200).toArray();
  return docs.map(mapAirportDocument).filter((item) => isIataCode(item.code));
}

async function searchAirportDocuments(query) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return [];

  const docs = await fetchAirportDocuments(normalizedQuery);
  const narrowed = docs.filter((item) => matchesAllTokens(item, query));
  const source = narrowed.length > 0 ? narrowed : docs;

  return source
    .sort((left, right) => scoreAirportResult(left, query) - scoreAirportResult(right, query) || left.code.localeCompare(right.code))
    .slice(0, 10);
}

function buildSearchTerms(item) {
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
  { code: "DEL", iata_code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", location: "New Delhi, India" },
  { code: "BOM", iata_code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", location: "Mumbai, India" },
  { code: "AUS", iata_code: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "United States", location: "Austin, Texas, United States" },
  { code: "SYD", iata_code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", location: "Sydney, NSW, Australia" },
  { code: "MEL", iata_code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", location: "Melbourne, VIC, Australia" },
  { code: "BNE", iata_code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", location: "Brisbane, QLD, Australia" },
  { code: "SIN", iata_code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", location: "Singapore" },
  { code: "HKG", iata_code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", location: "Hong Kong" },
  { code: "LH", name: "Lufthansa", city: "Frankfurt", country: "Germany", aliases: ["Lufthansa", "LH"] },
  { code: "QR", name: "Qatar Airways", city: "Doha", country: "Qatar", aliases: ["Qatar", "Qatar Airways", "QR"] },
  { code: "SA", name: "South African Airways", city: "Johannesburg", country: "South Africa", aliases: ["South African", "South African Airways", "SA"] },
  { code: "SQ", name: "Singapore Airlines", city: "Singapore", country: "Singapore", aliases: ["Singapore Airlines", "SIA", "SQ"] },
  { code: "UA", name: "United Airlines", city: "Chicago", country: "United States", aliases: ["United", "United Airlines", "UA"] },
  { code: "WN", name: "Southwest Airlines", city: "Dallas", country: "United States", aliases: ["Southwest", "Southwest Airlines", "WN"] },
];

function parseIataAirlinesCsv() {
  const filePath = resolve(__dirname, "data", "iata_airlines.csv");
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

function dedupeAirlines(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.code || ""}|${item.name || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const AIRLINES = dedupeAirlines([...CURATED_AIRLINES, ...parseIataAirlinesCsv()]);

function scoreMatches(items, query) {
  const normalizedQuery = normalizeCode(query);
  const textQuery = normalizeText(query).toLowerCase();

  return items
    .map((item) => {
      const terms = buildSearchTerms(item);
      const exactMatch = terms.some((term) => term === textQuery || term === normalizedQuery);
      const prefixMatch = terms.some((term) => term.startsWith(textQuery) || term.startsWith(normalizedQuery));
      const containsMatch = terms.some((term) => term.includes(textQuery) || term.includes(normalizedQuery));
      const score = exactMatch ? 0 : prefixMatch ? 1 : containsMatch ? 2 : 3;
      return { item, score };
    })
    .sort((left, right) => left.score - right.score || left.item.code.localeCompare(right.item.code))
    .map(({ item }) => item);
}

function searchCatalog(query, catalog) {
  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery.length < 1) return [];

  const matches = catalog.filter((item) => {
    const haystack = normalizeForSearch(`${item.code} ${item.name} ${item.city} ${item.country || ""}`);
    return haystack.includes(normalizedQuery) || item.code.startsWith(normalizeCode(query));
  });

  const source = matches.length > 0 ? matches : catalog;
  return scoreMatches(source, normalizedQuery).slice(0, 10).map((item) => ({ ...item }));
}

export function searchAirports(query) {
  return searchMongoAirportsByQuery(query, "airport");
}

export function searchAirlines(query) {
  return searchCatalog(query, AIRLINES);
}

export async function searchIataCodesByType(query, type = "airport") {
  return type === "airline" ? searchAirlines(query) : searchAirports(query);
}

export async function suggestAirports(query) {
  return searchMongoAirportsByQuery(query, "airport");
}

export function suggestAirlines(query) {
  return searchAirlines(query);
}

function mapAirportForApi(airport) {
  return {
    code: airport.code || "",
    name: airport.name,
    city: airport.city || "",
    country: airport.country || "",
    location: [airport.city, airport.country].filter(Boolean).join(", "),
  };
}

function uniqueBy(items, keyBuilder) {
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

export async function searchMongoAirportsByQuery(query, scope = "airport") {
  const normalizedScope = String(scope || "airport").trim().toLowerCase();

  if (normalizedScope === "city") return searchMongoCities(query);
  if (normalizedScope === "country") return searchMongoCountries(query);

  return searchAirportDocuments(query);
}

export async function searchMongoCities(query) {
  const q = normalizeForSearch(query);
  if (!q) return [];

  const docs = await fetchAirportDocuments(q);
  const matches = docs.filter((airport) => airport.city);

  return uniqueBy(matches, (airport) => `${normalizeForSearch(airport.city)}|${normalizeForSearch(airport.country)}`)
    .map((airport) => ({
      city: airport.city || "",
      country: airport.country || "",
      location: [airport.city, airport.country].filter(Boolean).join(", "),
    }))
    .sort((a, b) => String(a.city).localeCompare(String(b.city)))
    .slice(0, 25);
}

export async function searchMongoCountries(query) {
  const q = normalizeForSearch(query);
  if (!q) return [];

  const docs = await fetchAirportDocuments(q);
  const matches = docs.filter((airport) => airport.country);

  return uniqueBy(matches, (airport) => normalizeForSearch(airport.country))
    .map((airport) => ({
      country: airport.country || "",
      countryCode: airport.country || "",
    }))
    .sort((a, b) => String(a.country).localeCompare(String(b.country)))
    .slice(0, 25);
}

export async function getAirportsByCountryCode(countryCode) {
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
