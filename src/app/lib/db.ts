import dns from "node:dns";
import mongoose from "mongoose";

// Set DNS servers only once
dns.setServers(["1.1.1.1", "8.8.8.8"]);

console.log("Node DNS:", dns.getServers());
console.log("Mongo URI:", process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((m) => m)
      .catch((err) => {
        console.error("MongoDB Connect Error:");
        console.error(err);
        cached.promise = null; // clear so next call retries instead of reusing the dead promise
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}