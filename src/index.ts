import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createRouteHandler } from "uploadthing/express";
import { config } from "./config";
import { connectDatabase } from "./config/database";
import { uploadRouter } from "./lib/uploadthing";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(helmet());

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins = config.corsOrigin;
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}. Allowed: ${allowedOrigins.join(", ")}`);
      callback(null, true); // Allow anyway for now to debug
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parsing middleware with detailed logging
app.use((req, res, next) => {
  if (req.path.startsWith("/api/candidate") && req.method === "POST") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      "content-type": req.get("content-type"),
      origin: req.get("origin"),
    });
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Log parsed body for candidate endpoints
app.use((req, res, next) => {
  if (req.path.startsWith("/api/candidate") && req.method === "POST") {
    console.log(
      `[${new Date().toISOString()}] BODY:`,
      JSON.stringify(req.body, null, 2),
    );
  }
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// UploadThing route handler (handles file uploads)
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  }),
);

// Routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
