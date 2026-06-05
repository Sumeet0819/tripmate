
/**
 * controllers/tripController.js
 *
 * Handles all trip (expedition) related HTTP operations:
 *  1. List / search trips  → GET  /api/v1/trips
 *  2. Get single trip      → GET  /api/v1/trips/:id
 *  3. Create a trip        → POST /api/v1/trips  (Provider role required)
 *  4. Update a trip        → PUT  /api/v1/trips/:id  (Provider/owner only)
 *  5. Generate signed URL  → POST /api/v1/trips/upload-url  (for image uploads)
 *
 * Trips are stored in the public.trips table in Supabase PostgreSQL.
 * The `itinerary` field is a JSONB array of day-by-day itinerary objects.
 * The `slots_left` counter decrements when users join a platoon for that trip.
 */

const supabase = require("../config/supabase");

// ---------------------------------------------------------------------------
// 1. List / Search Trips
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/trips
 *
 * Supports optional query parameters for filtering:
 *  ?search=Leh       → Full-text ILIKE match on title or location
 *  ?category=Adventure → Exact category match
 *  ?featured=true    → Only featured trips
 *
 * Uses the composite index `idx_trips_location_category` for fast category+location queries.
 */
exports.getTrips = async (req, res, next) => {
  try {
    const { search, category, featured } = req.query;

    // Start building the Supabase query
    let query = supabase
      .from("trips")
      .select(
        "id, title, location, price, duration, slots_total, slots_left, category, image_url, is_featured, created_at, provider:users(id, name, avatar_url)"
      )
      .order("created_at", { ascending: false });

    // Apply optional filters
    if (search) {
      // ILIKE performs case-insensitive pattern matching
      query = query.or(
        `title.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    const { data: trips, error } = await query;

    if (error) throw error;

    res.status(200).json({ status: "success", count: trips.length, trips });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 2. Get Single Trip by ID
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/trips/:id
 *
 * Returns complete trip details including the full JSONB itinerary array
 * and the provider's public profile for display on the trip detail screen.
 */
exports.getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: trip, error } = await supabase
      .from("trips")
      .select(
        "*, provider:users(id, name, email, avatar_url, is_verified)"
      )
      .eq("id", id)
      .single();

    if (error || !trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    res.status(200).json({ status: "success", trip });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 3. Create a New Trip (Provider Only)
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/trips
 *
 * Creates a new trip listing. Only users with the 'provider' role should
 * have access to this route (enforced via role check below).
 *
 * Req body:
 *  { title, location, price, duration, slots_total, category, image_url, itinerary[], is_featured? }
 */
exports.createTrip = async (req, res, next) => {
  try {
    // Ensure only providers can create trips
    if (req.user.role !== "provider" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Only trip providers can create trips.",
      });
    }

    const {
      title,
      location,
      price,
      duration,
      slots_total,
      category,
      image_url,
      itinerary,
      is_featured,
    } = req.body;

    // slots_left starts at slots_total when a trip is first created
    const { data: trip, error } = await supabase
      .from("trips")
      .insert([
        {
          title,
          location,
          price,
          duration,
          slots_total,
          slots_left: slots_total, // Initially all slots are open
          category,
          image_url,
          itinerary: itinerary || [],
          is_featured: is_featured || false,
          provider_id: req.user.id, // The authenticated provider's UUID
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: "success",
      message: "Trip created successfully.",
      trip,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 4. Update a Trip (Owner or Admin Only)
// ---------------------------------------------------------------------------

/**
 * PUT /api/v1/trips/:id
 *
 * Allows a provider to update their own trip listing, or an admin to update any.
 * Prevents users from modifying trips they don't own.
 */
exports.updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify the trip exists and belongs to the requesting user (unless admin)
    const { data: existing, error: fetchError } = await supabase
      .from("trips")
      .select("provider_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (
      existing.provider_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "Access denied. You can only update your own trips.",
      });
    }

    // Only update the fields provided in the request body
    const updates = req.body;
    delete updates.provider_id; // Prevent ownership transfer via this endpoint

    const { data: trip, error: updateError } = await supabase
      .from("trips")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      status: "success",
      message: "Trip updated successfully.",
      trip,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 5. Generate Signed Upload URL for Trip Image
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/trips/upload-url
 *
 * Generates a short-lived Supabase Storage signed URL that allows the mobile
 * client to upload a trip image directly to the `tripmate-assets` bucket
 * without exposing the service role key to the client.
 *
 * Req body: { fileName: "my-trip-banner.jpg" }
 * Returns:  { signedUrl: "https://...", path: "trips/uuid-timestamp.jpg" }
 */
exports.getUploadUrl = async (req, res, next) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: "fileName is required." });
    }

    // Build a unique storage path to prevent filename collisions
    const ext = fileName.split(".").pop();
    const storagePath = `trips/${req.user.id}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("tripmate-assets")
      .createSignedUploadUrl(storagePath);

    if (error) throw error;

    res.status(200).json({
      status: "success",
      signedUrl: data.signedUrl,
      path: storagePath,
    });
  } catch (err) {
    next(err);
  }
};
