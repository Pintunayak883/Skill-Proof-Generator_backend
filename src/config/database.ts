import mongoose from "mongoose";
import { config } from "./index";

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    const timeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("MongoDB connection timeout after 15 seconds")),
        15000,
      ),
    );

    await Promise.race([
      mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        retryWrites: true,
      }),
      timeout,
    ]);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error(
      "❌ MongoDB connection error:",
      error instanceof Error ? error.message : String(error),
    );
    console.warn(
      "⚠️  Starting server anyway. Database operations will fail until connection is restored.",
    );
  }
};

export default mongoose;
