import { z } from "zod";
import { storage } from "./storage.js";
import { searchMongoAirportsByQuery, searchMongoCities, searchMongoCountries, getAirportsByCountryCode } from "./airports.js";
import { fetchDuffelFlights, createDuffelOrder, fetchDuffelOfferDetails } from "./duffel.js";
import { sendBookingConfirmation } from "./email.js";
import { logBookingToSheet } from "./google-sheets.js";
import { scrapeFlights, scrapeMultipleFlights, parseGoogleFlightsURL } from "./scraper.js";

const recentFlights = new Map();

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().email().optional(),
);

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().optional(),
);

const bookingSchema = z
  .object({
    flightId: z.union([z.string(), z.number()]).transform((v) => String(v)),
    passengerName: z.string().min(1),
    email: optionalEmailSchema,
    phone: optionalPhoneSchema,
    bornOn: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().optional(),
    ),
    title: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().optional(),
    ),
    gender: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().optional(),
    ),
    passportDetails: z.string().optional().default("P12345678"),
    tripType: z.enum(["oneway", "round"]).optional(),
    bookingSource: z.enum(["duffel", "local"]).optional(),
    duffelOfferId: z.string().optional(),
    passengers: z.array(z.object({
      passengerName: z.string().min(1).optional(),
      email: optionalEmailSchema,
      phone: optionalPhoneSchema,
      bornOn: z.string().optional(),
      title: z.string().optional(),
      gender: z.string().optional(),
      passportDetails: z.string().optional(),
    })).optional(),
    returnFlight: z.object({
      airline: z.string().optional(),
      airlineCode: z.string().optional(),
      origin: z.string(),
      destination: z.string(),
      departureTime: z.union([z.string(), z.date()]),
      arrivalTime: z.union([z.string(), z.date()]),
      duration: z.string(),
      stops: z.number(),
      price: z.number().optional(),
    }).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Please provide at least an email address or phone number",
      });
    }
  });

function log(message, context = "api") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${context}] ${message}`);
}

function parsePassengers(value) {
  const parsed = Number.parseInt(String(value || "1"), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 12);
}

function parseTravelerCount(value, min = 0, max = 12) {
  const parsed = Number.parseInt(String(value ?? min), 10);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}

function packageDiscountMultiplier(packageType, passengers) {
  if (packageType === "family" && passengers >= 4) return 0.9;
  if (packageType === "couple" && passengers >= 2) return 0.95;
  return 1;
}

function enrichFareForTrip(flight, options) {
  const tripType = options.tripType;
  const passengers = options.passengers;
  const packageType = options.packageType;
  const returnDate = options.returnDate;
  const basePrice = Number(flight?.price || 0);
  const discountMultiplier = packageDiscountMultiplier(packageType, passengers);
  const discountedPerAdultPrice = Math.max(0, Math.round(basePrice * discountMultiplier));
  const estimatedTotalPrice = Math.max(0, Math.round(discountedPerAdultPrice * passengers));

  return {
    ...flight,
    price: discountedPerAdultPrice,
    estimatedTotalPrice,
    tripType,
    packageType,
    passengers,
    ...(returnDate ? { returnDate } : {}),
  };
}

function parseTimeLabelToDate(baseDate, label) {
  const input = String(label || "").trim();
  const match = input.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  const hour12 = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const meridian = match[3].toUpperCase();

  if (!Number.isFinite(hour12) || !Number.isFinite(minute)) return null;

  let hours = hour12 % 12;
  if (meridian === "PM") hours += 12;

  const result = new Date(baseDate);
  result.setHours(hours, minute, 0, 0);
  return result;
}

function mapScraperFlightsToUnifiedSchema(scraperFlights, origin, destination, date) {
  const baseDate = new Date(date || new Date().toISOString().slice(0, 10));

  return (Array.isArray(scraperFlights) ? scraperFlights : []).map((flight, index) => {
    const [depLabelRaw, arrLabelRaw] = String(flight?.time || "").split("→");
    const depLabel = String(depLabelRaw || "").trim();
    const arrLabel = String(arrLabelRaw || "").trim();
    const departureAt = parseTimeLabelToDate(baseDate, depLabel) || new Date(baseDate);
    let arrivalAt = parseTimeLabelToDate(baseDate, arrLabel) || new Date(baseDate);

    // If arrival clock time is before departure, assume overnight arrival.
    if (arrivalAt.getTime() < departureAt.getTime()) {
      arrivalAt = new Date(arrivalAt.getTime() + 24 * 60 * 60 * 1000);
    }

    const rawPrice = Number(flight?.price || 0);
    const normalizedPrice = Number.isFinite(rawPrice) ? Math.round(rawPrice * 100) : 0;
    const airline = String(flight?.airline || "Unknown Airline");
    const stops = Number.isFinite(Number(flight?.stops)) ? Number(flight.stops) : 0;

    return {
      id: `scraper-${index}`,
      airline,
      airlineCode: "SC",
      flightNumber: `SC ${1000 + index}`,
      origin: String(origin || "").toUpperCase(),
      destination: String(destination || "").toUpperCase(),
      departureTime: departureAt.toISOString(),
      arrivalTime: arrivalAt.toISOString(),
      price: normalizedPrice,
      duration: String(flight?.duration || "N/A"),
      stops,
      source: "scraper",
    };
  });
}

export function registerRoutes(app) {

  // ===================== ADMIN API ROUTES =====================

  /** GET /api/admin/dashboard/stats — KPI cards + chart data */
  app.get("/api/admin/dashboard/stats", async (_req, res) => {
    try {
      const db = (await import("./db.js")).getDb ? await (await import("./db.js")).getDb() : null;
      if (!db) return res.json({ kpis: {}, recentBookings: [], chartData: [] });

      const bookings = db.collection("bookings");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalBookings = await bookings.countDocuments();
      const todaysBookings = await bookings.countDocuments({ createdAt: { $gte: today } });

      // Revenue estimate
      const revenuePipeline = await bookings.aggregate([
        { $group: { _id: null, total: { $sum: { $ifNull: ["$totalPrice", 0] } } } }
      ]).toArray();
      const revenue = revenuePipeline[0]?.total || 0;

      // Recent bookings
      const recentBookings = await bookings
        .find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      // Chart data — last 7 days
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);
        const count = await bookings.countDocuments({ createdAt: { $gte: d, $lt: nextD } });
        chartData.push({
          day: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          Bookings: count,
        });
      }

      res.json({
        kpis: {
          totalBookings,
          todaysBookings,
          revenue,
        },
        recentBookings: recentBookings.map(b => ({
          ...b,
          id: b._id?.toString(),
          _id: undefined,
        })),
        chartData,
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ error: "Failed to load dashboard" });
    }
  });

  /** GET /api/admin/bookings — all bookings with optional search */
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const db = await (await import("./db.js")).getDb();
      const q = req.query.q ? String(req.query.q) : "";
      const filter = q
        ? {
            $or: [
              { passengerName: { $regex: q, $options: "i" } },
              { email: { $regex: q, $options: "i" } },
              { phone: { $regex: q, $options: "i" } },
            ],
          }
        : {};

      const bookings = await db
        .collection("bookings")
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      res.json(
        bookings.map((b) => ({
          ...b,
          id: b._id?.toString(),
          _id: undefined,
        }))
      );
    } catch (error) {
      console.error("Admin bookings error:", error);
      res.status(500).json({ error: "Failed to load bookings" });
    }
  });

  /** DELETE /api/admin/bookings/:id — delete a booking */
  app.delete("/api/admin/bookings/:id", async (req, res) => {
    try {
      const { ObjectId } = await import("mongodb");
      const db = await (await import("./db.js")).getDb();
      await db.collection("bookings").deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete booking error:", error);
      res.status(500).json({ error: "Failed to delete" });
    }
  });

  // ===================== EXISTING ROUTES =====================

  app.get("/api/flights/fare-calendar", async (req, res) => {
    try {
      return res.json({});
    } catch (err) {
      return res.json({});
    }
  });


  app.get("/api/flights/search", async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);

    try {
      const origin = req.query.origin;
      const destination = req.query.destination;
      const date = req.query.date;
      const returnDate = req.query.returnDate ? String(req.query.returnDate) : undefined;
      const tripType = req.query.tripType === "oneway" ? "oneway" : "round";
      const packageType = req.query.package === "family"
        ? "family"
        : req.query.package === "couple"
          ? "couple"
          : "solo";
      const adults = parseTravelerCount(req.query.adults, 1, 9);
      const children = parseTravelerCount(req.query.children, 0, 8);
      const infants = parseTravelerCount(req.query.infants, 0, adults);
      const passengers = parsePassengers(req.query.passengers || adults + children + infants);
      const travelClass = typeof req.query.travelClass === "string" ? req.query.travelClass : "Economy";

      log(
        `[${requestId}] 🔎 Flight search: ${origin} → ${destination} | ${tripType} | ${packageType} | adt=${adults} chd=${children} inf=${infants} | class=${travelClass}`,
        "flights",
      );

      let flights = [];
      if (origin && destination) {
        try {
          flights = await fetchDuffelFlights(origin, destination, date, {
            adults,
            children,
            infants,
            travelClass,
            returnDate,
          });

          if (Array.isArray(flights) && flights.length > 0) {
            log(`[${requestId}] 🔗 Loaded flights from Duffel`, "flights");
          }
        } catch (flightApiErr) {
          log(
            `[${requestId}] ⚠️ Duffel unavailable: ${flightApiErr instanceof Error ? flightApiErr.message : String(flightApiErr)}`,
            "flights",
          );
          flights = [];
        }

        for (const flight of flights) {
          if (flight?.id !== undefined && flight?.id !== null) {
            const enriched = enrichFareForTrip(flight, {
              tripType,
              packageType,
              passengers,
              returnDate,
            });
            recentFlights.set(String(flight.id), enriched);
          }
        }
      }

      if (flights.length === 0) {
        log(`[${requestId}] 🗄️ No Duffel results`, "flights");
      }

      flights = flights.map((flight) =>
        enrichFareForTrip(flight, {
          tripType,
          packageType,
          passengers,
          returnDate,
        }),
      );

      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      res.json(flights);
    } catch (error) {
      log(`[${requestId}] ❌ ${error instanceof Error ? error.message : String(error)}`, "flights");
      res.status(500).json({ message: "Failed to fetch flights" });
    }
  });

  app.get("/api/flights/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: "Invalid ID" });

      const cachedFlight = recentFlights.get(String(id));
      if (cachedFlight) return res.json(cachedFlight);

      const isObjectId = /^[a-f\d]{24}$/i.test(String(id));
      const flight = isObjectId ? await storage.getFlight(id) : undefined;
      if (!flight) return res.status(404).json({ message: "Flight not found" });

      res.json(flight);
    } catch {
      res.status(500).json({ message: "Failed to fetch flight" });
    }
  });

  app.get("/api/flights/offer", async (req, res) => {
    try {
      const offerId = String(req.query.offerId || req.query.id || "").trim();
      if (!offerId) return res.status(400).json({ message: "Missing offerId query parameter" });

      try {
        const offer = await fetchDuffelOfferDetails(offerId);
        if (!offer) return res.status(404).json({ message: "Offer not found or Duffel not configured" });
        // Return the full Duffel offer object (normalized if needed by frontend)
        return res.json(offer);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return res.status(502).json({ message: `Duffel error: ${msg}` });
      }
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch offer details" });
    }
  });

  app.get("/api/airports/search", async (req, res) => {
    try {
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      const query = String(req.query.q || req.query.query || "").trim();
      if (!query) return res.json([]);

      const scope = req.query.scope === "city"
        ? "city"
        : req.query.scope === "country"
          ? "country"
          : "airport";

      const results = await searchMongoAirportsByQuery(query, scope);
      res.json(results);
    } catch {
      res.status(500).json({ message: "Failed to search airports" });
    }
  });

  app.get("/api/airports/cities", async (req, res) => {
    try {
      const query = String(req.query.q || req.query.query || "").trim();
      const results = await searchMongoCities(query);
      res.json(results);
    } catch {
      res.status(500).json({ message: "Failed to fetch city data" });
    }
  });

  app.get("/api/airports/countries", async (req, res) => {
    try {
      const query = String(req.query.q || req.query.query || "").trim();
      const results = await searchMongoCountries(query);
      res.json(results);
    } catch {
      res.status(500).json({ message: "Failed to fetch country data" });
    }
  });

  app.get("/api/airports/by-country", async (req, res) => {
    try {
      const countryCode = String(req.query.countryCode || req.query.country || "").trim();
      const results = await getAirportsByCountryCode(countryCode);
      res.json(results);
    } catch {
      res.status(500).json({ message: "Failed to fetch airports by country" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const input = bookingSchema.parse(req.body);
      const normalizedInput = {
        ...input,
        email: input.email || "",
        phone: input.phone || "",
      };
      const bookingRecord = {
        flightId: normalizedInput.flightId,
        passengerName: normalizedInput.passengerName,
        email: normalizedInput.email,
        phone: normalizedInput.phone,
        passportDetails: normalizedInput.passportDetails,
        bookingSource: normalizedInput.bookingSource || "local",
      };
      
      // Get flight details for email
      const flightId = String(normalizedInput.flightId);
      const cachedFlight = recentFlights.get(flightId);
      const isObjectId = /^[a-f\d]{24}$/i.test(flightId);
      const flight = cachedFlight || (isObjectId ? await storage.getFlight(flightId) : null);
      
      if (!flight) {
        return res.status(400).json({ message: "Flight not found. Please search again and try booking." });
      }
      
      // Create booking (non-blocking — continue even if DB is unavailable)
      try {
        await storage.createBooking(bookingRecord);
      } catch (dbErr) {
        log(`⚠️ DB save failed (continuing): ${dbErr instanceof Error ? dbErr.message : dbErr}`, "bookings");
      }

      const emailFlight = {
        ...flight,
        ...(normalizedInput.tripType ? { tripType: normalizedInput.tripType } : {}),
        ...(normalizedInput.returnFlight
          ? {
              returnFlight: {
                ...(flight?.returnFlight || {}),
                ...normalizedInput.returnFlight,
              },
            }
          : {}),
      };

      const duffelOfferId = flight?.duffel?.offerId || normalizedInput.duffelOfferId;

      let duffelOrder = null;
      if ((normalizedInput.bookingSource === "duffel" || flight?.source === "duffel") && duffelOfferId) {
        duffelOrder = await createDuffelOrder({
          ...normalizedInput,
          passengers: normalizedInput.passengers || [normalizedInput],
          duffelOfferId,
        }, flight);
      }
      
      // Send confirmation email
      const emailResult = await sendBookingConfirmation(normalizedInput, emailFlight);
      log(`📧 Email result: ${emailResult.success ? 'Sent' : 'Failed'} - ${emailResult.message}`, "bookings");
      
      // Log to Google Sheets if configured
      let sheetsResult = { success: false };
      if (process.env.GOOGLE_SHEETS_ID) {
        sheetsResult = await logBookingToSheet(bookingRecord, emailFlight, process.env.GOOGLE_SHEETS_ID);
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Booking created successfully!",
        emailSent: emailResult.success,
        sheetsLogged: sheetsResult.success,
        duffelOrder: duffelOrder ? {
          id: duffelOrder.id,
          bookingReference: duffelOrder.booking_reference,
          totalAmount: duffelOrder.total_amount,
          totalCurrency: duffelOrder.total_currency,
        } : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== SCRAPER ROUTES ====================
  
  /**
   * POST /api/scraper/google-flights
   * Scrape Google Flights data
   * Body: { url: string, method?: 'oxylabs' | 'serpapi', ... }
   */
  app.post("/api/scraper/google-flights", async (req, res) => {
    try {
      const { url, method = "oxylabs", departure, arrival, outbound_date, return_date } = req.body;

      if (!url && !departure) {
        return res.status(400).json({
          success: false,
          message: "Either a Google Flights URL or flight parameters (departure, arrival, outbound_date) are required",
        });
      }

      const scrapingOptions = {
        url,
        method,
        departure,
        arrival,
        outbound_date,
        return_date,
        oxylabs_username: process.env.OXYLABS_USERNAME,
        oxylabs_password: process.env.OXYLABS_PASSWORD,
        serpapi_key: process.env.SERPAPI_KEY,
      };

      const result = await scrapeFlights(scrapingOptions);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  });

  /**
   * POST /api/scraper/batch
   * Scrape multiple flight routes
   * Body: { flights: Array, method?: 'oxylabs' | 'serpapi' }
   */
  app.post("/api/scraper/batch", async (req, res) => {
    try {
      const { flights = [], method = "oxylabs" } = req.body;

      if (!Array.isArray(flights) || flights.length === 0) {
        return res.status(400).json({
          success: false,
          message: "flights array is required and must not be empty",
        });
      }

      const credentials = {
        oxylabs_username: process.env.OXYLABS_USERNAME,
        oxylabs_password: process.env.OXYLABS_PASSWORD,
        serpapi_key: process.env.SERPAPI_KEY,
      };

      const results = await scrapeMultipleFlights(flights, method, credentials);
      res.json({
        success: true,
        total: results.length,
        results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  });

  /**
   * GET /api/scraper/parse-url
   * Parse a Google Flights URL to extract parameters
   * Query: ?url=<encoded_url>
   */
  app.get("/api/scraper/parse-url", (req, res) => {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({
          success: false,
          message: "url query parameter is required",
        });
      }

      const result = parseGoogleFlightsURL(url);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  });

  /**
   * POST /api/scraper/html
   * Parse raw HTML content for flight data
   * Body: { html: string }
   */
  app.post("/api/scraper/html", async (req, res) => {
    try {
      const { html } = req.body;

      if (!html || typeof html !== "string") {
        return res.status(400).json({
          success: false,
          message: "Valid HTML string is required",
        });
      }

      const result = await scrapeFlights({
        method: "html",
        html_content: html,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  });
}

