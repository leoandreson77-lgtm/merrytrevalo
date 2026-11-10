function sanitizeValue(val: string | undefined, fallback: string): string {
  if (!val || typeof val !== "string") return fallback;
  const lower = val.toLowerCase();
  if (lower.includes("skyswift") || lower.includes("flightitude")) {
    return fallback;
  }
  return val;
}

export const siteConfig = {
  name: sanitizeValue(process.env.NEXT_PUBLIC_SITE_NAME, "JetWithFly"),
  brandName: sanitizeValue(process.env.NEXT_PUBLIC_BRAND_NAME, "JetWithFly Flights"),
  tagline: "Compare & Book Cheap Flights Across 500+ Airlines",
  url: sanitizeValue(process.env.NEXT_PUBLIC_SITE_URL, "https://jetwithfly.com"),
  supportEmail: sanitizeValue(process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.EMAIL_USER, "support@jetwithfly.com"),
  phone: sanitizeValue(process.env.NEXT_PUBLIC_COMPANY_PHONE, "+1 877 371 7356"),
  formattedPhone: "+1 (877) 371-7356",
  address: "United States",
  description:
    "Compare and book cheap flights from 500+ airlines with JetWithFly. Find lowest airfare deals, last-minute flights, and exclusive travel offers. Call +1 877 371 7356 for best unpublished rates.",
  keywords: [
    "cheap flights",
    "book airline tickets",
    "flight deals",
    "last minute flights",
    "cheap airfare",
    "international flights",
    "domestic flights",
    "flight search",
    "JetWithFly",
    "JetWithFly Flights",
    "jetwithfly.com",
    "discount flights",
    "lowest airfare",
    "flight booking",
    "airline tickets",
    "book flight tickets",
    "flight reservations",
    "airline reservations",
    "airline booking",
    "same day flight booking",
    "business class flights",
    "round trip flights",
    "one way flights"
  ],
  social: {
    twitter: "https://twitter.com/jetwithfly",
    facebook: "https://facebook.com/jetwithfly",
    instagram: "https://instagram.com/jetwithfly",
  },
};

export default siteConfig;
