import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import userRoutes from "./routes/userRoutes.js";
import packageRoutes from "./routes/weddingPackageRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import venueRoutes from "./routes/venueRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import eventMgmtVendorRoutes from "./routes/eventMgmtVendorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { errorHandler } from "./middlewares/errorHandler.js"; // Centralized error handler
import winston from "./utils/logger.js"; // Winston logger instance for logging

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Secure HTTP headers
app.use(express.json()); // Parse JSON request bodies

// Request Logging Middleware using Winston
app.use((req, res, next) => {
  winston.info(`${req.method} ${req.url}`);
  next();
});

// Route Middleware
app.use("/users", userRoutes);
app.use("/packages", packageRoutes);
app.use("/bookings", bookingRoutes);
app.use("/venues", venueRoutes);
app.use("/vendors", vendorRoutes);
app.use("/eventMgmtVendors", eventMgmtVendorRoutes);
app.use("/admins", adminRoutes);

// 404 Middleware for Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found." });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
