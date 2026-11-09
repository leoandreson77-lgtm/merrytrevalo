function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeCabinClass(value) {
  const input = String(value || "Economy").trim().toLowerCase();
  if (input.includes("first")) return "first";
  if (input.includes("business")) return "business";
  if (input.includes("premium")) return "premium_economy";
  return "economy";
}

function parseMoneyToCents(value) {
  const amount = Number.parseFloat(String(value || "0"));
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

function formatDuration(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "N/A";

  const minutes = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

function buildPassengers(adults, children, infants) {
  const passengers = [];

  for (let index = 0; index < adults; index += 1) passengers.push({ type: "adult" });
  for (let index = 0; index < children; index += 1) passengers.push({ age: 12 });
  for (let index = 0; index < infants; index += 1) passengers.push({ age: 1 });

  return passengers.length > 0 ? passengers : [{ type: "adult" }];
}

function buildSlices(origin, destination, departureDate, returnDate) {
  const slices = [
    {
      origin: normalizeCode(origin),
      destination: normalizeCode(destination),
      departure_date: String(departureDate),
    },
  ];

  if (returnDate) {
    slices.push({
      origin: normalizeCode(destination),
      destination: normalizeCode(origin),
      departure_date: String(returnDate),
    });
  }

  return slices;
}

function collectSegments(offer) {
  const slices = Array.isArray(offer?.slices) ? offer.slices : [];
  return slices.flatMap((slice) => (Array.isArray(slice?.segments) ? slice.segments : []));
}

function getCarrier(segment) {
  const carrier = segment?.marketing_carrier || segment?.operating_carrier || {};
  return {
    code: normalizeCode(carrier?.iata_code || carrier?.iataCode || carrier?.code || segment?.marketing_carrier_iata_code || segment?.operating_carrier_iata_code),
    name: String(carrier?.name || carrier?.marketing_carrier_name || segment?.marketing_carrier_name || segment?.operating_carrier_name || "Duffel Airline").trim(),
  };
}

function getAirportCode(item) {
  return normalizeCode(item?.iata_code || item?.iataCode || item?.iata || item?.code || item?.airport_code || item?.airportCode);
}

function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractAmenitiesAndLuggage(offer) {
  const amenities = new Set();
  const luggage = new Set();
  const slices = Array.isArray(offer?.slices) ? offer.slices : [];

  for (const slice of slices) {
    const segments = Array.isArray(slice?.segments) ? slice.segments : [];
    for (const segment of segments) {
      const passengers = Array.isArray(segment?.passengers) ? segment.passengers : [];
      for (const passenger of passengers) {
        const cabin = passenger?.cabin || {};
        const cabinAmenities = cabin?.amenities || {};

        if (cabin?.marketing_name) {
          amenities.add(`Cabin: ${cabin.marketing_name}`);
        }

        if (cabinAmenities?.power?.available) {
          amenities.add("Power outlet available");
        }

        if (cabinAmenities?.wifi?.available) {
          const wifiCost = String(cabinAmenities?.wifi?.cost || "").trim().toLowerCase();
          const wifiLabel = wifiCost === "free"
            ? "Wi-Fi: Free"
            : wifiCost === "paid"
              ? "Wi-Fi: Paid"
              : "Wi-Fi available";
          amenities.add(wifiLabel);
        }

        if (cabinAmenities?.seat?.type) {
          amenities.add(`Seat: ${toTitleCase(cabinAmenities.seat.type)}`);
        }

        if (cabinAmenities?.seat?.legroom && cabinAmenities.seat.legroom !== "n/a") {
          amenities.add(`Legroom: ${toTitleCase(cabinAmenities.seat.legroom)}`);
        }

        const baggages = Array.isArray(passenger?.baggages) ? passenger.baggages : [];
        for (const bag of baggages) {
          const bagType = String(bag?.type || "").trim().toLowerCase();
          const bagLabel = bagType === "carry_on"
            ? "Carry-on"
            : bagType === "checked"
              ? "Checked baggage"
              : bagType
                ? toTitleCase(bagType)
                : "Baggage";

          if (typeof bag?.quantity === "number") {
            luggage.add(`${bagLabel}: ${bag.quantity} bag${bag.quantity === 1 ? "" : "s"}`);
          } else if (typeof bag?.weight === "number" && bag?.weightUnit) {
            luggage.add(`${bagLabel}: ${bag.weight}${bag.weightUnit}`);
          } else {
            luggage.add(bagLabel);
          }
        }
      }
    }
  }

  return {
    amenities: Array.from(amenities),
    luggage: Array.from(luggage),
  };
}

function mapSliceToReturnFlight(slice, fallbackCurrency) {
  const segments = Array.isArray(slice?.segments) ? slice.segments : [];
  if (!segments.length) return undefined;

  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const carrier = getCarrier(firstSegment);
  const origin = getAirportCode(firstSegment?.origin) || normalizeCode(firstSegment?.origin?.iata_code);
  const destination = getAirportCode(lastSegment?.destination) || normalizeCode(lastSegment?.destination?.iata_code);
  const departureTime = firstSegment?.departing_at || firstSegment?.departure_at || firstSegment?.departure_time;
  const arrivalTime = lastSegment?.arriving_at || lastSegment?.arrival_at || lastSegment?.arrival_time;

  return {
    airline: carrier.name,
    airlineCode: carrier.code,
    origin,
    destination,
    departureTime,
    arrivalTime,
    duration: formatDuration(departureTime, arrivalTime),
    stops: Math.max(segments.length - 1, 0),
    price: parseMoneyToCents(slice?.total_amount || slice?.base_amount || 0),
    currency: slice?.total_currency || fallbackCurrency,
  };
}

function mapOfferToFlight(offer, fallbackOrigin, fallbackDestination) {
  const slices = Array.isArray(offer?.slices) ? offer.slices : [];
  const returnSlice = slices[1] || null;
  const segments = collectSegments(offer);
  const firstSegment = segments[0] || null;
  const lastSegment = segments[segments.length - 1] || null;
  if (!firstSegment || !lastSegment) return null;

  const carrier = getCarrier(firstSegment);
  const origin = getAirportCode(firstSegment?.origin) || normalizeCode(fallbackOrigin);
  const destination = getAirportCode(lastSegment?.destination) || normalizeCode(fallbackDestination);
  const departureTime = firstSegment?.departing_at || firstSegment?.departure_at || firstSegment?.departure_time;
  const arrivalTime = lastSegment?.arriving_at || lastSegment?.arrival_at || lastSegment?.arrival_time;
  const totalPrice = parseMoneyToCents(offer?.total_amount || offer?.amount || offer?.base_amount || 0);
  const currency = String(offer?.total_currency || offer?.currency || "USD").toUpperCase();
  const extractedExtras = extractAmenitiesAndLuggage(offer);

  return {
    id: `duffel-${offer?.id || `${origin}-${destination}-${departureTime || "offer"}`}`,
    airline: carrier.name,
    airlineCode: carrier.code,
    flightNumber: String(firstSegment?.marketing_carrier_flight_number || firstSegment?.operating_carrier_flight_number || firstSegment?.flight_number || offer?.id || "").trim(),
    origin,
    destination,
    departureTime,
    arrivalTime,
    price: totalPrice,
    totalPrice,
    currency,
    duration: formatDuration(departureTime, arrivalTime),
    stops: Math.max(segments.length - 1, 0),
    source: "duffel",
    ...(extractedExtras.amenities.length ? { amenities: extractedExtras.amenities } : {}),
    ...(extractedExtras.luggage.length ? { luggage: extractedExtras.luggage } : {}),
    returnFlight: returnSlice ? mapSliceToReturnFlight(returnSlice, currency) : undefined,
    duffel: {
      offerId: offer?.id,
      slices,
      segments,
      totalCurrency: currency,
      totalAmount: offer?.total_amount,
    },
  };
}

export async function fetchDuffelFlights(origin, destination, departureDate, options = {}) {
  const accessToken = String(options.accessToken || process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY || "").trim();
  if (!accessToken || !origin || !destination || !departureDate) return [];

  const adults = Math.max(1, Math.min(Number.parseInt(String(options.adults || options.passengers || "1"), 10) || 1, 9));
  const children = Math.max(0, Math.min(Number.parseInt(String(options.children || "0"), 10) || 0, 8));
  const infants = Math.max(0, Math.min(Number.parseInt(String(options.infants || "0"), 10) || 0, adults));
  const cabinClass = normalizeCabinClass(options.travelClass || options.cabinClass);
  const returnDate = options.returnDate ? String(options.returnDate) : undefined;

  const response = await fetch("https://api.duffel.com/air/offer_requests", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Duffel-Version": "v2",
    },
    body: JSON.stringify({
      data: {
        slices: buildSlices(origin, destination, departureDate, returnDate),
        passengers: buildPassengers(adults, children, infants),
        cabin_class: cabinClass,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Duffel request failed with ${response.status}${message ? `: ${message}` : ""}`);
  }

  const data = await response.json();
  const offerRequest = data?.data || data;
  const offers = Array.isArray(offerRequest?.offers) ? offerRequest.offers : [];

  return offers
    .map((offer) => mapOfferToFlight(offer, origin, destination))
    .filter(Boolean);
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { given_name: "Passenger", family_name: "Passenger" };
  if (parts.length === 1) return { given_name: parts[0], family_name: parts[0] };
  return { given_name: parts[0], family_name: parts.slice(1).join(" ") };
}

function normalizePassenger(passenger, index) {
  const nameParts = splitName(passenger?.passengerName || passenger?.name || passenger?.fullName || `Passenger ${index + 1}`);
  const email = String(passenger?.email || "").trim();
  const phone = String(passenger?.phone || passenger?.phone_number || "").trim();
  const bornOn = String(passenger?.born_on || passenger?.dateOfBirth || passenger?.dob || "").trim();
  const title = String(passenger?.title || "mr").trim().toLowerCase() || "mr";
  const gender = String(passenger?.gender || "m").trim().toLowerCase() || "m";
  return {
    id: String(passenger?.id || `pax-${index + 1}`),
    email,
    phone_number: phone,
    born_on: bornOn,
    title,
    gender,
    ...nameParts,
  };
}

export async function createDuffelOrder(booking, flight) {
  const accessToken = String(process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY || "").trim();
  const offerId = String(flight?.duffel?.offerId || flight?.offerId || booking?.duffelOfferId || "").trim();
  if (!accessToken || !offerId) {
    throw new Error("Duffel is not configured for booking");
  }

  const passengers = Array.isArray(booking?.passengers) && booking.passengers.length > 0
    ? booking.passengers.map((passenger, index) => normalizePassenger(passenger, index))
    : [normalizePassenger(booking, 0)];

  const firstPassenger = passengers[0];
  if (!firstPassenger.email || !firstPassenger.phone_number || !firstPassenger.born_on) {
    throw new Error("Duffel booking requires passenger email, phone number, and date of birth");
  }

  const response = await fetch("https://api.duffel.com/air/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Duffel-Version": "v2",
    },
    body: JSON.stringify({
      data: {
        selected_offers: [offerId],
        payments: [
          {
            type: "balance",
            currency: String(flight?.currency || "USD").toUpperCase(),
            amount: String(flight?.duffel?.totalAmount || flight?.totalPrice || flight?.price || 0),
          },
        ],
        passengers,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Duffel order creation failed with ${response.status}${message ? `: ${message}` : ""}`);
  }

  const data = await response.json();
  return data?.data || data;
}

export async function fetchDuffelAirports(query) {
  const accessToken = String(process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY || "").trim();
  if (!accessToken || !query) return [];

  const url = `https://api.duffel.com/air/airports?query=${encodeURIComponent(String(query).trim())}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Duffel-Version": "v2",
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Duffel airports request failed with ${response.status}${message ? `: ${message}` : ""}`);
  }

  const data = await response.json().catch(() => null);
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.airports) ? data.airports : [];

  return list
    .map((item) => {
      const name = String(item?.name || item?.full_name || item?.airport_name || "").trim();
      const city = String(item?.city || item?.municipality || "").trim();
      const country = String(item?.country || item?.country_name || "").trim();
      const location = [city, country].filter(Boolean).join(", ");

      return {
        name,
        location,
      };
    })
    .filter((airport) => airport.name || airport.location);
}

export async function fetchDuffelOfferDetails(offerId) {
  const accessToken = String(process.env.DUFFEL_ACCESS_TOKEN || process.env.DUFFEL_API_KEY || "").trim();
  if (!accessToken || !offerId) return null;

  const url = `https://api.duffel.com/air/offers/${encodeURIComponent(String(offerId).trim())}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Duffel-Version": "v2",
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Duffel offer fetch failed with ${response.status}${message ? `: ${message}` : ""}`);
  }

  const data = await response.json().catch(() => null);
  // Duffel returns object under data
  return data?.data || data || null;
}