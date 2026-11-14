import type { Metadata } from "next";
import { BookingSuccessPage } from "@/views/booking-success";

export const metadata: Metadata = {
  title: "Booking Received Successfully",
  description: "Your flight booking enquiry has been received by MerryTravelo Flights.",
};

export default function Page() {
  return <BookingSuccessPage />;
}
