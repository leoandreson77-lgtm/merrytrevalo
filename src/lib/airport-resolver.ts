type ResolverType = "airport" | "airline";

interface AirportSuggestion {
  code?: string;
  name?: string;
  city?: string;
  country?: string;
  location?: string;
}

function extractIataCode(text: string) {
  const value = String(text || "").trim();
  const bracketMatch = value.match(/\(([A-Za-z]{3})\)/);
  if (bracketMatch) return bracketMatch[1].toUpperCase();

  const plainMatch = value.match(/^([A-Za-z]{3})$/);
  if (plainMatch) return plainMatch[1].toUpperCase();

  return "";
}

function normalizeQuery(input: string) {
  return String(input || "").trim();
}

export async function resolveAirportSuggestion(input: string, _type: ResolverType = "airport"): Promise<AirportSuggestion | null> {
  const query = normalizeQuery(input);
  if (!query) return null;

  const parsedCode = extractIataCode(query);
  if (parsedCode) {
    return { code: parsedCode, name: parsedCode };
  }

  try {
    const response = await fetch(
      `/api/airports/search?q=${encodeURIComponent(query)}&scope=airport&_=${Date.now()}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const suggestions = Array.isArray(data) ? data : [];
    if (suggestions.length === 0) return null;

    const normalized = query.toLowerCase();
    const exactByCode = suggestions.find((item) => String(item?.code || "").toLowerCase() === normalized);
    if (exactByCode) return exactByCode;

    const exactByName = suggestions.find((item) => String(item?.name || "").toLowerCase() === normalized);
    if (exactByName) return exactByName;

    return suggestions[0] || null;
  } catch {
    return null;
  }
}