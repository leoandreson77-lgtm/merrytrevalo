# Flight Scraper System Documentation

## Overview

The Flight Scraper System provides multiple methods to extract flight data from Google Flights and other sources. It integrates with your Flight Search Engine backend to automatically fetch, parse, and return structured flight data.

## Features

- **Multiple Scraping Methods**: Oxylabs API, SerpApi, and HTML parsing
- **Batch Processing**: Scrape multiple routes simultaneously
- **URL Parsing**: Extract parameters from Google Flights URLs
- **Direct HTML Parsing**: Process pre-fetched HTML content
- **Error Handling**: Comprehensive error handling and logging
- **Flexible Integration**: Works alongside existing Amadeus API calls

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Client Application                         │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Scraper Routes     │
         │  /api/scraper/*      │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────────────┐
         │   scraper.js Module          │
         │  - Parsing Logic             │
         │  - API Integration           │
         │  - Error Handling            │
         └───────────┬──────────────────┘
                     │
         ┌───┬───────┴────────┬──────┐
         │   │                │      │
    ┌────▼─┐ ┌──────────┐ ┌──┴───┐ │
    │HTML  │ │ Oxylabs  │ │Serp- │ │
    │Parser│ │ API      │ │Api   │ │
    └──────┘ └──────────┘ └──────┘ │
```

## Installation

### 1. Install Dependencies

The required packages have been added to `package.json`:

```bash
npm install
```

**Required packages**:
- `axios`: HTTP client for API requests
- `cheerio`: jQuery-like HTML parsing library

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Oxylabs Configuration (for premium scraping)
OXYLABS_USERNAME=your_username
OXYLABS_PASSWORD=your_password

# SerpApi Configuration (for basic Google Flights)
SERPAPI_KEY=your_api_key
```

## API Endpoints

### 1. POST `/api/scraper/google-flights`

Scrape Google Flights data using specified method.

**Request Body**:
```json
{
  "url": "https://www.google.com/travel/flights/search?...",
  "method": "oxylabs",
  "departure": "NYC",
  "arrival": "LAX",
  "outbound_date": "2024-09-15",
  "return_date": "2024-09-20"
}
```

**Parameters**:
- `url` (optional): Google Flights URL to scrape
- `method` (optional): Scraping method - `oxylabs`, `serpapi`, or `html` (default: `oxylabs`)
- `departure` (optional): Airport code for departure (for SerpApi)
- `arrival` (optional): Airport code for arrival (for SerpApi)
- `outbound_date` (optional): Departure date (YYYY-MM-DD format)
- `return_date` (optional): Return date for round trips

**Response**:
```json
{
  "success": true,
  "count": 5,
  "timestamp": "2024-09-14T10:30:00.000Z",
  "method": "oxylabs",
  "flights": [
    {
      "id": "flight_0",
      "price": 250,
      "time": "8:00 AM → 11:30 AM",
      "airline": "United Airlines; American Airlines",
      "stops": 0,
      "fullDetail": "..."
    }
  ]
}
```

### 2. POST `/api/scraper/batch`

Scrape multiple flight routes in batch.

**Request Body**:
```json
{
  "method": "oxylabs",
  "flights": [
    {
      "url": "https://www.google.com/travel/flights/search?..."
    },
    {
      "departure": "NYC",
      "arrival": "LAX",
      "outbound_date": "2024-09-15"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "total": 2,
  "results": [
    {
      "config": { "url": "..." },
      "success": true,
      "count": 5,
      "flights": [...]
    },
    {
      "config": { "departure": "NYC", ... },
      "success": true,
      "count": 3,
      "flights": [...]
    }
  ]
}
```

### 3. GET `/api/scraper/parse-url`

Parse a Google Flights URL to extract parameters.

**Query Parameters**:
- `url` (required): Encoded Google Flights URL

**Response**:
```json
{
  "url": "https://www.google.com/travel/flights/search?...",
  "valid": true,
  "params": {
    "tfs": "...",
    "hl": "en-US",
    "curr": "USD"
  }
}
```

### 4. POST `/api/scraper/html`

Parse raw HTML content for flight data.

**Request Body**:
```json
{
  "html": "<html>...</html>"
}
```

**Response**:
```json
{
  "success": true,
  "count": 5,
  "flights": [...],
  "timestamp": "2024-09-14T10:30:00.000Z",
  "method": "html"
}
```

## Scraping Methods

### Method 1: Oxylabs API (Recommended for Production)

**Pros**:
- Handles JavaScript rendering
- Reliable for complex websites
- Good success rate
- Bypass anti-scraping measures

**Cons**:
- Requires paid subscription
- API calls cost credits

**Setup**:
```env
OXYLABS_USERNAME=your_username
OXYLABS_PASSWORD=your_password
```

**Usage**:
```javascript
const result = await scrapeFlights({
  url: "https://www.google.com/travel/flights/search?...",
  method: "oxylabs",
  oxylabs_username: process.env.OXYLABS_USERNAME,
  oxylabs_password: process.env.OXYLABS_PASSWORD
});
```

### Method 2: SerpApi (Good for Quick Searches)

**Pros**:
- Structured data output
- Easy parameter-based searching
- Good documentation
- Free tier available

**Cons**:
- Limited to basic Google Flights data
- API rate limits

**Setup**:
```env
SERPAPI_KEY=your_api_key
```

**Usage**:
```javascript
const result = await scrapeFlights({
  method: "serpapi",
  departure: "NYC",
  arrival: "LAX",
  outbound_date: "2024-09-15",
  serpapi_key: process.env.SERPAPI_KEY
});
```

### Method 3: HTML Parsing (Local)

**Pros**:
- No API costs
- Fast processing
- Works with pre-fetched content

**Cons**:
- Requires valid HTML input
- Sensitive to DOM changes
- No JavaScript rendering

**Usage**:
```javascript
const result = await scrapeFlights({
  method: "html",
  html_content: "<html>...</html>"
});
```

## Getting API Credentials

### Oxylabs

1. Go to [https://dashboard.oxylabs.io/](https://dashboard.oxylabs.io/)
2. Sign up for an account (free trial available)
3. Navigate to "API" section
4. Copy your username and password
5. Add to `.env`:
   ```env
   OXYLABS_USERNAME=your_username
   OXYLABS_PASSWORD=your_password
   ```

### SerpApi

1. Go to [https://serpapi.com/](https://serpapi.com/)
2. Sign up for free account
3. Copy your API key from dashboard
4. Add to `.env`:
   ```env
   SERPAPI_KEY=your_api_key
   ```

## Usage Examples

### Example 1: Scrape via URL

```bash
curl -X POST http://localhost:5000/api/scraper/google-flights \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com/travel/flights/search?tfs=...",
    "method": "oxylabs"
  }'
```

### Example 2: Search by Parameters

```bash
curl -X POST http://localhost:5000/api/scraper/google-flights \
  -H "Content-Type: application/json" \
  -d '{
    "method": "serpapi",
    "departure": "NYC",
    "arrival": "LAX",
    "outbound_date": "2024-09-15"
  }'
```

### Example 3: Batch Scraping

```bash
curl -X POST http://localhost:5000/api/scraper/batch \
  -H "Content-Type: application/json" \
  -d '{
    "method": "oxylabs",
    "flights": [
      { "url": "https://www.google.com/travel/flights/search?..." },
      { "url": "https://www.google.com/travel/flights/search?..." }
    ]
  }'
```

### Example 4: Frontend Integration (React)

```typescript
// src/hooks/use-scraper.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export const useScrapeFlights = () => {
  return useMutation({
    mutationFn: async (options) => {
      const response = await fetch('/api/scraper/google-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) throw new Error('Scraping failed');
      return response.json();
    }
  });
};

// Usage in component
function SearchFlights() {
  const scrape = useScrapeFlights();
  
  const handleScrape = async () => {
    const result = await scrape.mutateAsync({
      method: 'serpapi',
      departure: 'NYC',
      arrival: 'LAX',
      outbound_date: '2024-09-15'
    });
    
    console.log('Found flights:', result.flights);
  };
  
  return <button onClick={handleScrape}>Scrape Flights</button>;
}
```

## Data Format

### Flight Object

All scraping methods return flights in this format:

```typescript
interface Flight {
  id: string;              // Unique identifier
  price: number;          // Price in currency units
  time: string;           // Departure → Arrival time
  airline: string;        // Airline name(s)
  stops: number;          // Number of stops (-1 if unknown)
  duration?: string;      // Flight duration
  fullDetail: string;     // Raw flight details
}
```

## Error Handling

The scraper includes comprehensive error handling:

```json
{
  "success": false,
  "error": "Oxylabs credentials not provided",
  "timestamp": "2024-09-14T10:30:00.000Z",
  "method": "oxylabs"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Oxylabs credentials not provided" | Missing env variables | Add credentials to `.env` |
| "URL required for Oxylabs scraping" | Missing `url` parameter | Provide valid Google Flights URL |
| "Departure, arrival, and outbound_date required" | Missing parameters for SerpApi | Provide all required parameters |
| "HTML content required" | Missing HTML for parsing | Provide valid HTML string |

## Performance Considerations

1. **Batch Processing**: Use `/api/scraper/batch` for multiple routes
2. **Caching**: Consider caching results for repeated searches
3. **Rate Limiting**: Respect API rate limits (especially SerpApi)
4. **Timeout**: Default timeout is 30 seconds per request

## Switching Between Methods

To switch between scraping methods:

1. **Oxylabs**: Most reliable, costs credits
   ```javascript
   method: "oxylabs"
   ```

2. **SerpApi**: Good balance, free tier available
   ```javascript
   method: "serpapi"
   ```

3. **HTML**: Free but manual, needs pre-fetched HTML
   ```javascript
   method: "html"
   ```

## Integrating with Existing Code

The scraper works alongside your existing Amadeus API. You can:

1. Use scraper for real-time Google Flights data
2. Use Amadeus API for booking and detailed pricing
3. Combine both for comprehensive flight search

```javascript
// Get flights from scraper
const scrapedFlights = await scrapeFlights(options);

// Get pricing from Amadeus
const amadeusFlight = await fetchFlights(origin, destination, date);

// Combine results
const combinedResults = [
  ...scrapedFlights.flights,
  ...amadeusFlight
];
```

## Troubleshooting

### "No flight listings found"
- Google Flights page structure may have changed
- Website returned different DOM than expected
- Try alternative scraping method

### "Connection timeout"
- API server may be overloaded
- Network connectivity issue
- Increase timeout value in `scraper.js`

### "Invalid credentials"
- Check `.env` file for typos
- Verify credentials are correct on provider dashboard
- Test credentials directly with provider's API

## License

This scraper system is provided as part of the Flight Search Engine.
