import mongoose from "mongoose";

const DATABASE_URL = "mongodb+srv://sammaali12:Sameer123@cluster0.s3oneko.mongodb.net/flight_search?appName=Cluster0";

async function check() {
  try {
    console.log("Connecting to flight_search...");
    await mongoose.connect(DATABASE_URL);
    console.log("Connected successfully.");
    
    const db = mongoose.connection.db;
    const airportsCollection = db.collection("airports");
    
    // Find Heathrow exactly
    const exact = await airportsCollection.findOne({ code: "LHR" });
    console.log("LHR EXACT FIND:", exact);
    
    // Find all starting with LHR
    const matches = await airportsCollection.find({
      $or: [
        { code: "LHR" },
        { iata_code: "LHR" },
        { name: /Heathrow/i }
      ]
    }).toArray();
    console.log(`Found ${matches.length} matches:`);
    for (const m of matches) {
      console.log(`- Code: ${m.code || m.iata_code}, Name: ${m.name}, City: ${m.city}, Country: ${m.country}`);
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await mongoose.disconnect();
  }
}

check();
