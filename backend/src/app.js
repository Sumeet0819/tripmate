/**
 * src/app.js
 *
 * Express Application Factory.
 *
 * This file configures and exports the Express `app` instance.
 * It is separate from server.js to keep HTTP/Socket setup clean
 * and to make the app easily testable (import app without starting the server).
 *
 * Middleware Pipeline Order (ORDER MATTERS):
 *  1. helmet()        → Sets secure HTTP headers (XSS, clickjacking protection)
 *  2. cors()          → Allows cross-origin requests from the mobile app
 *  3. express.raw()   → MUST come before express.json() — for Stripe webhook route ONLY
 *  4. express.json()  → Parse JSON bodies for all other routes
 *  5. Routes          → Mount all API routers under /api/v1
 *  6. error handler   → Global error catcher (must be LAST)
 */

require("dotenv").config(); // Load .env variables before anything else

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// ---------------------------------------------------------------------------
// Security & Parsing Middleware
// ---------------------------------------------------------------------------

// helmet sets secure response headers (Content-Security-Policy, X-Frame-Options, etc.)
app.use(helmet());

// cors allows the React Native (Expo) client to make API requests
// In production, restrict `origin` to your specific app domain/IP
app.use(cors({ origin: "*" }));

// express.raw() for the Stripe webhook route ONLY.
// Stripe signature verification requires the raw body Buffer, not parsed JSON.
// This MUST be registered BEFORE express.json() to take precedence on this path.
app.use(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" })
);

// Parse JSON for all other routes
app.use(express.json());

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/trips", require("./routes/trips.routes"));
app.use("/api/v1/platoons", require("./routes/platoons.routes"));
app.use("/api/v1/payments", require("./routes/payments.routes"));

// Dashboard route (analytics)
const dashboardController = require("./controllers/dashboardController");
const authMiddleware = require("./middleware/auth");
app.get("/api/v1/dashboard", authMiddleware, dashboardController.getDashboard);

// ---------------------------------------------------------------------------
// Health Check Endpoint
// ---------------------------------------------------------------------------

// Simple liveness probe for deployment platforms (Railway, Render, etc.)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "TripMate India API",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// 404 Handler — Catch unmatched routes
// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ---------------------------------------------------------------------------
// Global Error Handler (must be registered LAST)
// ---------------------------------------------------------------------------

app.use(require("./middleware/error"));

module.exports = app;
