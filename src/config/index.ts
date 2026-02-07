import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/skill-proof-generator",
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || "pdf,docx").split(","),
  maxTestAttempts: parseInt(process.env.MAX_TEST_ATTEMPTS || "1", 10),
  testLinkExpiryDays: parseInt(process.env.TEST_LINK_EXPIRY_DAYS || "30", 10),
  taskGenerationRetries: parseInt(
    process.env.TASK_GENERATION_RETRIES || "3",
    10,
  ),
  sessionTimeoutMinutes: parseInt(
    process.env.SESSION_TIMEOUT_MINUTES || "60",
    10,
  ),
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

// Validation
if (!config.geminiApiKey) {
  console.warn("⚠️  GEMINI_API_KEY not configured. AI features will not work.");
}
