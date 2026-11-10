export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please login as admin." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const uri = body.uri || process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!uri || typeof uri !== "string") {
      return NextResponse.json({
        success: false,
        message: "No MongoDB connection string provided. Please enter a valid MongoDB URI.",
      }, { status: 400 });
    }

    // Quick regex validation
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      return NextResponse.json({
        success: false,
        message: "Invalid URI scheme. MongoDB connection strings must start with 'mongodb://' or 'mongodb+srv://'",
      }, { status: 400 });
    }

    // Create an isolated test connection with a 4.5s timeout
    const testConnection = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 4500,
      connectTimeoutMS: 4500,
      bufferCommands: false,
    }).asPromise();

    const db = testConnection.db;
    let collectionCount = 0;
    let dbName = testConnection.name || "default";

    if (db) {
      // Ping the database
      await db.command({ ping: 1 });
      const collections = await db.listCollections().toArray();
      collectionCount = collections.length;
    }

    await testConnection.close();

    return NextResponse.json({
      success: true,
      message: `Successfully connected to MongoDB cluster! Database: "${dbName}" (${collectionCount} collections found).`,
      database: dbName,
      collectionCount,
    });
  } catch (error: any) {
    let friendlyMessage = error.message || "Failed to connect to MongoDB";

    if (friendlyMessage.includes("ECONNREFUSED") || friendlyMessage.includes("querySrv")) {
      friendlyMessage = `DNS / Network Error: Could not resolve MongoDB host. Please verify your cluster URL (e.g. cluster0.xxxx.mongodb.net) and check your internet connection. (${error.message})`;
    } else if (friendlyMessage.includes("Authentication failed") || friendlyMessage.includes("bad auth")) {
      friendlyMessage = `Authentication Failed: Incorrect MongoDB username or password. Please verify the credentials inside your MongoDB URI.`;
    } else if (friendlyMessage.includes("IP") || friendlyMessage.includes("whitelist")) {
      friendlyMessage = `IP Access Blocked: Your current IP is not whitelisted in MongoDB Atlas. Go to MongoDB Atlas > Network Access and allow '0.0.0.0/0' (Allow Access From Anywhere).`;
    }

    return NextResponse.json(
      { success: false, message: friendlyMessage },
      { status: 500 }
    );
  }
}
