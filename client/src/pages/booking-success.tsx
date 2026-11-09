import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { CheckCircle2, Mail, ClipboardList, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function formatPeriodTime(date: Date) {
  const hour = date.getHours();
  let period = "Night";
  if (hour >= 5 && hour < 12) period = "Morning";
  else if (hour >= 12 && hour < 17) period = "Afternoon";
  else if (hour >= 17 && hour < 21) period = "Evening";

  return `${period} ${format(date, "h:mm a")}`;
}

export function BookingSuccessPage() {
  const [, setLocation] = useLocation();
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // Get booking details from session storage (set by booking form on success)
    const details = sessionStorage.getItem("lastBooking");
    if (details) {
      setBookingDetails(JSON.parse(details));
    }
  }, []);

  const flight = bookingDetails?.flight;
  const inquiryId = bookingDetails?.inquiryId || bookingDetails?.bookingResponse?.inquiryId;
  const originLabel = flight?.originName && flight.originName !== flight.origin
    ? `${flight.originName} (${flight.origin})`
    : flight?.origin;
  const destinationLabel = flight?.destinationName && flight.destinationName !== flight.destination
    ? `${flight.destinationName} (${flight.destination})`
    : flight?.destination;
  const departureDate = flight?.departureTime ? new Date(flight.departureTime) : null;
  const arrivalDate = flight?.arrivalTime ? new Date(flight.arrivalTime) : null;
  const returnFlight = flight?.returnFlight;
  const returnDepartureDate = returnFlight?.departureTime ? new Date(returnFlight.departureTime) : null;
  const returnArrivalDate = returnFlight?.arrivalTime ? new Date(returnFlight.arrivalTime) : null;
  const returnOriginLabel = returnFlight
    ? returnFlight.originName && returnFlight.originName !== returnFlight.origin
      ? `${returnFlight.originName} (${returnFlight.origin})`
      : returnFlight.origin
    : "";
  const returnDestinationLabel = returnFlight
    ? returnFlight.destinationName && returnFlight.destinationName !== returnFlight.destination
      ? `${returnFlight.destinationName} (${returnFlight.destination})`
      : returnFlight.destination
    : "";

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Enquiry Received! ✈️</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Your request has been saved. Our team can review the trip details and follow up with the next steps.
            </p>
          </div>

          {/* What Happens Next */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Request Saved</h3>
              <p className="text-sm text-muted-foreground">
                The enquiry is stored locally for review and follow-up
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Captured</h3>
              <p className="text-sm text-muted-foreground">
                Traveller data and preferences are attached to the request
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Next Step</h3>
              <p className="text-sm text-muted-foreground">
                A human can now review and contact the passenger if needed
              </p>
            </div>
          </div>

          {/* Enquiry Details Card */}
          {bookingDetails && (
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Enquiry Details</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Passenger</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-lg font-bold text-foreground">{bookingDetails.passengerName}</p>
                    {bookingDetails.email ? (
                      <p className="text-sm text-muted-foreground">Email: {bookingDetails.email}</p>
                    ) : null}
                    {bookingDetails.phone ? (
                      <p className="text-sm text-muted-foreground">Phone: {bookingDetails.phone}</p>
                    ) : null}
                  </div>
                </div>

                {inquiryId ? (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Reference</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-1">
                      <p className="text-sm text-muted-foreground">Enquiry ID: <span className="font-medium text-foreground">{inquiryId}</span></p>
                    </div>
                  </div>
                ) : null}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Flight</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-2xl font-bold text-foreground">
                        {originLabel} → {destinationLabel}
                      </p>
                      <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                        Received
                      </span>
                    </div>
                    <p className="text-muted-foreground">{flight?.airline} {flight?.flightNumber}</p>
                    {departureDate && arrivalDate ? (
                      <p className="text-muted-foreground">
                        {formatPeriodTime(departureDate)} to {formatPeriodTime(arrivalDate)}
                      </p>
                    ) : null}

                    {returnFlight && returnDepartureDate && returnArrivalDate ? (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Return Flight</p>
                        <p className="text-foreground font-medium">{returnOriginLabel} → {returnDestinationLabel}</p>
                        <p className="text-muted-foreground">
                          {formatPeriodTime(returnDepartureDate)} to {formatPeriodTime(returnArrivalDate)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Duration</h3>
                    <p className="text-lg font-bold text-foreground">{bookingDetails.flight?.duration}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Stops</h3>
                    <p className="text-lg font-bold text-foreground">
                      {bookingDetails.flight?.stops === 0 ? 'Direct' : `${bookingDetails.flight?.stops} Stop${bookingDetails.flight?.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-4">📋 What Happens Next</h3>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <span>Review the saved enquiry details and contact preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <span>Prepare a tailored quote or follow-up based on the request</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <span>Share the enquiry ID if you want to reference this request later</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                <span>We can use the passenger details to continue the quote process</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
            <h3 className="text-lg font-bold text-green-900 mb-4">📞 Need Help?</h3>
            <p className="text-green-800 mb-4">Our customer service team is available 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-green-700">Call Us</p>
                <p className="text-2xl font-bold text-green-900">+1 (800) 554-2500</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-green-300"></div>
              <div className="text-center">
                <p className="text-sm text-green-700">Email Us</p>
                <p className="text-lg font-bold text-green-900">support@flightitude.com</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/")}
              className="px-8 py-6 text-lg font-bold rounded-xl"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => setLocation("/search")}
              variant="outline"
              className="px-8 py-6 text-lg font-bold rounded-xl border-2"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Submit Another Enquiry
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
