import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useLocation } from "wouter";
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
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch flights");
      return api.flights.search.responses[200].parse(await res.json());
    },
    enabled: hasRequiredSearchInput,
    // Don't refetch on window focus for flight search
    refetchOnWindowFocus: false,
  });
}

export function useFlight(id?: string) {
  return useQuery({
    queryKey: [api.flights.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.flights.get.path, { id: id || "" });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch flight details");
      return api.flights.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const [, setLocation] = useLocation();
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

      return { input: inquiry, response: { saved: true, inquiryId: inquiry.inquiryId } };
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
        title: "Enquiry received",
        description: "Your request has been saved and our team can review it next.",
        duration: 5000,
      });
      setLocation("/booking-success");
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
