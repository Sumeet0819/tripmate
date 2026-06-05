/**
 * routes/trips.routes.js
 *
 * Trips Router — mounts under /api/v1/trips in app.js
 *
 * Endpoints:
 *  GET    /api/v1/trips                → List/search trips (public)
 *  GET    /api/v1/trips/:id            → Get single trip detail (public)
 *  POST   /api/v1/trips                → Create trip (providers only, protected)
 *  PUT    /api/v1/trips/:id            → Update trip (owner/admin, protected)
 *  POST   /api/v1/trips/upload-url     → Get signed upload URL for image (protected)
 */

const express = require("express");
const router = express.Router();

const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");

// --- Public Routes ---
router.get("/", tripController.getTrips);
router.get("/:id", tripController.getTripById);

// --- Protected Routes (require valid JWT) ---

// Generate a Supabase signed URL for image upload
// Placed before /:id to prevent "upload-url" being treated as a UUID param
router.post(
  "/upload-url",
  authMiddleware,
  validate(["fileName"]),
  tripController.getUploadUrl
);

// Create a new trip (provider role enforced inside the controller)
router.post(
  "/",
  authMiddleware,
  validate(["title", "location", "price", "duration", "slots_total", "category", "image_url"]),
  tripController.createTrip
);

// Update an existing trip (owner or admin)
router.put("/:id", authMiddleware, tripController.updateTrip);

module.exports = router;
