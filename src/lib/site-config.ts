export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "SkySwift",
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "SkySwift Flights",
  tagline: "Compare & Book Cheap Flights Across 500+ Airlines",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://skyswiftflights.com",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.EMAIL_USER || "support@skyswiftflights.com",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+1 877 371 7356",
  formattedPhone: "+1 (877) 371-7356",
  address: "United States",
  description:
    "Compare and book cheap flights from 500+ airlines. Find lowest airfare deals, last-minute flights, and exclusive travel offers. Call +1 877 371 7356 for best unpublished rates.",
  keywords: [
    "cheap flights",
    "book airline tickets",
    "flight deals",
    "last minute flights",
    "cheap airfare",
    "international flights",
    "domestic flights",
    "flight search",
    "SkySwift",
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
    twitter: "https://twitter.com/skyswiftflights",
    facebook: "https://facebook.com/skyswiftflights",
    instagram: "https://instagram.com/skyswiftflights",
  },
};

export default siteConfig;
