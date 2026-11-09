import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

const LandingPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    callPhone: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    schemaMarkup: { type: String, default: "" },
    blocks: [
      {
        type: { type: String, required: true },
        content: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const LandingPage = mongoose.models.LandingPage || mongoose.model("LandingPage", LandingPageSchema);

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    const samplePages = [
      {
        slug: "flights-to-london",
        title: "Fly to London Heathrow (LHR) – Call Desk Reservation",
        description: "Avoid long online hold times. Connect directly with a live flight desk specialist for unpublished phone-only rates and instant seat selection to London.",
        callPhone: "+18882566747",
        seoTitle: "Fly to London Heathrow (LHR) - Exclusive Phone Discounts",
        seoDescription: "Book cheap flights to London Heathrow (LHR). Call +1 (888) 256-6747 for unpublished fares, instant seat selection, and 24/7 phone assistance.",
        isPublished: true,
        blocks: [
          {
            type: "boarding_pass_hero",
            content: {
              title: "Fly to London Heathrow (LHR) – Call Desk Reservation",
              subtitle: "Avoid long online hold times. Connect directly with a live flight desk specialist for unpublished phone-only rates and instant seat selection.",
              departureCode: "NYC",
              departureName: "New York City, USA",
              destinationCode: "LHR",
              destinationName: "London Heathrow, UK",
              passengerName: "RESERVED FOR YOU",
              seatNumber: "12A (Window)",
              boardingTime: "IMMEDIATE",
              topAlertText: "SPECIAL FARE ALERT: CALL NOW FOR INSTANT UNPUBLISHED PHONE DISCOUNTS",
            },
          },
          {
            type: "boarding_pass_routes",
            content: {
              title: "Active Boarding Passes & London Route Specials",
              subtitle: "Special contract fares on active flight routes. Call now to lock in your discount.",
              routes: [
                { title: "New York (JFK) to London (LHR)", slug: "flights-to-london", originCode: "JFK", originName: "New York, USA", destCode: "LHR", destName: "London, UK", seat: "14A", gate: "B4", priceOff: "Save 40%" },
                { title: "Los Angeles (LAX) to London (LHR)", slug: "flights-to-london", originCode: "LAX", originName: "Los Angeles, USA", destCode: "LHR", destName: "London, UK", seat: "18C", gate: "A2", priceOff: "Save 35%" },
                { title: "Miami (MIA) to London (LHR)", slug: "flights-to-london", originCode: "MIA", originName: "Miami, USA", destCode: "LHR", destName: "London, UK", seat: "10F", gate: "C1", priceOff: "Save 45%" },
                { title: "Chicago (ORD) to London (LHR)", slug: "flights-to-london", originCode: "ORD", originName: "Chicago, USA", destCode: "LHR", destName: "London, UK", seat: "21K", gate: "D3", priceOff: "Save 30%" },
              ],
            },
          },
          {
            type: "features",
            content: {
              features: [
                { icon: "📞", title: "Zero Hold Times", desc: "Connect directly to a live flight desk agent in under 30 seconds." },
                { icon: "💰", title: "Unpublished Fares", desc: "Access phone-only bulk rates not published on online search engines." },
                { icon: "✈️", title: "500+ Airlines Connected", desc: "Fly major carriers including Delta, American, United, and British Airways." },
                { icon: "🛡️", title: "Flexible Rebooking", desc: "Instant date change, cancellation & refund assistance over the phone." },
              ],
            },
          },
          {
            type: "faq",
            content: {
              items: [
                { question: "How do I book flights to London?", answer: "Simply call our 24/7 reservation hotline at +1 (888) 256-6747. Our travel specialists will hold your seat at the lowest rate." },
                { question: "Is calling really cheaper than booking online?", answer: "Yes! Airlines provide phone-exclusive contract fares that cannot be published on public search engines." },
                { question: "What is the wait time to talk to an agent?", answer: "Our average phone wait time is less than 30 seconds." },
              ],
            },
          },
        ],
      },
      {
        slug: "cheap-flights-to-miami",
        title: "Cheap Flights to Miami (MIA) - 24/7 Reservation Desk",
        description: "Get instant unpublished phone fares to Miami. Call now for exclusive discounts and direct flight assistance.",
        callPhone: "+18882566747",
        seoTitle: "Cheap Flights to Miami (MIA) - Direct Call Reservations",
        seoDescription: "Book cheap flights to Miami (MIA). Exclusive phone-only deals, instant seat reservations, and zero hold times.",
        isPublished: true,
        blocks: [
          {
            type: "boarding_pass_hero",
            content: {
              title: "Cheap Flights to Miami (MIA) - 24/7 Reservation Desk",
              subtitle: "Connect with our flight reservation desk for unpublished rates and instant seat booking.",
              departureCode: "NYC",
              departureName: "New York City, USA",
              destinationCode: "MIA",
              destinationName: "Miami, Florida",
              passengerName: "RESERVED FOR YOU",
              seatNumber: "15F (Aisle)",
              boardingTime: "IMMEDIATE",
              topAlertText: "MIAMI FARE SPECIAL: CALL NOW FOR UP TO 45% OFF REGULAR FARES",
            },
          },
          {
            type: "features",
            content: {
              features: [
                { icon: "📞", title: "Zero Hold Times", desc: "Connect directly to a live flight desk agent in under 30 seconds." },
                { icon: "💰", title: "Unpublished Fares", desc: "Access phone-only bulk rates not published on online search engines." },
                { icon: "✈️", title: "500+ Airlines Connected", desc: "Fly major carriers including Delta, American, United, and JetBlue." },
                { icon: "🛡️", title: "Flexible Rebooking", desc: "Instant date change, cancellation & refund assistance over the phone." },
              ],
            },
          },
        ],
      }
    ];

    for (const pageData of samplePages) {
      const page = await LandingPage.findOneAndUpdate(
        { slug: pageData.slug },
        pageData,
        { upsert: true, new: true }
      );
      console.log(`Landing page entry created/updated successfully: /lp/${page.slug} (ID: ${page._id})`);
    }

    const count = await LandingPage.countDocuments();
    console.log(`Total Landing Pages in database: ${count}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Error creating landing page entry:", err);
    process.exit(1);
  }
}

main();
