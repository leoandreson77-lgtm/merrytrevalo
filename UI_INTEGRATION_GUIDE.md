# Flight Scraper UI Integration Guide

## Overview

The Flight Scraper system is fully integrated into the Flight Search Engine with multiple UI components and a combined search experience that leverages both Amadeus API and Google Flights scraper data.

## UI Components

### 1. **ScraperPage** (`client/src/pages/scraper.tsx`)
Dedicated standalone page for scraper-only searches.

**Features:**
- Multiple search methods (SerpApi, Google Flights URL, HTML parsing)
- Grid, List, and Table view modes
- Real-time flight comparison
- Best deals highlighting

**Route:** `/scraper`

**Usage:**
```typescript
// Navigate to scraper page
window.location.href = '/scraper';
```

### 2. **CombinedFlightSearch** (`client/src/components/combined-flight-search.tsx`)
Integrated component that searches both Amadeus and Scraper APIs simultaneously.

**Features:**
- Dual API search (Amadeus + Google Flights)
- Tabbed interface to switch between results
- One-click scraper toggle
- Real-time flight count badges

**Props:**
```typescript
interface CombinedSearchProps {
  origin: string;
  destination: string;
  date: Date | undefined;
  returnDate?: Date | undefined;
  tripType: "oneway" | "round";
  passengers: number;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  packageType?: string;
}
```

**Usage in SearchResultsPage:**
```typescript
<CombinedFlightSearch
  origin={origin}
  destination={destination}
  date={date ? new Date(date) : undefined}
  returnDate={returnDate ? new Date(returnDate) : undefined}
  tripType={tripType as "oneway" | "round"}
  passengers={parseInt(passengers || "1", 10)}
/>
```

### 3. **ScraperSearch** (`client/src/components/scraper-search.tsx`)
Detailed scraper search component with multiple input methods.

**Features:**
- Tab-based method selection
- Real-time error handling
- Loading states
- Results display

**Usage:**
```typescript
import { ScraperSearch } from '@/components/scraper-search';

function MyComponent() {
  return <ScraperSearch />;
}
```

### 4. **ScraperResultsView** (`client/src/components/scraper-results-view.tsx`)
Multiple view modes for displaying scraper results.

**Components:**
- `ScraperFlightsGrid` - Card grid layout
- `ScraperFlightsList` - Simple list view
- `ScraperComparisonTable` - Sortable table with best deals

**Usage:**
```typescript
import { 
  ScraperFlightsGrid, 
  ScraperFlightsList, 
  ScraperComparisonTable 
} from '@/components/scraper-results-view';

// Grid view
<ScraperFlightsGrid 
  flights={flightData} 
  onSelectFlight={handleSelect} 
/>

// List view
<ScraperFlightsList 
  flights={flightData} 
  onSelectFlight={handleSelect} 
/>

// Table view with comparisons
<ScraperComparisonTable 
  flights={flightData} 
  onSelectFlight={handleSelect} 
/>
```

## Hooks

### `useScrapeFlights()`
Scrape flights using the scraper API.

```typescript
import { useScrapeFlights, type ScraperOptions } from '@/hooks/use-scraper';

const scrapeFlights = useScrapeFlights();

// Trigger search
scrapeFlights.mutate({
  method: 'serpapi',
  departure: 'NYC',
  arrival: 'LAX',
  outbound_date: '2024-12-15'
});

// Access results
const { data, isPending, error } = scrapeFlights;
```

### `useBatchScrapeFlights()`
Batch scrape multiple routes simultaneously.

```typescript
const batchScrape = useBatchScrapeFlights();

batchScrape.mutate({
  method: 'serpapi',
  flights: [
    { departure: 'NYC', arrival: 'LAX', outbound_date: '2024-12-15' },
    { departure: 'NYC', arrival: 'MIA', outbound_date: '2024-12-16' }
  ]
});
```

### `useParseGoogleFlightsURL(url)`
Parse Google Flights URLs to extract parameters.

```typescript
const { data: parsed } = useParseGoogleFlightsURL(googleFlightsUrl);
// Returns: { url, params, valid }
```

## Utility Functions

### `formatPrice(price: number): string`
```typescript
formatPrice(250) // "$250"
```

### `parseFlightTime(timeStr: string)`
```typescript
parseFlightTime("8:00 AM → 11:30 AM")
// Returns: { departure: "8:00 AM", arrival: "11:30 AM" }
```

### `filterFlights(flights, options)`
```typescript
const filtered = filterFlights(flights, {
  maxPrice: 500,
  maxStops: 1,
  airline: 'United',
  sortBy: 'price'
});
```

### `getBestDeals(flights)`
```typescript
const { cheapest, nonstop } = getBestDeals(flights);
```

## Integration Points

### 1. Search Results Page (`/search`)
The search results page now includes:
- **SearchWidget**: Search modification bar
- **CombinedFlightSearch**: Dual API search interface
- **Filters**: Price, airline, stops, times
- **Results**: Amadeus flights from existing search

### 2. Scraper Page (`/scraper`)
Standalone page featuring:
- **Search form**: Multiple input methods
- **View modes**: Grid, List, Table
- **Best deals**: Automatic highlighting
- **Real-time data**: Fresh Google Flights results

### 3. Navigation
Add scraper link to main navigation:
```typescript
// In layout or navigation component
<a href="/scraper">Flight Scraper</a>
```

## Data Flow

```
User Input
    ↓
SearchWidget (origin, destination, date, etc.)
    ↓
    ├─→ Amadeus API (existing system)
    └─→ CombinedFlightSearch
         ├─→ Amadeus API results
         └─→ ScrapeFlights.mutate()
            ├─→ SerpApi
            ├─→ Oxylabs
            └─→ HTML Parser
    ↓
Display Results (Tabbed interface)
    ├─→ Tab 1: Amadeus flights
    └─→ Tab 2: Google Flights (scraped)
    ↓
User selects flight
    ↓
Book flight
```

## Features Summary

| Feature | Location | Status |
|---------|----------|--------|
| SerpApi Search | `/scraper` & `/search` | ✅ Active |
| Oxylabs URL Scraping | `/scraper` | ✅ Active |
| HTML Parsing | `/scraper` | ✅ Active |
| Batch Scraping | API only | ✅ Active |
| Grid View | `/scraper` | ✅ Active |
| List View | `/scraper` | ✅ Active |
| Table View | `/scraper` | ✅ Active |
| Dual API Tab View | `/search` | ✅ Active |
| Best Deals Highlighting | `/scraper` | ✅ Active |
| Price Filtering | `/scraper` | 🔄 Planned |
| Airline Filtering | `/scraper` | 🔄 Planned |

## Configuration

### Enable/Disable Scraper
In CombinedFlightSearch, toggle `enableScraper`:

```typescript
const [enableScraper, setEnableScraper] = useState(true);
```

### Default Scraper Method
Change default in `use-scraper.ts`:

```typescript
method: options.method || "serpapi" // default method
```

### API Credentials
Set environment variables:
```env
VITE_SERPAPI_KEY=your_key
VITE_OXYLABS_USERNAME=your_username
VITE_OXYLABS_PASSWORD=your_password
```

## Error Handling

All components include error boundaries and user-friendly messages:

```typescript
{error && (
  <Alert className="bg-red-50 border-red-200">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {error instanceof Error ? error.message : "Unknown error"}
    </AlertDescription>
  </Alert>
)}
```

## Performance Optimization

1. **Lazy Loading**: Components load data only when needed
2. **Memoization**: useMemo for expensive computations
3. **Debouncing**: Input fields debounced for API calls
4. **Pagination**: Results can be paginated (future enhancement)

## Testing

```typescript
// Mock scraper hook for testing
const mockScrapeFlights = jest.fn(() => ({
  mutate: jest.fn(),
  data: { flights: [...], success: true },
  isPending: false,
  error: null
}));
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Advanced filters in scraper view
- [ ] Saved searches
- [ ] Price alerts
- [ ] Flight notifications
- [ ] Multi-city search
- [ ] Custom date ranges
- [ ] Seat map integration
- [ ] Real-time price tracking
