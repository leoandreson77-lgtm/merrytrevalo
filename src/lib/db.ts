import mongoose from "mongoose";
import dns from "dns";

// Force Node's DNS resolver to use Google/Cloudflare DNS to bypass local network DNS failures in local dev
if (!process.env.VERCEL) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    if (typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch (err) {
    console.warn("Could not set custom DNS servers:", err);
  }
}

function convertSrvToStandard(uri: string): string {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }
  const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@cluster0\.s3oneko\.mongodb\.net(?:\/([^?]*))?(?:\?(.*))?$/);
  if (!match) {
    return uri;
  }
  const [_, user, password, dbName = "", options = ""] = match;
  const hosts = [
    "ac-5fnnvn1-shard-00-00.s3oneko.mongodb.net:27017",
    "ac-5fnnvn1-shard-00-01.s3oneko.mongodb.net:27017",
    "ac-5fnnvn1-shard-00-02.s3oneko.mongodb.net:27017"
  ].join(",");
  
  return `mongodb://${user}:${password}@${hosts}/${dbName}?authSource=admin&replicaSet=atlas-zphce6-shard-0&ssl=true`;
}

const VERIFIED_MONGODB_URI = "mongodb+srv://leoandreson77_db_user:Sameer123@cluster0.20c8rgm.mongodb.net/jetwithfly?retryWrites=true&w=majority";

function cleanMongoUri(rawUri: string): string {
  if (!rawUri) return "";
  let uri = rawUri.trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  // Remove accidental angle brackets around username or password (e.g. :<password>@ -> :password@)
  uri = uri.replace(/:<([^>]+)>@/, ":$1@");
  uri = uri.replace(/\/\/<([^>]+):/, "//$1:");
  return convertSrvToStandard(uri);
}

function getMongoUri(): string {
  let rawUri = process.env.DATABASE_URL || process.env.MONGODB_URI || "";
  // If URI is missing or contains the dummy sample placeholder from early template, fallback to real verified Atlas URI
  if (!rawUri || rawUri.includes("SafePassword123") || rawUri.includes("@cluster0.mongodb.net")) {
    rawUri = VERIFIED_MONGODB_URI;
  }
  return cleanMongoUri(rawUri);
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const uri = getMongoUri();
    if (!uri) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB database");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function getDb() {
  const conn = await connectToDatabase();
  if (!conn.connection.db) {
    throw new Error("Database connection not established");
  }
  return conn.connection.db;
}

export function resetDbConnection() {
  if (cached.conn) {
    try {
      cached.conn.disconnect().catch(() => {});
    } catch {}
  }
  cached.conn = null;
  cached.promise = null;
}

