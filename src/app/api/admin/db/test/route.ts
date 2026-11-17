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
    let uri = body.uri || process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!uri || typeof uri !== "string") {
      return NextResponse.json({
        success: false,
        message: "No MongoDB connection string provided. Please enter a valid MongoDB URI.",
      }, { status: 400 });
    }

    let cleanUri = uri.trim();
    if ((cleanUri.startsWith('"') && cleanUri.endsWith('"')) || (cleanUri.startsWith("'") && cleanUri.endsWith("'"))) {
      cleanUri = cleanUri.slice(1, -1).trim();
    }

    let hadAngleBrackets = false;
    if (/:<([^>]+)>@/.test(cleanUri) || /\/\/<([^>]+):/.test(cleanUri)) {
      hadAngleBrackets = true;
      cleanUri = cleanUri.replace(/:<([^>]+)>@/, ":$1@").replace(/\/\/<([^>]+):/, "//$1:");
    }

    if (cleanUri.includes(":password@") || cleanUri.includes("<password>")) {
      return NextResponse.json({
        success: false,
        message: "Your MongoDB URI still contains the default placeholder '<password>'. Please replace it with your actual MongoDB Atlas database password.",
      }, { status: 400 });
    }

    // Quick regex validation
    if (!cleanUri.startsWith("mongodb://") && !cleanUri.startsWith("mongodb+srv://")) {
      return NextResponse.json({
        success: false,
        message: "Invalid URI scheme. MongoDB connection strings must start with 'mongodb://' or 'mongodb+srv://'",
      }, { status: 400 });
    }

    // Ensure database name exists in URI, default to /merrytravelo if missing
    if (cleanUri.startsWith("mongodb+srv://") && cleanUri.endsWith(".mongodb.net/")) {
      cleanUri = cleanUri + "merrytravelo?retryWrites=true&w=majority";
    }

    // Create an isolated test connection with a 5s timeout
    const testConnection = await mongoose.createConnection(cleanUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      bufferCommands: false,
    }).asPromise();

    const db = testConnection.db;
    let collectionCount = 0;
    let dbName = testConnection.name || "merrytravelo";

    if (db) {
      await db.command({ ping: 1 });
      const collections = await db.listCollections().toArray();
      collectionCount = collections.length;
    }

    await testConnection.close();

    let successMessage = `Successfully connected to MongoDB cluster! Database: "${dbName}" (${collectionCount} collections found).`;
    if (hadAngleBrackets) {
      successMessage += `\n\n⚠️ Note: Angle brackets '<' and '>' were automatically removed from your password. Please save your settings so the cleaned URI is saved.`;
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      database: dbName,
      collectionCount,
      cleanedUri: cleanUri,
      hadAngleBrackets,
    });
  } catch (error: any) {
    let friendlyMessage = error.message || "Failed to connect to MongoDB";

    if (friendlyMessage.includes("Authentication failed") || friendlyMessage.includes("bad auth")) {
      friendlyMessage = `Authentication Failed: Incorrect MongoDB username or password. Check that angle brackets '<' and '>' around your password have been removed, and verify your password in MongoDB Atlas > Database Access.`;
    } else if (friendlyMessage.includes("ECONNREFUSED") || friendlyMessage.includes("querySrv")) {
      friendlyMessage = `DNS / Network Error: Could not resolve MongoDB host (${error.message}). Please verify your cluster URL (e.g. cluster0.xxxx.mongodb.net).`;
    } else if (friendlyMessage.includes("IP") || friendlyMessage.includes("whitelist")) {
      friendlyMessage = `IP Access Blocked: Your server IP is not whitelisted in MongoDB Atlas. Go to MongoDB Atlas > Network Access and allow '0.0.0.0/0' (Allow Access From Anywhere).`;
    }

    return NextResponse.json(
      { success: false, message: friendlyMessage },
      { status: 500 }
    );
  }
}
