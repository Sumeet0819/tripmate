/**
 * routes/payments.routes.js
 *
 * Payments Router — mounts under /api/v1/payments in app.js
 *
 * Endpoints:
 *  POST   /api/v1/payments/create-intent  → Create Stripe PaymentIntent (protected)
 *  POST   /api/v1/payments/webhook        → Stripe webhook receiver (PUBLIC, raw body)
 *
 * CRITICAL NOTE on /webhook:
 *  The webhook route MUST receive the RAW request body for Stripe signature
 *  verification to work. In app.js, we register express.raw() ONLY for this
 *  route path BEFORE the global express.json() middleware. Do NOT change order.
 */

const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");

// --- Create Payment Intent ---
// Protected: must know who is paying (req.user.id) for metadata
router.post(
  "/create-intent",
  authMiddleware,
  validate(["tripId", "platoonId"]),
  paymentController.createPaymentIntent
);

// --- Stripe Webhook ---
// PUBLIC: Stripe calls this with a signed raw payload (no JWT from client)
// body parsing is express.raw() — handled in app.js route registration order
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
