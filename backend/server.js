import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studyMaterialRoutes from "./routes/studyMaterialRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import globalErrorHandler from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================
// Security Middleware
// =============================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

// =============================
// Body Parsers
// =============================

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// =============================
// Health Check Route
// =============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Platform Backend API is running 🚀",
  });
});

// =============================
// Static Files
// =============================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =============================
// API Routes
// =============================

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/tests", testRoutes);

// =============================
// Global Error Handler
// =============================

app.use(globalErrorHandler);

// =============================
// Start Server
// =============================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();