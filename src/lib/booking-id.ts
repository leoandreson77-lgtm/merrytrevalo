/**
 * Generates an official, unique Booking Reference ID for MerryTravelo Flights.
 * Format: MT-XXXXXX (e.g. MT-849201 or MT-7X9K24)
 */
export function generateBookingId(prefix: string = "MT"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${random}`;
}
