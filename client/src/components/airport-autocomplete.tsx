import { useState, useEffect, useRef } from "react";
import { Check, MapPin, X, Plane } from "lucide-react";
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

export function AirportAutocomplete({ value, displayValue, onChange, placeholder, size = "default", type = "airport" }: AirportAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (displayValue && displayValue !== query) {
      setQuery(displayValue);
      return;
    }

    if (!displayValue && value && value !== query) {
      setQuery(value);
    }
  }, [displayValue, value]);

  useEffect(() => {
    if (query.length < 2) {
      setAirports([]);
      setIsOpen(false);
      setActiveIndex(-1);
      setErrorMessage("");
      return;
    }

    const normalizedQuery = query.trim().toUpperCase();
    const normalizedValue = String(value || "").trim().toUpperCase();
    const normalizedDisplayValue = String(displayValue || "").trim().toUpperCase();
    const alreadySelected =
      !!normalizedValue &&
      (normalizedQuery === normalizedValue ||
        normalizedQuery.endsWith(`(${normalizedValue})`) ||
        normalizedQuery === normalizedDisplayValue);

    if (alreadySelected) {
      setIsOpen(false);
      setActiveIndex(-1);
      setErrorMessage("");
      return;
    }

    const fetchAirports = async () => {
      setIsLoading(true);
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
        if (response.ok) {
          const data = await response.json();
          setErrorMessage("");
          setAirports(data);
          setIsOpen(true);
          setActiveIndex(data.length > 0 ? 0 : -1);
        } else {
          const payload = await response.json().catch(() => ({}));
          setAirports([]);
          setIsOpen(true);
          setActiveIndex(-1);
          setErrorMessage(payload.message || "Airport suggestions are unavailable.");
        }
      } catch (error) {
        console.error("Failed to fetch airports:", error);
        setAirports([]);
        setIsOpen(true);
        setActiveIndex(-1);
        setErrorMessage(error instanceof Error ? error.message : "Failed to load airport suggestions");
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchAirports, 300);
    return () => clearTimeout(debounce);
  }, [query, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setActiveIndex(-1);
    if (value) {
      onChange("", "");
    }
  };

  const extractIataCode = (text: string) => {
    const value = String(text || "").trim();
    const bracketMatch = value.match(/\(([A-Za-z]{3})\)$/);
    if (bracketMatch) return bracketMatch[1].toUpperCase();

    const plainMatch = value.match(/^([A-Za-z]{3})$/);
    if (plainMatch) return plainMatch[1].toUpperCase();

    return "";
  };

  const handleBlur = () => {
    if (!query.trim()) {
      onChange("", "");
      return;
    }

    if (value) return;

    const parsedCode = extractIataCode(query);
    if (parsedCode) {
      onChange(parsedCode, query.trim());
      return;
    }

    void (async () => {
      const airport = await resolveAirportSuggestion(query, type);
      if (!airport) return;

      const code = toText(airport.code).toUpperCase();
      const location = toText(airport.location);
      const label = airport.name || query.trim();
      const displayText = code && location ? `${label} (${code}) · ${location}` : code ? `${label} (${code})` : location ? `${label} · ${location}` : label;
      onChange(String(airport.code || airport.name || ""), displayText);
      setQuery(displayText);
    })();
  };

  const handleSelectAirport = (airport: Airport) => {
    const displayText = formatAirportDisplay(airport);
    setQuery(displayText);
    onChange(String(airport.code || airport.name), displayText);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || airports.length === 0) {
      if (e.key === "ArrowDown" && airports.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((current) => (current + 1) % airports.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((current) => (current - 1 + airports.length) % airports.length);
      return;
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < airports.length) {
        e.preventDefault();
        handleSelectAirport(airports[activeIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none">
        <MapPin className="w-5 h-5" />
      </div>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (airports.length > 0) setIsOpen(true);
        }}
        onBlur={handleBlur}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
        className={cn(
          "pl-12 rounded-2xl font-medium bg-background border-border hover:border-primary/50 focus-visible:ring-primary/20 transition-all",
          size === "compact" ? "h-14 text-2xl" : "h-16 text-lg",
        )}
        autoComplete="off"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setAirports([]);
            setIsOpen(false);
            setActiveIndex(-1);
            setErrorMessage("");
            if (value) onChange("", "");
          }}
          aria-label="Clear"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      {isOpen && airports.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full mt-2 left-0 w-full min-w-[300px] sm:min-w-[400px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200 dark:border-slate-700 z-[99999] max-h-[360px] overflow-y-auto overflow-x-hidden divide-y divide-slate-100 dark:divide-slate-800/80"
        >
          {airports.map((airport) => {
            const isSelected = airports.indexOf(airport) === activeIndex;
            return (
              <button
                id={`${listId}-option-${airports.indexOf(airport)}`}
                key={`${airport.code}-${airport.name}`}
                type="button"
                onClick={() => handleSelectAirport(airport)}
                onMouseEnter={() => setActiveIndex(airports.indexOf(airport))}
                aria-selected={isSelected}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors flex items-center justify-between gap-3 group/item cursor-pointer",
                  isSelected ? "bg-blue-50/80 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/60",
                  "first:rounded-t-2xl last:rounded-b-2xl"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                    <Plane className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                      {airport.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                      {formatLocation(airport)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {airport.code && (
                    <span className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-black tracking-wider text-blue-600 dark:text-blue-400 shadow-xs">
                      {String(airport.code).toUpperCase()}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      {isLoading && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 min-w-[280px] bg-popover rounded-2xl shadow-xl border border-border z-[100] p-4 text-center text-sm font-medium text-muted-foreground">
          <Plane className="w-4 h-4 animate-bounce mx-auto mb-1 text-primary" />
          Searching airports...
        </div>
      )}
      
      {!isLoading && query.length >= 3 && airports.length === 0 && isOpen && (
        <div className="absolute top-full mt-2 left-0 min-w-[280px] bg-popover rounded-2xl shadow-xl border border-border z-[100] p-4 text-center text-sm font-medium text-muted-foreground">
          No airports found
        </div>
      )}

      {isOpen && errorMessage && airports.length === 0 && (
        <div className="absolute top-full mt-2 left-0 min-w-[280px] bg-popover rounded-2xl shadow-xl border border-border z-[100] p-4 text-sm font-medium text-muted-foreground">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
