#!/bin/bash
# SCRAPER QUICK START GUIDE
# Run this after installing dependencies

echo "🚀 Flight Scraper System - Quick Start"
echo "======================================="
echo ""

# Step 1: Install dependencies
echo "1️⃣  Installing dependencies..."
npm install axios cheerio
echo "✅ Dependencies installed"
echo ""

# Step 2: Configure environment
echo "2️⃣  Setting up environment variables..."
echo ""
echo "Choose your scraping method:"
echo ""
echo "Option A: SerpApi (Recommended for beginners)"
echo "  - Go to https://serpapi.com/"
echo "  - Sign up and get your API key"
echo "  - Add to .env: SERPAPI_KEY=your_key"
echo ""
echo "Option B: Oxylabs (Better for production)"
echo "  - Go to https://dashboard.oxylabs.io/"
echo "  - Sign up and get credentials"
echo "  - Add to .env: OXYLABS_USERNAME=... OXYLABS_PASSWORD=..."
echo ""
echo "✅ Add your credentials to .env"
echo ""

# Step 3: Test the scraper
echo "3️⃣  Testing the scraper..."
echo ""
echo "Test URLs:"
echo ""
echo "A) Search by parameters (SerpApi):"
echo "   curl -X POST http://localhost:5000/api/scraper/google-flights \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"method\":\"serpapi\",\"departure\":\"NYC\",\"arrival\":\"LAX\",\"outbound_date\":\"2024-12-15\"}'"
echo ""
echo "B) Parse Google Flights URL (Any method):"
echo "   curl 'http://localhost:5000/api/scraper/parse-url?url=<ENCODED_URL>'"
echo ""
echo "C) Parse raw HTML (Oxylabs):"
echo "   curl -X POST http://localhost:5000/api/scraper/google-flights \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"url\":\"https://www.google.com/travel/flights/...\",\"method\":\"oxylabs\"}'"
echo ""

# Step 4: Next steps
echo "4️⃣  Next Steps:"
echo "  - Read SCRAPER_SETUP.md for detailed documentation"
echo "  - Test endpoints with your API credentials"
echo "  - Integrate scraper results into your frontend"
echo "  - Monitor API usage and costs"
echo ""
echo "✅ Scraper system is ready!"
