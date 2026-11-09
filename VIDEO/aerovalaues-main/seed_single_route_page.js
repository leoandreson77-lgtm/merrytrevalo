const mongoose = require("mongoose");

const DATABASE_URL = "mongodb+srv://sammaali12:Sameer123@cluster0.s3oneko.mongodb.net/flight_search?appName=Cluster0";

const LandingPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
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
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LandingPage = mongoose.models.LandingPage || mongoose.model("LandingPage", LandingPageSchema);

const singlePageData = {
  slug: "nonstop-flights",
  title: "Nonstop Domestic Flights & Direct Routes Comparison",
  description: "Compare nonstop flight routes and availability across Delta, United, and American Airlines. Lock in discounted contract rates on direct flights today.",
  callPhone: "",
  seoTitle: "Nonstop Domestic Flight Routes & Airline Comparison Table",
  seoDescription: "Compare direct flight availability on key routes: JFK to RDU, BOS to DCA, ORD to PHL, ORD to CLT, and ORD to DCA. Book unpublished contract fares.",
  isPublished: true,
  blocks: [
    {
      type: "boarding_pass_hero",
      content: {
        title: "Nonstop Flights Hub",
        subtitle: "Compare direct routes across Delta, United, and American Airlines. Call our ticketing desk to lock in private contract fares up to 40% off.",
        ctaText: "Claim Boarding Pass"
      }
    },
    {
      type: "routes_table",
      content: {
        title: "Popular Nonstop Routes & Direct Carriers List",
        rows: [
          {
            route: "New York (JFK) ↔️ Raleigh–Durham (RDU)",
            delta: true,
            united: true,
            american: true,
            others: "None (most seasons)"
          },
          {
            route: "Boston (BOS) ↔️ Washington Reagan (DCA)",
            delta: true,
            united: true,
            american: true,
            others: "None"
          },
          {
            route: "Chicago (ORD) ↔️ Philadelphia (PHL)",
            delta: true,
            united: true,
            american: true,
            others: "None"
          },
          {
            route: "Chicago (ORD) ↔️ Charlotte (CLT)",
            delta: true,
            united: true,
            american: true,
            others: "None"
          },
          {
            route: "Chicago (ORD) ↔️ Washington Reagan (DCA)",
            delta: true,
            united: true,
            american: true,
            others: "None"
          },
          {
            route: "Chicago (ORD) ↔️ Washington Dulles (IAD)",
            delta: true,
            united: true,
            american: true,
            others: "None"
          }
        ]
      }
    },
    {
      type: "partners",
      content: {}
    },
    {
      type: "testimonials",
      content: {}
    },
    {
      type: "faq",
      content: {
        items: [
          { question: "How do I get the lowest contract fare?", answer: "Call our dedicated booking line to lock in unpublished private fares not available online." },
          { question: "Are these flight tickets refundable?", answer: "Flexible refund and change options are available depending on the carrier and season. Ask our agents." },
          { question: "Which airlines fly this route?", answer: "Delta Air Lines, United Airlines, and American Airlines offer direct flights on this route." }
        ]
      }
    }
  ]
};

async function seed() {
  try {
    console.log("Connecting to flight_search MongoDB...");
    await mongoose.connect(DATABASE_URL);
    console.log("Connected successfully!");

    console.log(`Processing single page: ${singlePageData.slug}...`);
    await LandingPage.deleteOne({ slug: singlePageData.slug });

    const newPage = new LandingPage(singlePageData);
    await newPage.save();
    console.log(`Successfully created page: ${singlePageData.slug}`);

    console.log("Single page routes table successfully seeded!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
