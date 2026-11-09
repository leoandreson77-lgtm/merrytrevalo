import { useState, useEffect, useRef, useMemo } from "react";
import { Check, MapPin, X, Plane, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resolveAirportSuggestion } from "@/lib/airport-resolver";

interface Airport {
  name: string;
  location?: unknown;
  code?: string;
  city?: string;
  country?: string;
  icaoCode?: string;
  countryCode?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

interface AirportAutocompleteProps {
  value: string;
  displayValue?: string;
  onChange: (iataCode: string, displayText: string) => void;
  placeholder: string;
  size?: "default" | "compact";
  type?: "airport" | "airline";
}

// Popular US & International Hubs for instant 1-click selection
const POPULAR_HUBS: Airport[] = [
  { code: "JFK", name: "John F. Kennedy Intl", city: "New York", country: "United States", location: "New York, NY, US" },
  { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles", country: "United States", location: "Los Angeles, CA, US" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "United States", location: "Chicago, IL, US" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "United States", location: "Miami, FL, US" },
  { code: "SFO", name: "San Francisco Intl", city: "San Francisco", country: "United States", location: "San Francisco, CA, US" },
  { code: "DFW", name: "Dallas/Fort Worth Intl", city: "Dallas", country: "United States", location: "Dallas, TX, US" },
  { code: "ATL", name: "Hartsfield-Jackson Intl", city: "Atlanta", country: "United States", location: "Atlanta, GA, US" },
  { code: "LAS", name: "Harry Reid Intl", city: "Las Vegas", country: "United States", location: "Las Vegas, NV, US" },
  { code: "MCO", name: "Orlando International", city: "Orlando", country: "United States", location: "Orlando, FL, US" },
  { code: "BOS", name: "Logan International", city: "Boston", country: "United States", location: "Boston, MA, US" },
  { code: "SEA", name: "Seattle-Tacoma Intl", city: "Seattle", country: "United States", location: "Seattle, WA, US" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", location: "London, UK" },
];

export function AirportAutocomplete({
  value,
  displayValue,
  onChange,
  placeholder,
  size = "default",
  type = "airport"
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = `${type}-suggest-${placeholder.replace(/\s+/g, "-").toLowerCase()}`;

  const toText = (input: unknown) => {
    if (typeof input === "string") return input.trim();
    if (typeof input === "number" || typeof input === "boolean") return String(input);
    return "";
  };

  const formatLocation = (airport: Airport) => {
    const location = toText(airport.location);
    if (location) return location;
    const city = toText(airport.city);
    const country = toText(airport.country);
    return [city, country].filter(Boolean).join(", ");
  };

  const formatAirportDisplay = (airport: Airport) => {
    const code = toText(airport.code).toUpperCase();
    const location = formatLocation(airport);
    const label = airport.name || code;

    if (code && location) return `${label} (${code}) · ${location}`;
    if (code) return `${label} (${code})`;
    if (location) return `${label} · ${location}`;
    return label;
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with incoming display value or code
  useEffect(() => {
    if (displayValue !== undefined && displayValue !== query) {
      setQuery(displayValue);
    } else if (!displayValue && value && value !== query) {
      setQuery(value);
    }
  }, [displayValue, value]);

  // Search logic with fast debounce
  useEffect(() => {
    const trimmed = query.trim();

    // If query is empty or 1 letter, we show popular hubs on focus
    if (trimmed.length < 2) {
      setAirports(POPULAR_HUBS);
      return;
    }

    const normalizedQuery = trimmed.toUpperCase();
    const normalizedValue = String(value || "").trim().toUpperCase();

    // If query matches current selection exactly, don't re-fetch
    if (normalizedValue && (normalizedQuery === normalizedValue || normalizedQuery.includes(`(${normalizedValue})`))) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/airports/search?q=${encodeURIComponent(trimmed)}&scope=${type}&_=${Date.now()}`,
          { cache: "no-store" }
        );
        if (response.ok && isMounted) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setAirports(data);
            setActiveIndex(0);
          } else {
            // Local fallback filter from popular hubs
            const localMatches = POPULAR_HUBS.filter(
              (h) =>
                h.code?.toLowerCase().includes(trimmed.toLowerCase()) ||
                h.name.toLowerCase().includes(trimmed.toLowerCase()) ||
                h.city?.toLowerCase().includes(trimmed.toLowerCase())
            );
            setAirports(localMatches);
            setActiveIndex(localMatches.length > 0 ? 0 : -1);
          }
        }
      } catch {
        // Fallback to local filtering
        if (isMounted) {
          const localMatches = POPULAR_HUBS.filter(
            (h) =>
              h.code?.toLowerCase().includes(trimmed.toLowerCase()) ||
              h.name.toLowerCase().includes(trimmed.toLowerCase()) ||
              h.city?.toLowerCase().includes(trimmed.toLowerCase())
          );
          setAirports(localMatches);
          setActiveIndex(localMatches.length > 0 ? 0 : -1);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, type, value]);

  const handleSelectAirport = (airport: Airport) => {
    const code = toText(airport.code).toUpperCase();
    const displayText = formatAirportDisplay(airport);
    setQuery(displayText);
    onChange(code, displayText);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setIsOpen(true);
    setActiveIndex(0);

    // If user explicitly typed a 3-letter IATA code, tentatively update
    const uppercase = newValue.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(uppercase)) {
      onChange(uppercase, uppercase);
    }
  };

  const handleBlur = () => {
    if (!query.trim()) {
      onChange("", "");
      return;
    }

    // Direct 3-letter code resolution
    const trimmed = query.trim().toUpperCase();
    const bracketMatch = trimmed.match(/\(([A-Za-z]{3})\)/);
    if (bracketMatch) {
      onChange(bracketMatch[1], query.trim());
      return;
    }

    if (/^[A-Za-z]{3}$/.test(trimmed)) {
      onChange(trimmed, query.trim());
      return;
    }

    // Attempt fuzzy match with suggestions
    if (airports.length > 0 && !value) {
      const match = airports.find(
        (a) =>
          a.code?.toUpperCase() === trimmed ||
          a.city?.toLowerCase() === query.trim().toLowerCase() ||
          a.name.toLowerCase() === query.trim().toLowerCase()
      ) || airports[0];

      if (match?.code) {
        handleSelectAirport(match);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || airports.length === 0) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % airports.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + airports.length) % airports.length);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < airports.length) {
        handleSelectAirport(airports[activeIndex]);
      } else if (airports.length > 0) {
        handleSelectAirport(airports[0]);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const isShowingPopular = query.trim().length < 2;

  return (
    <div ref={wrapperRef} className="relative group w-full">
      {/* Icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10 pointer-events-none">
        <MapPin className="w-4 h-4" />
      </div>

      {/* Input */}
      <Input
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsOpen(true);
          if (airports.length === 0) setAirports(POPULAR_HUBS);
        }}
        onBlur={handleBlur}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
        className={cn(
          "pl-10 pr-9 rounded-xl font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 text-slate-900 dark:text-white transition-all truncate",
          size === "compact"
            ? "h-11 sm:h-12 text-sm sm:text-base"
            : "h-13 sm:h-14 text-sm sm:text-base"
        )}
        autoComplete="off"
      />

      {/* Clear Button */}
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setAirports(POPULAR_HUBS);
            setActiveIndex(-1);
            onChange("", "");
          }}
          aria-label="Clear input"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full mt-1.5 left-0 w-full min-w-[280px] sm:min-w-[340px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999] max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
        >
          {/* Header pill if showing popular hubs */}
          {isShowingPopular && (
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Popular US & Global Hubs
            </div>
          )}

          {isLoading ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Plane className="w-4 h-4 text-blue-500 animate-spin" />
              Searching airports...
            </div>
          ) : airports.length > 0 ? (
            airports.map((airport, index) => {
              const isSelected = index === activeIndex;
              const code = toText(airport.code).toUpperCase();
              return (
                <button
                  id={`${listId}-option-${index}`}
                  key={`${code}-${airport.name}-${index}`}
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent blur from closing before selection
                    e.preventDefault();
                    handleSelectAirport(airport);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  aria-selected={isSelected}
                  className={cn(
                    "w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between gap-2.5 cursor-pointer",
                    isSelected ? "bg-blue-50 dark:bg-slate-800" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                        {airport.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {formatLocation(airport)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {code && (
                      <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                        {code}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No airports found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
