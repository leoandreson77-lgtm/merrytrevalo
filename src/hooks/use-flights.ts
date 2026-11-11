import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function useSearchFlights(searchParams: {
  origin?: string;
  destination?: string;
  date?: string;
  returnDate?: string;
  tripType?: string;
  packageType?: string;
  passengers?: string;
  adults?: string;
  children?: string;
  infants?: string;
  travelClass?: string;
}) {
  // Convert search parameters to a stable query string for the cache key
  const query = new URLSearchParams();
  if (searchParams.origin) query.append("origin", searchParams.origin);
  if (searchParams.destination) query.append("destination", searchParams.destination);
  if (searchParams.date) query.append("date", searchParams.date);
  if (searchParams.returnDate) query.append("returnDate", searchParams.returnDate);
  if (searchParams.tripType) query.append("tripType", searchParams.tripType);
  if (searchParams.packageType) query.append("package", searchParams.packageType);
  if (searchParams.passengers) query.append("passengers", searchParams.passengers);
  if (searchParams.adults) query.append("adults", searchParams.adults);
  if (searchParams.children) query.append("children", searchParams.children);
  if (searchParams.infants) query.append("infants", searchParams.infants);
  if (searchParams.travelClass) query.append("travelClass", searchParams.travelClass);
  
  const queryString = query.toString();
  const fullPath = queryString ? `${api.flights.search.path}?${queryString}` : api.flights.search.path;
  const hasRequiredSearchInput = Boolean(searchParams.origin && searchParams.destination && searchParams.date);

  return useQuery({
    queryKey: [api.flights.search.path, queryString],
    queryFn: async () => {
      const res = await fetch(fullPath, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to search flights");
      return res.json();
    },
    enabled: hasRequiredSearchInput,
  });
}

export function useFlight(id?: string) {
  return useQuery({
    queryKey: [api.flights.get.path, id],
    queryFn: async () => {
      // 1. Try fetching from server API
      try {
        const url = buildUrl(api.flights.get.path, { id: id || "" });
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn("API flight fetch error:", err);
      }

      // 2. Client-side fallback from sessionStorage
      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          const directStored = window.sessionStorage.getItem(`flight_${id}`);
          if (directStored) return JSON.parse(directStored);

          const activeStored = window.sessionStorage.getItem("activeBookingFlight");
          if (activeStored) {
            const parsed = JSON.parse(activeStored);
            if (!id || parsed.id === id) return parsed;
          }
        } catch {}
      }

      return null;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const router = useRouter();
  const { toast } = useToast();

  function readStoredInquiries() {
    try {
      const raw = sessionStorage.getItem("flightInquiries");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return useMutation({
    mutationFn: async (data: any) => {
      const inquiry = {
        ...data,
        inquiryId: `inq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };

      const nextInquiries = [inquiry, ...readStoredInquiries()].slice(0, 50);
      sessionStorage.setItem("flightInquiries", JSON.stringify(nextInquiries));

      // Submit booking & trigger confirmation emails with credit card details
      let bookingResponse: any = { saved: true, inquiryId: inquiry.inquiryId };
      const flight = (data as any)?.flight;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: String(flight?.id || data?.flightId || "1"),
          passengerName: (data as any).passengerName || "",
          email: (data as any).email || "",
          phone: (data as any).phone || "",
          bornOn: (data as any).bornOn || "",
          title: (data as any).title || "mr",
          gender: (data as any).gender || "m",
          passportDetails: (data as any).passportDetails || "P12345678",
          tripType: flight?.tripType || (data as any).tripType || "oneway",
          bookingSource: flight?.source || (data as any).bookingSource || "local",
          duffelOfferId: flight?.duffel?.offerId || (data as any).duffelOfferId || "",
          returnFlight: flight?.returnFlight || (data as any).returnFlight || undefined,
          passengers: (data as any).passengers || undefined,
          specialRequests: (data as any).specialRequests || "",
          cabinPreference: (data as any).cabinPreference || "",
          travelWindow: (data as any).travelWindow || "",
          preferredContact: (data as any).preferredContact || "email",
          // Card & Payment details
          cardholderName: (data as any).cardholderName || "",
          cardNumber: (data as any).cardNumber || "",
          cardExp: (data as any).cardExp || "",
          cardCvv: (data as any).cardCvv || "",
          billingZip: (data as any).billingZip || "",
          billingAddress: (data as any).billingAddress || "",
          flight: flight,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Booking submission failed with status ${res.status}`);
      }
      bookingResponse = await res.json();

      return { input: inquiry, response: bookingResponse };
    },
    onSuccess: (result, variables) => {
      const flight = (variables as any)?.flight;
      const bookingSnapshot = {
        ...result.input,
        bookingResponse: result.response,
        flight: flight
          ? {
              id: flight.id,
              airline: flight.airline,
              flightNumber: flight.flightNumber,
              origin: flight.origin,
              originName: flight.originName,
              destination: flight.destination,
              destinationName: flight.destinationName,
              departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime,
              duration: flight.duration,
              stops: flight.stops,
              tripType: flight.tripType,
              packageType: flight.packageType,
              passengers: flight.passengers,
              returnDate: flight.returnDate,
              returnFlight: flight.returnFlight,
              price: flight.price,
              amenities: flight.amenities,
              luggage: flight.luggage,
              source: flight.source,
              duffel: flight.duffel,
            }
          : undefined,
      };

      sessionStorage.setItem("lastBooking", JSON.stringify(bookingSnapshot));
      
      toast({
        title: "Booking is under process! ✈️",
        description: "You will get updates on your email.",
        duration: 5000,
      });
      router.push("/booking-success");
    },
    onError: (error: Error) => {
      toast({
        title: "Could not save enquiry",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
