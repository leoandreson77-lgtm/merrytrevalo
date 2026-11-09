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

const METRO_CITY_AIRPORTS: Record<string, string[]> = {
  WAS: ["IAD", "DCA", "BWI"],
  NYC: ["JFK", "LGA", "EWR"],
  LON: ["LHR", "LGW", "STN", "LTN", "LCY", "SEN"],
  PAR: ["CDG", "ORY"],
  CHI: ["ORD", "MDW"],
  TYO: ["HND", "NRT"],
  MIA: ["MIA", "FLL", "PBI"],
  DFW: ["DFW", "DAL"],
  OSA: ["KIX", "ITM"],
  SEL: ["ICN", "GMP"],
  BJS: ["PEK", "PKX"],
  MOW: ["SVO", "DME", "VKO"],
  ROM: ["FCO", "CIA"],
  MIL: ["MXP", "LIN", "BGY"],
  RIO: ["GIG", "SDU"],
  SAO: ["GRU", "CGH", "VCP"],
};

function buildAirportFilter(query: any) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return {};

  const upperQuery = String(query).trim().toUpperCase();
  const metroAirports = METRO_CITY_AIRPORTS[upperQuery];

  if (metroAirports && metroAirports.length > 0) {
    return {
      $or: [
        { code: { $in: metroAirports } },
        { iata_code: { $in: metroAirports } },
        { code: upperQuery },
        { iata_code: upperQuery },
        { city: new RegExp(escapeRegExp(normalizedQuery), "i") },
        { name: new RegExp(escapeRegExp(normalizedQuery), "i") },
      ],
    };
  }

  const regex = new RegExp(escapeRegExp(normalizedQuery), "i");

  return {
    $or: [
      { code: upperQuery },
      { iata_code: upperQuery },
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
  // Washington D.C. & Mid-Atlantic
  { code: "IAD", iata_code: "IAD", name: "Washington Dulles International Airport", city: "Washington", country: "United States", location: "Washington, D.C., United States" },
  { code: "DCA", iata_code: "DCA", name: "Ronald Reagan Washington National Airport", city: "Washington", country: "United States", location: "Washington, D.C., United States" },
  { code: "BWI", iata_code: "BWI", name: "Baltimore/Washington International Thurgood Marshall Airport", city: "Baltimore", country: "United States", location: "Baltimore / Washington, D.C., United States" },
  { code: "PHL", iata_code: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States", location: "Philadelphia, PA, United States" },
  { code: "PIT", iata_code: "PIT", name: "Pittsburgh International Airport", city: "Pittsburgh", country: "United States", location: "Pittsburgh, PA, United States" },
  { code: "RIC", iata_code: "RIC", name: "Richmond International Airport", city: "Richmond", country: "United States", location: "Richmond, VA, United States" },
  { code: "ORF", iata_code: "ORF", name: "Norfolk International Airport", city: "Norfolk", country: "United States", location: "Norfolk, VA, United States" },

  // New York & Northeast USA
  { code: "JFK", iata_code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", location: "New York, NY, United States" },
  { code: "LGA", iata_code: "LGA", name: "LaGuardia Airport", city: "New York", country: "United States", location: "New York, NY, United States" },
  { code: "EWR", iata_code: "EWR", name: "Newark Liberty International Airport", city: "New York", country: "United States", location: "Newark, NJ, United States" },
  { code: "BOS", iata_code: "BOS", name: "Boston Logan International Airport", city: "Boston", country: "United States", location: "Boston, MA, United States" },
  { code: "BUF", iata_code: "BUF", name: "Buffalo Niagara International Airport", city: "Buffalo", country: "United States", location: "Buffalo, NY, United States" },
  { code: "BDL", iata_code: "BDL", name: "Bradley International Airport", city: "Hartford", country: "United States", location: "Hartford, CT, United States" },
  { code: "PVD", iata_code: "PVD", name: "Rhode Island T. F. Green International Airport", city: "Providence", country: "United States", location: "Providence, RI, United States" },

  // Southeast USA & Florida
  { code: "ATL", iata_code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", location: "Atlanta, GA, United States" },
  { code: "MIA", iata_code: "MIA", name: "Miami International Airport", city: "Miami", country: "United States", location: "Miami, FL, United States" },
  { code: "FLL", iata_code: "FLL", name: "Fort Lauderdale-Hollywood International Airport", city: "Fort Lauderdale", country: "United States", location: "Fort Lauderdale, FL, United States" },
  { code: "MCO", iata_code: "MCO", name: "Orlando International Airport", city: "Orlando", country: "United States", location: "Orlando, FL, United States" },
  { code: "TPA", iata_code: "TPA", name: "Tampa International Airport", city: "Tampa", country: "United States", location: "Tampa, FL, United States" },
  { code: "PBI", iata_code: "PBI", name: "Palm Beach International Airport", city: "West Palm Beach", country: "United States", location: "West Palm Beach, FL, United States" },
  { code: "RSW", iata_code: "RSW", name: "Southwest Florida International Airport", city: "Fort Myers", country: "United States", location: "Fort Myers, FL, United States" },
  { code: "JAX", iata_code: "JAX", name: "Jacksonville International Airport", city: "Jacksonville", country: "United States", location: "Jacksonville, FL, United States" },
  { code: "CLT", iata_code: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "United States", location: "Charlotte, NC, United States" },
  { code: "RDU", iata_code: "RDU", name: "Raleigh-Durham International Airport", city: "Raleigh", country: "United States", location: "Raleigh / Durham, NC, United States" },
  { code: "CHS", iata_code: "CHS", name: "Charleston International Airport", city: "Charleston", country: "United States", location: "Charleston, SC, United States" },

  // Midwest USA
  { code: "ORD", iata_code: "ORD", name: "Chicago O'Hare International Airport", city: "Chicago", country: "United States", location: "Chicago, IL, United States" },
  { code: "MDW", iata_code: "MDW", name: "Chicago Midway International Airport", city: "Chicago", country: "United States", location: "Chicago, IL, United States" },
  { code: "DTW", iata_code: "DTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", country: "United States", location: "Detroit, MI, United States" },
  { code: "MSP", iata_code: "MSP", name: "Minneapolis-Saint Paul International Airport", city: "Minneapolis", country: "United States", location: "Minneapolis, MN, United States" },
  { code: "STL", iata_code: "STL", name: "St. Louis Lambert International Airport", city: "St. Louis", country: "United States", location: "St. Louis, MO, United States" },
  { code: "MCI", iata_code: "MCI", name: "Kansas City International Airport", city: "Kansas City", country: "United States", location: "Kansas City, MO, United States" },
  { code: "CLE", iata_code: "CLE", name: "Cleveland Hopkins International Airport", city: "Cleveland", country: "United States", location: "Cleveland, OH, United States" },
  { code: "CMH", iata_code: "CMH", name: "John Glenn Columbus International Airport", city: "Columbus", country: "United States", location: "Columbus, OH, United States" },
  { code: "CVG", iata_code: "CVG", name: "Cincinnati/Northern Kentucky International Airport", city: "Cincinnati", country: "United States", location: "Cincinnati, OH, United States" },
  { code: "IND", iata_code: "IND", name: "Indianapolis International Airport", city: "Indianapolis", country: "United States", location: "Indianapolis, IN, United States" },
  { code: "MKE", iata_code: "MKE", name: "Milwaukee Mitchell International Airport", city: "Milwaukee", country: "United States", location: "Milwaukee, WI, United States" },

  // South & Texas
  { code: "DFW", iata_code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States", location: "Dallas, TX, United States" },
  { code: "DAL", iata_code: "DAL", name: "Dallas Love Field Airport", city: "Dallas", country: "United States", location: "Dallas, TX, United States" },
  { code: "IAH", iata_code: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States", location: "Houston, TX, United States" },
  { code: "HOU", iata_code: "HOU", name: "William P. Hobby Airport", city: "Houston", country: "United States", location: "Houston, TX, United States" },
  { code: "AUS", iata_code: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", country: "United States", location: "Austin, TX, United States" },
  { code: "SAT", iata_code: "SAT", name: "San Antonio International Airport", city: "San Antonio", country: "United States", location: "San Antonio, TX, United States" },
  { code: "BNA", iata_code: "BNA", name: "Nashville International Airport", city: "Nashville", country: "United States", location: "Nashville, TN, United States" },
  { code: "MEM", iata_code: "MEM", name: "Memphis International Airport", city: "Memphis", country: "United States", location: "Memphis, TN, United States" },
  { code: "MSY", iata_code: "MSY", name: "Louis Armstrong New Orleans International Airport", city: "New Orleans", country: "United States", location: "New Orleans, LA, United States" },

  // West Coast & Mountain USA
  { code: "LAX", iata_code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", location: "Los Angeles, CA, United States" },
  { code: "SFO", iata_code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", location: "San Francisco, CA, United States" },
  { code: "SAN", iata_code: "SAN", name: "San Diego International Airport", city: "San Diego", country: "United States", location: "San Diego, CA, United States" },
  { code: "SJC", iata_code: "SJC", name: "Norman Y. Mineta San Jose International Airport", city: "San Jose", country: "United States", location: "San Jose, CA, United States" },
  { code: "OAK", iata_code: "OAK", name: "San Francisco Bay Oakland International Airport", city: "Oakland", country: "United States", location: "Oakland, CA, United States" },
  { code: "SNA", iata_code: "SNA", name: "John Wayne Airport", city: "Santa Ana", country: "United States", location: "Orange County / Santa Ana, CA, United States" },
  { code: "SMF", iata_code: "SMF", name: "Sacramento International Airport", city: "Sacramento", country: "United States", location: "Sacramento, CA, United States" },
  { code: "SEA", iata_code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", location: "Seattle, WA, United States" },
  { code: "PDX", iata_code: "PDX", name: "Portland International Airport", city: "Portland", country: "United States", location: "Portland, OR, United States" },
  { code: "LAS", iata_code: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "United States", location: "Las Vegas, NV, United States" },
  { code: "PHX", iata_code: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States", location: "Phoenix, AZ, United States" },
  { code: "DEN", iata_code: "DEN", name: "Denver International Airport", city: "Denver", country: "United States", location: "Denver, CO, United States" },
  { code: "SLC", iata_code: "SLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "United States", location: "Salt Lake City, UT, United States" },

  // Hawaii & Alaska & Overseas US
  { code: "HNL", iata_code: "HNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "United States", location: "Honolulu, Hawaii, United States" },
  { code: "OGG", iata_code: "OGG", name: "Kahului Airport", city: "Kahului", country: "United States", location: "Maui / Kahului, Hawaii, United States" },
  { code: "KOA", iata_code: "KOA", name: "Ellison Onizuka Kona International Airport", city: "Kona", country: "United States", location: "Kona, Hawaii, United States" },
  { code: "LIH", iata_code: "LIH", name: "Lihue Airport", city: "Lihue", country: "United States", location: "Kauai / Lihue, Hawaii, United States" },
  { code: "ANC", iata_code: "ANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", country: "United States", location: "Anchorage, Alaska, United States" },
  { code: "SJU", iata_code: "SJU", name: "Luis Muñoz Marín International Airport", city: "San Juan", country: "Puerto Rico", location: "San Juan, Puerto Rico" },

  // Canada
  { code: "YYZ", iata_code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", location: "Toronto, Ontario, Canada" },
  { code: "YVR", iata_code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", location: "Vancouver, BC, Canada" },
  { code: "YUL", iata_code: "YUL", name: "Montréal-Trudeau International Airport", city: "Montreal", country: "Canada", location: "Montreal, Quebec, Canada" },
  { code: "YYC", iata_code: "YYC", name: "Calgary International Airport", city: "Calgary", country: "Canada", location: "Calgary, Alberta, Canada" },
  { code: "YEG", iata_code: "YEG", name: "Edmonton International Airport", city: "Edmonton", country: "Canada", location: "Edmonton, Alberta, Canada" },
  { code: "YOW", iata_code: "YOW", name: "Ottawa Macdonald-Cartier International Airport", city: "Ottawa", country: "Canada", location: "Ottawa, Ontario, Canada" },

  // Mexico & Latin America
  { code: "MEX", iata_code: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", location: "Mexico City, Mexico" },
  { code: "CUN", iata_code: "CUN", name: "Cancún International Airport", city: "Cancun", country: "Mexico", location: "Cancun, Mexico" },
  { code: "GDL", iata_code: "GDL", name: "Guadalajara International Airport", city: "Guadalajara", country: "Mexico", location: "Guadalajara, Mexico" },
  { code: "PVR", iata_code: "PVR", name: "Lic. Gustavo Díaz Ordaz International Airport", city: "Puerto Vallarta", country: "Mexico", location: "Puerto Vallarta, Mexico" },
  { code: "SJO", iata_code: "SJO", name: "Juan Santamaría International Airport", city: "San Jose", country: "Costa Rica", location: "San Jose, Costa Rica" },
  { code: "PTY", iata_code: "PTY", name: "Tocumen International Airport", city: "Panama City", country: "Panama", location: "Panama City, Panama" },
  { code: "BOG", iata_code: "BOG", name: "El Dorado International Airport", city: "Bogota", country: "Colombia", location: "Bogota, Colombia" },
  { code: "LIM", iata_code: "LIM", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", location: "Lima, Peru" },
  { code: "GRU", iata_code: "GRU", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", location: "São Paulo, Brazil" },
  { code: "GIG", iata_code: "GIG", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", location: "Rio de Janeiro, Brazil" },
  { code: "EZE", iata_code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", location: "Buenos Aires, Argentina" },
  { code: "SCL", iata_code: "SCL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", location: "Santiago, Chile" },

  // UK & Europe
  { code: "LHR", iata_code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", location: "London, United Kingdom" },
  { code: "LGW", iata_code: "LGW", name: "London Gatwick Airport", city: "London", country: "United Kingdom", location: "London, United Kingdom" },
  { code: "STN", iata_code: "STN", name: "London Stansted Airport", city: "London", country: "United Kingdom", location: "London, United Kingdom" },
  { code: "LTN", iata_code: "LTN", name: "London Luton Airport", city: "London", country: "United Kingdom", location: "London, United Kingdom" },
  { code: "LCY", iata_code: "LCY", name: "London City Airport", city: "London", country: "United Kingdom", location: "London, United Kingdom" },
  { code: "MAN", iata_code: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom", location: "Manchester, United Kingdom" },
  { code: "EDI", iata_code: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom", location: "Edinburgh, United Kingdom" },
  { code: "CDG", iata_code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", location: "Paris, France" },
  { code: "ORY", iata_code: "ORY", name: "Paris Orly Airport", city: "Paris", country: "France", location: "Paris, France" },
  { code: "NCE", iata_code: "NCE", name: "Nice Côte d'Azur Airport", city: "Nice", country: "France", location: "Nice, France" },
  { code: "FRA", iata_code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", location: "Frankfurt, Germany" },
  { code: "MUC", iata_code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany", location: "Munich, Germany" },
  { code: "BER", iata_code: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany", location: "Berlin, Germany" },
  { code: "AMS", iata_code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", location: "Amsterdam, Netherlands" },
  { code: "ZRH", iata_code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", location: "Zurich, Switzerland" },
  { code: "GVA", iata_code: "GVA", name: "Geneva Airport", city: "Geneva", country: "Switzerland", location: "Geneva, Switzerland" },
  { code: "VIE", iata_code: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", location: "Vienna, Austria" },
  { code: "FCO", iata_code: "FCO", name: "Leonardo da Vinci-Fiumicino Airport", city: "Rome", country: "Italy", location: "Rome, Italy" },
  { code: "MXP", iata_code: "MXP", name: "Milan Malpensa Airport", city: "Milan", country: "Italy", location: "Milan, Italy" },
  { code: "LIN", iata_code: "LIN", name: "Milan Linate Airport", city: "Milan", country: "Italy", location: "Milan, Italy" },
  { code: "MAD", iata_code: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain", location: "Madrid, Spain" },
  { code: "BCN", iata_code: "BCN", name: "Josep Tarradellas Barcelona-El Prat Airport", city: "Barcelona", country: "Spain", location: "Barcelona, Spain" },
  { code: "LIS", iata_code: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal", location: "Lisbon, Portugal" },
  { code: "OPO", iata_code: "OPO", name: "Francisco Sá Carneiro Airport", city: "Porto", country: "Portugal", location: "Porto, Portugal" },
  { code: "ATH", iata_code: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece", location: "Athens, Greece" },
  { code: "DUB", iata_code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland", location: "Dublin, Ireland" },
  { code: "CPH", iata_code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", location: "Copenhagen, Denmark" },
  { code: "ARN", iata_code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", location: "Stockholm, Sweden" },
  { code: "OSL", iata_code: "OSL", name: "Oslo Airport, Gardermoen", city: "Oslo", country: "Norway", location: "Oslo, Norway" },
  { code: "HEL", iata_code: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland", location: "Helsinki, Finland" },
  { code: "BRU", iata_code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium", location: "Brussels, Belgium" },
  { code: "WAW", iata_code: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", location: "Warsaw, Poland" },
  { code: "PRG", iata_code: "PRG", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic", location: "Prague, Czech Republic" },
  { code: "BUD", iata_code: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary", location: "Budapest, Hungary" },
  { code: "IST", iata_code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", location: "Istanbul, Turkey" },
  { code: "SAW", iata_code: "SAW", name: "Istanbul Sabiha Gökçen Airport", city: "Istanbul", country: "Turkey", location: "Istanbul, Turkey" },

  // Middle East
  { code: "DXB", iata_code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", location: "Dubai, UAE" },
  { code: "AUH", iata_code: "AUH", name: "Zayed International Airport", city: "Abu Dhabi", country: "United Arab Emirates", location: "Abu Dhabi, UAE" },
  { code: "SHJ", iata_code: "SHJ", name: "Sharjah International Airport", city: "Sharjah", country: "United Arab Emirates", location: "Sharjah, UAE" },
  { code: "DOH", iata_code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", location: "Doha, Qatar" },
  { code: "KWI", iata_code: "KWI", name: "Kuwait International Airport", city: "Kuwait City", country: "Kuwait", location: "Kuwait City, Kuwait" },
  { code: "RUH", iata_code: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", location: "Riyadh, Saudi Arabia" },
  { code: "JED", iata_code: "JED", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", location: "Jeddah, Saudi Arabia" },
  { code: "MED", iata_code: "MED", name: "Prince Mohammad bin Abdulaziz Airport", city: "Medina", country: "Saudi Arabia", location: "Medina, Saudi Arabia" },
  { code: "DMM", iata_code: "DMM", name: "King Fahd International Airport", city: "Dammam", country: "Saudi Arabia", location: "Dammam, Saudi Arabia" },
  { code: "MCT", iata_code: "MCT", name: "Muscat International Airport", city: "Muscat", country: "Oman", location: "Muscat, Oman" },
  { code: "BAH", iata_code: "BAH", name: "Bahrain International Airport", city: "Manama", country: "Bahrain", location: "Manama, Bahrain" },
  { code: "CAI", iata_code: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", location: "Cairo, Egypt" },
  { code: "AMM", iata_code: "AMM", name: "Queen Alia International Airport", city: "Amman", country: "Jordan", location: "Amman, Jordan" },

  // South Asia
  { code: "DEL", iata_code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", location: "New Delhi, India" },
  { code: "BOM", iata_code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", location: "Mumbai, India" },
  { code: "BLR", iata_code: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India", location: "Bangalore, India" },
  { code: "MAA", iata_code: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India", location: "Chennai, India" },
  { code: "HYD", iata_code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", location: "Hyderabad, India" },
  { code: "CCU", iata_code: "CCU", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata", country: "India", location: "Kolkata, India" },
  { code: "AMD", iata_code: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", country: "India", location: "Ahmedabad, India" },
  { code: "COK", iata_code: "COK", name: "Cochin International Airport", city: "Cochin", country: "India", location: "Cochin, India" },
  { code: "TRV", iata_code: "TRV", name: "Trivandrum International Airport", city: "Trivandrum", country: "India", location: "Trivandrum, India" },
  { code: "GOI", iata_code: "GOI", name: "Dabolim Airport", city: "Goa", country: "India", location: "Goa, India" },
  { code: "GOX", iata_code: "GOX", name: "Manohar International Airport", city: "Goa", country: "India", location: "Goa, India" },
  { code: "ISB", iata_code: "ISB", name: "Islamabad International Airport", city: "Islamabad", country: "Pakistan", location: "Islamabad, Pakistan" },
  { code: "LHE", iata_code: "LHE", name: "Allama Iqbal International Airport", city: "Lahore", country: "Pakistan", location: "Lahore, Pakistan" },
  { code: "KHI", iata_code: "KHI", name: "Jinnah International Airport", city: "Karachi", country: "Pakistan", location: "Karachi, Pakistan" },
  { code: "DAC", iata_code: "DAC", name: "Hazrat Shahjalal International Airport", city: "Dhaka", country: "Bangladesh", location: "Dhaka, Bangladesh" },
  { code: "CMB", iata_code: "CMB", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka", location: "Colombo, Sri Lanka" },
  { code: "KTM", iata_code: "KTM", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal", location: "Kathmandu, Nepal" },

  // East Asia & Southeast Asia
  { code: "HND", iata_code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", location: "Tokyo, Japan" },
  { code: "NRT", iata_code: "NRT", name: "Tokyo Narita International Airport", city: "Tokyo", country: "Japan", location: "Tokyo, Japan" },
  { code: "KIX", iata_code: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan", location: "Osaka, Japan" },
  { code: "ICN", iata_code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", location: "Seoul, South Korea" },
  { code: "PEK", iata_code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", location: "Beijing, China" },
  { code: "PVG", iata_code: "PVG", name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", location: "Shanghai, China" },
  { code: "HKG", iata_code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", location: "Hong Kong" },
  { code: "TPE", iata_code: "TPE", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", location: "Taipei, Taiwan" },
  { code: "BKK", iata_code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", location: "Bangkok, Thailand" },
  { code: "DMK", iata_code: "DMK", name: "Don Mueang International Airport", city: "Bangkok", country: "Thailand", location: "Bangkok, Thailand" },
  { code: "HKT", iata_code: "HKT", name: "Phuket International Airport", city: "Phuket", country: "Thailand", location: "Phuket, Thailand" },
  { code: "SIN", iata_code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", location: "Singapore" },
  { code: "KUL", iata_code: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", location: "Kuala Lumpur, Malaysia" },
  { code: "MNL", iata_code: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", location: "Manila, Philippines" },
  { code: "CGK", iata_code: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", location: "Jakarta, Indonesia" },
  { code: "DPS", iata_code: "DPS", name: "Ngurah Rai International Airport", city: "Bali", country: "Indonesia", location: "Bali, Indonesia" },
  { code: "SGN", iata_code: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh City", country: "Vietnam", location: "Ho Chi Minh City, Vietnam" },
  { code: "HAN", iata_code: "HAN", name: "Noi Bai International Airport", city: "Hanoi", country: "Vietnam", location: "Hanoi, Vietnam" },

  // Australia, New Zealand & Pacific
  { code: "SYD", iata_code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", location: "Sydney, NSW, Australia" },
  { code: "MEL", iata_code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", location: "Melbourne, VIC, Australia" },
  { code: "BNE", iata_code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", location: "Brisbane, QLD, Australia" },
  { code: "PER", iata_code: "PER", name: "Perth Airport", city: "Perth", country: "Australia", location: "Perth, WA, Australia" },
  { code: "ADL", iata_code: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", location: "Adelaide, SA, Australia" },
  { code: "AKL", iata_code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", location: "Auckland, New Zealand" },
  { code: "CHC", iata_code: "CHC", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand", location: "Christchurch, New Zealand" },

  // Africa
  { code: "JNB", iata_code: "JNB", name: "O. R. Tambo International Airport", city: "Johannesburg", country: "South Africa", location: "Johannesburg, South Africa" },
  { code: "CPT", iata_code: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", location: "Cape Town, South Africa" },
  { code: "LOS", iata_code: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", country: "Nigeria", location: "Lagos, Nigeria" },
  { code: "NBO", iata_code: "NBO", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya", location: "Nairobi, Kenya" },
  { code: "ADD", iata_code: "ADD", name: "Addis Ababa Bole International Airport", city: "Addis Ababa", country: "Ethiopia", location: "Addis Ababa, Ethiopia" },
  { code: "CMN", iata_code: "CMN", name: "Mohammed V International Airport", city: "Casablanca", country: "Morocco", location: "Casablanca, Morocco" },
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
  const metroAirports = METRO_CITY_AIRPORTS[qUpper] || [];

  const curatedMatches = CURATED_AIRPORTS.filter((a: any) => {
    const haystack = normalizeForSearch(`${a.code} ${a.name} ${a.city} ${a.country}`);
    const isExactCode = a.code === qUpper;
    const isCodePrefix = a.code.startsWith(qUpper);
    const isMetroMatch = metroAirports.includes(a.code);
    return isExactCode || isCodePrefix || isMetroMatch || haystack.includes(qNorm);
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
