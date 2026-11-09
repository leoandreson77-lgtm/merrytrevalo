import mongoose from "mongoose";
import crypto from "crypto";

import "dotenv/config";
const DATABASE_URL = process.env.DATABASE_URL || "mongodb+srv://leoandreson77_db_user:QviGuHX49u5WpE6R@cluster0.20c8rgm.mongodb.net/flight_search?retryWrites=true&w=majority";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

async function run() {
  try {
    console.log("Connecting to flight_search MongoDB...");
    await mongoose.connect(DATABASE_URL);
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    const email = "samm.aali12@gmail.com";
    const password = "Sameer123";
    const passwordHash = hashPassword(password);

    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log(`User ${email} exists. Updating password to: ${password}...`);
      await usersCollection.updateOne(
        { _id: existingUser._id },
        { 
          $set: { 
            passwordHash: passwordHash,
            role: "admin",
            status: "active"
          } 
        }
      );
      console.log("✅ Admin password updated successfully!");
    } else {
      console.log(`User ${email} does not exist. Creating new admin user...`);
      const newAdmin = {
        name: "Admin",
        email: email.toLowerCase(),
        passwordHash: passwordHash,
        role: "admin",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await usersCollection.insertOne(newAdmin);
      console.log("✅ New Admin user created successfully!");
    }

    // List all users for verification
    const allUsers = await usersCollection.find({}).toArray();
    console.log("\nRegistered Users in Database:");
    allUsers.forEach(u => {
      console.log(`- Email: ${u.email} | Role: ${u.role} | Status: ${u.status}`);
    });

  } catch (error) {
    console.error("❌ Error running script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
