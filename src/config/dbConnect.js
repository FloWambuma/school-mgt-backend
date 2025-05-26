import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI NOT FOUND");
}

// Global cache to prevent multiple connections in development
let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) {
    console.log("Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10, // Recommended pooling option
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  global.mongoose = cached; // Store the cache globally
  return cached.conn;
}

export default dbConnect;
