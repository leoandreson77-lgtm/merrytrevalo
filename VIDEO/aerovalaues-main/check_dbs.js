import mongoose from "mongoose";

const DATABASE_URL = "mongodb+srv://sammaali12:Sameer123@cluster0.s3oneko.mongodb.net/flight_search?appName=Cluster0";

async function check() {
  try {
    console.log("Connecting to flight_search...");
    await mongoose.connect(DATABASE_URL);
    
    const db = mongoose.connection.db;
    const airportsCollection = db.collection("airports");
    
    // Find JFK exactly
    const exactJfk = await airportsCollection.findOne({ code: "JFK" });
    console.log("JFK EXACT FIND:", exactJfk);
    
    // Find JFK by name
    const nameJfk = await airportsCollection.find({ name: /Kennedy/i }).toArray();
    console.log(`Found ${nameJfk.length} Kennedy airports:`);
    for (const m of nameJfk) {
      console.log(`- Code: ${m.code || m.iata_code}, Name: ${m.name}`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

check();
