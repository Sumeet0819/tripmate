/**
 * controllers/platoonController.js
 *
 * Handles all platoon (travel squad) operations:
 *  1. Get platoon details       → GET  /api/v1/platoons/:id
 *  2. Create a platoon          → POST /api/v1/platoons
 *  3. Request to join           → POST /api/v1/platoons/:id/join
 *  4. Approve/reject a request  → POST /api/v1/platoons/:id/approve
 *  5. Get platoon chat history  → GET  /api/v1/platoons/:id/messages
 *  6. Get user's own platoons   → GET  /api/v1/platoons/my
 *
 * Platoon Status Lifecycle:
 *   planning → confirmed → active → completed
 *
 * Two join flows:
 *  A) Curated Trip (with payment): User pays via Stripe Payment Sheet.
 *     Stripe webhook adds the user UUID to `members[]` after payment.succeeded.
 *  B) Unplanned Custom Platoon: User requests to join. Leader approves.
 *     UUID moves from `pending_requests[]` → `members[]`.
 */

const supabase = require("../config/supabase");

// ---------------------------------------------------------------------------
// 1. Get Platoon Details
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/platoons/:id
 *
 * Returns full platoon data including the associated trip, leader info,
 * and member UUIDs for the squad screen.
 */
exports.getPlatoon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: platoon, error } = await supabase
      .from("platoons")
      .select(
        "*, trip:trips(id, title, location, image_url, price, duration, slots_total, slots_left, category), leader:users(id, name, avatar_url, is_verified)"
      )
      .eq("id", id)
      .single();

    if (error || !platoon) {
      return res.status(404).json({ error: "Platoon not found." });
    }

    res.status(200).json({ status: "success", platoon });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 2. Create a New Platoon (Squad)
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/platoons
 *
 * Creates a new platoon for a given trip. The authenticated user becomes
 * the `leader_id` and is automatically added to the `members[]` array.
 *
 * Req body: { trip_id: "UUID" }
 */
exports.createPlatoon = async (req, res, next) => {
  try {
    const { trip_id } = req.body;
    const userId = req.user.id;

    // Verify the target trip exists and has available slots
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("slots_left, id")
      .eq("id", trip_id)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (trip.slots_left <= 0) {
      return res.status(400).json({ error: "No slots available on this trip." });
    }

    // Create platoon with creator as both leader and first member
    const { data: platoon, error } = await supabase
      .from("platoons")
      .insert([
        {
          trip_id,
          leader_id: userId,
          members: [userId],  // Leader is automatically the first member
          pending_requests: [],
          status: "planning",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Decrement the trip's available slot count
    await supabase.rpc("decrement_slot", { trip_uuid: trip_id });

    res.status(201).json({
      status: "success",
      message: "Platoon created successfully.",
      platoon,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 3. Request to Join a Platoon
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/platoons/:id/join
 *
 * Adds the requesting user's UUID to the `pending_requests[]` array.
 * The platoon leader must then approve the request (see approveRequest below).
 *
 * For paid curated trips, payment is handled separately via Stripe — on
 * successful payment, the Stripe webhook calls the Supabase RPC directly.
 *
 * Returns: { status: "pending" | "already_member" | "fully_booked" }
 */
exports.joinPlatoon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: platoon, error: fetchError } = await supabase
      .from("platoons")
      .select("members, pending_requests, trip_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !platoon) {
      return res.status(404).json({ error: "Platoon not found." });
    }

    // Guard: user is already a member
    if (platoon.members.includes(userId)) {
      return res.status(200).json({ status: "already_member", message: "You are already in this platoon." });
    }

    // Guard: user already has a pending request
    if (platoon.pending_requests.includes(userId)) {
      return res.status(200).json({ status: "pending", message: "Your join request is pending leader approval." });
    }

    // Guard: fetch trip to check remaining slots
    const { data: trip } = await supabase
      .from("trips")
      .select("slots_left")
      .eq("id", platoon.trip_id)
      .single();

    if (!trip || trip.slots_left <= 0) {
      return res.status(400).json({ status: "fully_booked", error: "This trip is fully booked." });
    }

    // Append user UUID to pending_requests array using array_append RPC
    // (Postgres arrays can't be updated with simple JS operations)
    const { error: updateError } = await supabase
      .from("platoons")
      .update({
        pending_requests: [...platoon.pending_requests, userId],
      })
      .eq("id", id);

    if (updateError) throw updateError;

    res.status(200).json({
      status: "pending",
      message: "Join request submitted. Awaiting leader approval.",
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 4. Approve or Reject a Join Request (Leader Only)
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/platoons/:id/approve
 *
 * Moves a user from `pending_requests[]` to `members[]` (approve)
 * or simply removes them from `pending_requests[]` (reject).
 *
 * Only the platoon leader can perform this action.
 *
 * Req body: { userId: "UUID", action: "approve" | "reject" }
 */
exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId: targetUserId, action } = req.body;

    const { data: platoon, error: fetchError } = await supabase
      .from("platoons")
      .select("leader_id, members, pending_requests, trip_id")
      .eq("id", id)
      .single();

    if (fetchError || !platoon) {
      return res.status(404).json({ error: "Platoon not found." });
    }

    // Verify the request comes from the platoon leader
    if (platoon.leader_id !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. Only the platoon leader can approve requests.",
      });
    }

    // Remove the user from pending_requests regardless of action
    const updatedPending = platoon.pending_requests.filter(
      (uid) => uid !== targetUserId
    );

    let updatedMembers = platoon.members;

    if (action === "approve") {
      updatedMembers = [...platoon.members, targetUserId];

      // Decrement the trip's slots_left counter
      await supabase.rpc("decrement_slot", { trip_uuid: platoon.trip_id });
    }

    const { error: updateError } = await supabase
      .from("platoons")
      .update({
        members: updatedMembers,
        pending_requests: updatedPending,
      })
      .eq("id", id);

    if (updateError) throw updateError;

    res.status(200).json({
      status: "success",
      message: action === "approve"
        ? "User approved and added to platoon."
        : "Join request rejected.",
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 5. Get Platoon Chat History
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/platoons/:id/messages
 *
 * Returns paginated chat messages for a platoon, ordered newest-first.
 * Uses the `idx_messages_platoon_time` composite index for fast retrieval.
 *
 * Query params: ?limit=50&offset=0 (default: 50 messages)
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit || "50", 10);
    const offset = parseInt(req.query.offset || "0", 10);

    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, text, created_at, sender:users(id, name, avatar_url)")
      .eq("platoon_id", id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Return in chronological order for the chat UI (oldest first)
    res.status(200).json({
      status: "success",
      messages: messages.reverse(),
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 6. Get Authenticated User's Platoons
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/platoons/my
 *
 * Returns all platoons where the authenticated user is a member.
 * Uses Supabase `contains` filter on the members UUID array.
 */
exports.getMyPlatoons = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: platoons, error } = await supabase
      .from("platoons")
      .select(
        "id, status, created_at, trip:trips(id, title, location, image_url, category, duration)"
      )
      // Filter platoons where the members array contains the user's UUID
      .contains("members", [userId])
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ status: "success", count: platoons.length, platoons });
  } catch (err) {
    next(err);
  }
};
