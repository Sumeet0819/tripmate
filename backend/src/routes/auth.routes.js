/**
 * routes/auth.routes.js
 *
 * Auth Router — mounts under /api/v1/auth in app.js
 *
 * Endpoints:
 *  POST   /api/v1/auth/sync           → Google OAuth profile sync (protected)
 *  POST   /api/v1/auth/otp/request    → Request OTP email (public)
 *  POST   /api/v1/auth/otp/verify     → Verify OTP and issue JWT (public)
 *  GET    /api/v1/auth/me             → Get current user profile (protected)
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");

// --- Google OAuth ---
// Protected: requires a valid Supabase JWT in the Authorization header
router.post(
  "/sync",
  authMiddleware,
  authController.syncGoogleProfile
);

// --- Email OTP ---
// Public: user provides their email; server sends a code
router.post(
  "/otp/request",
  validate(["email"]),
  authController.requestOtp
);

// Public: user provides the code they received; server issues a JWT
router.post(
  "/otp/verify",
  validate(["email", "code"]),
  authController.verifyOtp
);

// --- Profile ---
// Protected: returns the authenticated user's full profile row
router.get(
  "/me",
  authMiddleware,
  authController.getMe
);

module.exports = router;
