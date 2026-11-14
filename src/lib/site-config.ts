function sanitizeValue(val: string | undefined, fallback: string): string {
  if (!val || typeof val !== "string") return fallback;
  const lower = val.toLowerCase();
  if (lower.includes("skyswift") || lower.includes("flightitude") || lower.includes("jetwithfly")) {
    return fallback;
  }
  return val;
}

export const siteConfig = {
  name: sanitizeValue(process.env.NEXT_PUBLIC_SITE_NAME, "MerryTravelo"),
  brandName: sanitizeValue(process.env.NEXT_PUBLIC_BRAND_NAME, "MerryTravelo Flights"),
  tagline: "Compare & Book Cheap Flights Across 500+ Airlines",
  url: sanitizeValue(process.env.NEXT_PUBLIC_SITE_URL, "https://merrytravelo.com"),
  supportEmail: sanitizeValue(process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.EMAIL_USER, "support@merrytravelo.com"),
  phone: sanitizeValue(process.env.NEXT_PUBLIC_COMPANY_PHONE, "+1 855 510 6415"),
  formattedPhone: "+1 (855) 510-6415",
  address: "United States",
  description:
    "Compare and book cheap flights from 500+ airlines with MerryTravelo. Find lowest airfare deals, last-minute flights, and exclusive travel offers. Call +1 855 510 6415 for best unpublished rates.",
  keywords: [
    "cheap flights",
    "book airline tickets",
    "flight deals",
    "last minute flights",
    "cheap airfare",
    "international flights",
    "domestic flights",
    "flight search",
    "MerryTravelo",
    "MerryTravelo Flights",
    "merrytravelo.com",
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
    twitter: "https://twitter.com/merrytravelo",
    facebook: "https://facebook.com/merrytravelo",
    instagram: "https://instagram.com/merrytravelo",
  },
};

export default siteConfig;
