import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    origin: { type: String, default: "" },
    destination: { type: String, default: "" },
    departureDate: { type: Date },
    returnDate: { type: Date },
    passengers: { type: Number, default: 1 },
    cabin: { type: String, default: "Economy" },
    budget: { type: Number },
    source: { type: String, default: "Landing Page" },
    landingPage: { type: String, default: "" },
    status: { type: String, default: "New" },
    priority: { type: String, default: "High" },
    notes: [
      {
        note: { type: String },
        author: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const CallSchema = new mongoose.Schema(
  {
    clickTimestamp: { type: Date, default: Date.now },
    visitorIp: { type: String, default: "" },
    device: { type: String, default: "" },
    landingPage: { type: String, default: "" },
    numberDialed: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    status: { type: String, default: "Completed" },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
const Call = mongoose.models.Call || mongoose.model("Call", CallSchema);

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    // Create sample Lead entries for reports
    const sampleLeads = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 555 234 5678",
        origin: "NYC",
        destination: "LHR",
        budget: 650,
        source: "Landing Page",
        landingPage: "/lp/flights-to-london",
        status: "New",
        priority: "High",
        notes: [{ note: "Customer looking for flight deal to London next month", author: "System" }],
      },
      {
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        phone: "+1 555 876 5432",
        origin: "MIA",
        destination: "CDG",
        budget: 1200,
        source: "Call Tracking",
        landingPage: "/lp/cheap-flights-to-paris",
        status: "Booked",
        priority: "Urgent",
        notes: [{ note: "Confirmed booking for 2 passengers in Economy Premium", author: "Agent" }],
      },
      {
        name: "Michael Brown",
        email: "michael.b@example.com",
        phone: "+1 555 345 6789",
        origin: "LAX",
        destination: "DXB",
        budget: 1850,
        source: "Flight Search",
        landingPage: "/search",
        status: "Booked",
        priority: "High",
        notes: [{ note: "Business class deal closed via phone call", author: "Agent" }],
      },
    ];

    const insertedLeads = [];
    for (const leadData of sampleLeads) {
      const existing = await Lead.findOne({ email: leadData.email });
      if (existing) {
        insertedLeads.push(existing);
        console.log(`Lead already exists: ${existing.name} (ID: ${existing._id})`);
      } else {
        const lead = await Lead.create(leadData);
        insertedLeads.push(lead);
        console.log(`Report Lead created: ${lead.name} (ID: ${lead._id})`);
      }
    }

    // Create sample Call log entries for reports
    const sampleCalls = [
      {
        numberDialed: "+18882566747",
        duration: 245,
        status: "Completed",
        device: "Desktop (Chrome)",
        visitorIp: "192.168.1.100",
        landingPage: "/lp/flights-to-london",
        leadId: insertedLeads[0]?._id,
      },
      {
        numberDialed: "+18882566747",
        duration: 380,
        status: "Completed",
        device: "Mobile (Safari / iPhone)",
        visitorIp: "172.56.21.84",
        landingPage: "/lp/cheap-flights-to-miami",
        leadId: insertedLeads[1]?._id,
      },
    ];

    for (const callData of sampleCalls) {
      const call = await Call.create(callData);
      console.log(`Report Call log created: ${call.numberDialed} - ${call.duration}s (ID: ${call._id})`);
    }

    const leadCount = await Lead.countDocuments();
    const callCount = await Call.countDocuments();
    console.log(`\nReport data summary:`);
    console.log(`- Total Leads: ${leadCount}`);
    console.log(`- Total Telephony Calls: ${callCount}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Error creating report entries:", err);
    process.exit(1);
  }
}

main();
