import { z } from "zod";

const bookingInputSchema = z
  .object({
    flightId: z.union([z.string(), z.number()]),
    passengerName: z.string().min(1, "Passenger name is required"),
    email: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "Please enter a valid email address",
      }),
    phone: z.string().trim().optional(),
    bornOn: z.string().trim().optional(),
    title: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    passportDetails: z.string().min(1, "Passport details are required"),
    bookingSource: z.enum(["duffel", "local"]).optional(),
    duffelOfferId: z.string().optional(),
    passengers: z
      .array(
        z.object({
          passengerName: z.string().min(1).optional(),
          email: z.string().trim().optional(),
          phone: z.string().trim().optional(),
          bornOn: z.string().trim().optional(),
          title: z.string().trim().optional(),
          gender: z.string().trim().optional(),
          passportDetails: z.string().trim().optional(),
        }),
      )
      .optional(),
    tripType: z.enum(["oneway", "round"]).optional(),
    returnFlight: z.object({
      airline: z.string().optional(),
      airlineCode: z.string().optional(),
      origin: z.string(),
      destination: z.string(),
      departureTime: z.union([z.string(), z.date()]).transform(v => typeof v === 'string' ? new Date(v) : v),
      arrivalTime: z.union([z.string(), z.date()]).transform(v => typeof v === 'string' ? new Date(v) : v),
      duration: z.string(),
      stops: z.number(),
      price: z.number().optional(),
    }).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.email?.trim() && !data.phone?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Please provide at least an email address or phone number",
      });
    }

    if (data.bookingSource === "duffel") {
      if (!data.bornOn?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bornOn"],
          message: "Date of birth is required for Duffel bookings",
        });
      }
      if (!data.title?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["title"],
          message: "Title is required for Duffel bookings",
        });
      }
      if (!data.gender?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gender"],
          message: "Gender is required for Duffel bookings",
        });
      }
      if (!data.duffelOfferId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["duffelOfferId"],
          message: "Duffel offer reference is required for booking",
        });
      }
    }
  });

// API response schemas
const flightSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  airline: z.string(),
  airlineCode: z.string().optional(),
  flightNumber: z.string(),
  origin: z.string(),
  originName: z.string().optional(),
  originCountryName: z.string().optional(),
  destination: z.string(),
  destinationName: z.string().optional(),
  destinationCountryName: z.string().optional(),
  departureTime: z.union([z.string(), z.date()]).transform(v => typeof v === 'string' ? new Date(v) : v),
  arrivalTime: z.union([z.string(), z.date()]).transform(v => typeof v === 'string' ? new Date(v) : v),
  price: z.number(),
  duration: z.string(),
  stops: z.number(),
  amenities: z.array(z.string()).optional(),
  luggage: z.array(z.string()).optional(),
  tripType: z.enum(["oneway", "round"]).optional(),
  returnDate: z.string().optional(),
  packageType: z.enum(["solo", "couple", "family"]).optional(),
  passengers: z.number().int().positive().optional(),
  source: z.string().optional(),
  deepLink: z.string().optional(),
  returnFlight: z.object({
    airline: z.string().optional(),
    airlineCode: z.string().optional(),
    origin: z.string(),
    originName: z.string().optional(),
    originCountryName: z.string().optional(),
    destination: z.string(),
    destinationName: z.string().optional(),
    destinationCountryName: z.string().optional(),
    departureTime: z.union([z.string(), z.date()]).transform(v => typeof v === 'string' ? new Date(v) : v),
    arrivalTime: z.union([z.string(), z.date()]).transform(v => typeof v === 'string' ? new Date(v) : v),
    duration: z.string(),
    stops: z.number(),
  }).optional(),
});

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  flights: {
    search: {
      method: "GET" as const,
      path: "/api/flights/search" as const,
      input: z.object({
        origin: z.string().optional(),
        destination: z.string().optional(),
        date: z.string().optional(),
        returnDate: z.string().optional(),
        tripType: z.enum(["oneway", "round"]).optional(),
        package: z.enum(["solo", "couple", "family"]).optional(),
        passengers: z.coerce.number().int().positive().optional(),
      }).optional(),
      responses: {
        200: z.array(flightSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/flights/:id" as const,
      responses: {
        200: flightSchema,
        404: errorSchemas.notFound,
      },
    }
  },
  bookings: {
    create: {
      method: "POST" as const,
      path: "/api/bookings" as const,
      input: bookingInputSchema,
      responses: {
        201: z.object({ success: z.boolean(), message: z.string() }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
