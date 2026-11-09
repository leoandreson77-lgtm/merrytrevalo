import { ObjectId } from "mongodb";
import { getDb } from "./db.js";

export const storage = {
  async getFlights(origin, destination) {
    const db = await getDb();
    const filter = {};

    if (origin) filter.origin = { $regex: origin, $options: "i" };
    if (destination) filter.destination = { $regex: destination, $options: "i" };

    const flights = await db.collection("flights").find(filter).toArray();
    return flights.map((flight) => ({
      ...flight,
      id: flight._id.toString(),
    }));
  },

  async getFlight(id) {
    const db = await getDb();
    const flight = await db.collection("flights").findOne({ _id: new ObjectId(id) });
    if (!flight) return undefined;
    return {
      ...flight,
      id: flight._id.toString(),
    };
  },

  async createBooking(input) {
    const db = await getDb();
    const result = await db.collection("bookings").insertOne({
      ...input,
      createdAt: new Date(),
    });

    return {
      ...input,
      id: result.insertedId.toString(),
      createdAt: new Date(),
    };
  },
};
