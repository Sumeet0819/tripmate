/**
 * utils/helper.js
 *
 * General-purpose utility functions for the TripMate India backend.
 *
 * These are stateless, pure helper functions used across controllers
 * to keep business logic clean and avoid code duplication.
 */

const crypto = require("crypto");

// ---------------------------------------------------------------------------
// OTP Utilities
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically random 6-digit OTP code.
 * Uses Node.js `crypto` module for secure randomness (not Math.random).
 *
 * @returns {string} 6-digit OTP string, e.g. "048291"
 */
exports.generateOtp = () => {
  // Generate a random integer in [0, 999999] and zero-pad to 6 digits
  const num = crypto.randomInt(0, 1_000_000);
  return String(num).padStart(6, "0");
};

/**
 * Calculates the OTP expiry timestamp (5 minutes from now).
 *
 * @returns {Date} UTC expiry date
 */
exports.otpExpiresAt = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry;
};

// ---------------------------------------------------------------------------
// Date & Time Formatters
// ---------------------------------------------------------------------------

/**
 * Formats a Date or ISO string into a human-readable display string.
 * Example: "05 Jun 2026, 06:30 PM"
 *
 * @param {Date|string} dateInput - Date object or ISO string
 * @returns {string} Formatted date string in IST locale
 */
exports.formatDate = (dateInput) => {
  return new Date(dateInput).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
};

// ---------------------------------------------------------------------------
// Price Formatters
// ---------------------------------------------------------------------------

/**
 * Formats an integer price (in INR) to a display string with the ₹ symbol.
 * Example: 28000 → "₹28,000"
 *
 * @param {number} amount - Price in Indian Rupees (integer)
 * @returns {string} Formatted currency string
 */
exports.formatPrice = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ---------------------------------------------------------------------------
// Storage URL Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the public Supabase Storage URL for an asset.
 * This is used for publicly-accessible bucket files (e.g. trip images).
 *
 * @param {string} bucket - Supabase bucket name (e.g. "tripmate-assets")
 * @param {string} path   - File path inside the bucket (e.g. "avatars/user123.jpg")
 * @returns {string} Full public URL
 */
exports.buildStorageUrl = (bucket, path) => {
  const baseUrl = process.env.SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
};
