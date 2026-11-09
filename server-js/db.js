import { MongoClient } from "mongodb";

let cachedDb;

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }
  
  if (cachedDb) return cachedDb;

  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  cachedDb = client.db("flight_search");
  return cachedDb;
}
