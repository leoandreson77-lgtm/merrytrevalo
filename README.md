# JetWithFly Flights — Flight Booking & Management Platform

A modern, high-conversion flight search and booking platform built with Next.js 14, React 18, Tailwind CSS, MongoDB, Nodemailer, Duffel & Amadeus APIs, and a full Enterprise Admin Management Console.

## 🚀 Live Application

- **Website:** https://jetwithfly.com (Local: http://localhost:3000)
- **Admin Console:** https://jetwithfly.com/admin (Local: http://localhost:3000/admin)
- **Admin Login:** `admin@jetwithfly.com` / `Admin@12345` (Fallback: `samm.aali12@gmail.com` / `Sameer123`)

## ✨ Features

- ✅ **Fluent Flight Search & Autocomplete**: Instant US/global hubs lookup with swap animation and route filters.
- ✅ **End-to-End Flight Booking**: Reliable booking flow with instant email receipts and admin lead notifications.
- ✅ **Toll-Free Telephony (TFN)**: Integrated 24/7 Call Desk reservations (`+1 877 371 7356`).
- ✅ **Admin Management Console**:
  - Live CRM Leads & Flight Booking Requests
  - **Environment & Integrations Panel (`/admin/env`)**: Configure SMTP email, Gmail App Passwords, and API keys with a live test email tool.
  - **Payment Gateway**: NOWPayments crypto/card checkout integration with instant 30% discount and Booking Reference ID generation.
  - Call Tracking & Telephony routing.
  - Landing Pages & Form Builder.

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (JavaScript ES Modules)
- **Framework:** Express.js 5
- **API Integration:** Official Amadeus SDK
- **Database:** MongoDB Atlas
- **Architecture:** RESTful API

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** Wouter
- **State Management:** TanStack Query
- **UI Components:** Radix UI + Tailwind CSS
- **Forms:** React Hook Form + Zod validation

## 📁 Project Structure

```
Flight-Search-Engine/
├── .env                        # Environment variables
├── package.json                # Dependencies & scripts
├── server-js/                  # JavaScript backend
│   ├── index.js               # Express server entry
│   ├── routes.js              # API endpoint handlers
│   ├── amadeus.js             # Amadeus SDK integration
│   ├── airports.js            # Airport search wrapper
│   ├── storage.js             # MongoDB operations
│   ├── db.js                  # Database connection
│   ├── vite.js                # Vite dev server
│   └── static.js              # Production static files
├── client/                     # React frontend
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── pages/              # Routes (home, search, book)
│       ├── components/         # UI components
│       └── hooks/              # React hooks
└── shared/                     # Shared TypeScript types
    ├── routes.ts              # API contract & schemas
    └── schema.ts              # Database schemas
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Amadeus API credentials (Test environment)

### Environment Variables

Create `.env` file in root:

```env
DATABASE_URL=mongodb+srv://sammaali12:Sameer123@cluster0.s3oneko.mongodb.net/?appName=Cluster0
AMADEUS_CLIENT_ID=jJG55GPYYKx0s6ctBD7uBrlbimu8M2Vs
AMADEUS_CLIENT_SECRET=oxza3aWmFmvtQA6Y
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
```

### Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 API Endpoints

### Flights

**Search Flights**
```bash
GET /api/flights/search?origin=JFK&destination=LAX&date=2026-03-15
```

**Get Flight by ID**
```bash
GET /api/flights/:id
```

### Airports

**Airport Autocomplete**
```bash
GET /api/airports/suggest?q=New
```

**Airports by Country**
```bash
GET /api/airports/by-country?countryCode=US
```

### Countries

**Country Search**
```bash
GET /api/countries/suggest?q=United
```

### Bookings

**Create Booking**
```bash
POST /api/bookings
Content-Type: application/json

{
  "flightId": 1,
  "passengerName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "passportDetails": "P123456"
}
```

## 🧪 Testing

```bash
# Test flight search
curl "http://localhost:5000/api/flights/search?origin=JFK&destination=LAX&date=2026-03-15"

# Test airport search
curl "http://localhost:5000/api/airports/suggest?q=New"

# Test frontend
open http://localhost:5000
```

## 📊 Sample API Response

**Flight Search:**
```json
[
  {
    "id": "1",
    "airline": "B6",
    "flightNumber": "B6 423",
    "origin": "JFK",
    "destination": "LAX",
    "departureTime": "2026-03-15T19:31:00",
    "arrivalTime": "2026-03-15T22:49:00",
    "price": 31341,
    "duration": "6h 18m",
    "stops": 0
  }
]
```

## 🔑 Key Features Explained

### Amadeus API Integration
- Uses official `amadeus` npm package
- Automatic OAuth2 token management
- Real-time flight offers from 500+ airlines
- Airport/city location search

### Frontend Architecture
- Client-side routing with Wouter
- Data fetching with TanStack Query (automatic caching)
- Form validation with Zod schemas
- Responsive design for mobile/desktop

### Development Workflow
- Vite for fast HMR (Hot Module Replacement)
- TypeScript for type safety
- Tailwind CSS for styling
- Express middleware for API routing

## 🎯 How It Works

1. **User searches flights:** Enters origin, destination, date
2. **Frontend validates:** Zod schema validates form data
3. **API request:** Sends GET request to `/api/flights/search`
4. **Backend fetches:** Calls Amadeus API with credentials
5. **Data transformation:** Formats Amadeus response to app schema
6. **Response cached:** TanStack Query caches results
7. **UI renders:** React displays flight cards with prices

## 🚨 Troubleshooting

### Server won't start
```bash
# Kill existing Node processes
taskkill /F /IM node.exe

# Restart server
npm run dev
```

### Frontend not loading
- Check if server is running on port 5000
- Clear browser cache
- Check console for errors (F12)

### No flights returned
- Verify Amadeus credentials in `.env`
- Check date format (must be YYYY-MM-DD)
- Ensure origin/destination are valid IATA codes

## 📝 License

MIT

## 👤 Author

Built with ❤️ using React, Node.js, and Amadeus API
