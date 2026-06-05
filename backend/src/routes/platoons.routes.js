/**
 * routes/platoons.routes.js
 *
 * Platoons Router — mounts under /api/v1/platoons in app.js
 *
 * All routes require authentication (JWT auth middleware applied globally here).
 *
 * Endpoints:
 *  GET    /api/v1/platoons/my           → Get authenticated user's platoons
 *  GET    /api/v1/platoons/:id          → Get platoon details
 *  POST   /api/v1/platoons              → Create a new platoon
 *  POST   /api/v1/platoons/:id/join     → Request to join a platoon
 *  POST   /api/v1/platoons/:id/approve  → Approve/reject a join request (leader only)
 *  GET    /api/v1/platoons/:id/messages → Get platoon chat history
 */

const express = require("express");
const router = express.Router();

const platoonController = require("../controllers/platoonController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");

// All platoon endpoints require the user to be authenticated
router.use(authMiddleware);

// --- User's own platoons ---
// Must be defined BEFORE /:id to avoid "my" being matched as a UUID
router.get("/my", platoonController.getMyPlatoons);

// --- Platoon CRUD ---
router.get("/:id", platoonController.getPlatoon);

router.post(
  "/",
  validate(["trip_id"]),
  platoonController.createPlatoon
);

// --- Platoon Member Actions ---
router.post("/:id/join", platoonController.joinPlatoon);

router.post(
  "/:id/approve",
  validate(["userId", "action"]),
  platoonController.approveRequest
);

// --- Platoon Chat History ---
router.get("/:id/messages", platoonController.getMessages);

module.exports = router;
