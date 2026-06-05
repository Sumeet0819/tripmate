/**
 * controllers/authController.js
 *
 * Handles all authentication-related business logic:
 *  1. Google OAuth profile sync  → POST /api/v1/auth/sync
 *  2. OTP request (email send)   → POST /api/v1/auth/otp/request
 *  3. OTP verify & JWT issue     → POST /api/v1/auth/otp/verify
 *  4. Get own profile            → GET  /api/v1/auth/me  (requires auth middleware)
 *
 * Flow overview:
 *  - Google OAuth: Supabase Auth handles the OAuth dance on the client.
 *    After login, the mobile app sends the Supabase JWT to /auth/sync.
 *    Express verifies it, creates or retrieves the public.users row, and confirms.
 *
 *  - Email OTP: For passwordless email login, the client sends an email to
 *    /auth/otp/request. Express generates a 6-digit PIN, stores it in public.otps
 *    with a 5-minute TTL, and emails it via Nodemailer. The client then sends
 *    the pin to /auth/otp/verify, which validates and issues a signed JWT.
 */

const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");
const { sendOtpEmail } = require("../utils/mailer");
const { generateOtp, otpExpiresAt } = require("../utils/helper");

// ---------------------------------------------------------------------------
// 1. Google OAuth — Profile Sync
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/auth/sync
 *
 * Called by the mobile app immediately after a successful Google OAuth login.
 * The Supabase session JWT is decoded (already verified by auth middleware)
 * and the user's profile is upserted into public.users.
 *
 * This ensures every authenticated Supabase user has a matching row in our
 * custom public.users table with role, preferences, etc.
 *
 * Req body: { accessToken: "SUPABASE_JWT" }  (body unused — token in header)
 * Auth middleware injects req.user from the verified JWT.
 */
exports.syncGoogleProfile = async (req, res, next) => {
  try {
    const { id, email } = req.user;

    // Extract name and avatar from the decoded JWT payload
    // Supabase stores Google profile data in user_metadata
    const authHeader = req.headers["authorization"];
    const token = authHeader?.replace("Bearer ", "").trim();
    const decoded = jwt.decode(token); // Safe to decode again — already verified by middleware

    const name =
      decoded?.user_metadata?.full_name ||
      decoded?.user_metadata?.name ||
      email.split("@")[0]; // Fallback: use email prefix as name

    const avatar_url =
      decoded?.user_metadata?.avatar_url ||
      decoded?.user_metadata?.picture ||
      "";

    // Upsert: insert if new, or update name/avatar if already exists
    // onConflict("id") means: if this UUID already has a row, update it
    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        { id, email, name, avatar_url },
        { onConflict: "id", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Profile synced successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 2. Email OTP — Request (Generate & Send)
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/auth/otp/request
 *
 * Generates a 6-digit OTP, stores it in public.otps with a 5-minute expiry,
 * and sends it to the provided email via Nodemailer.
 *
 * Steps:
 *  1. Generate cryptographically secure 6-digit code.
 *  2. Delete any existing unused OTPs for this email (to prevent accumulation).
 *  3. Insert new OTP record with expiry timestamp.
 *  4. Send the HTML email with the code.
 *
 * Req body: { email: "traveler@example.com" }
 */
exports.requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const code = generateOtp();            // e.g. "048291"
    const expires_at = otpExpiresAt();    // 5 minutes from now

    // Remove stale/unused OTPs for this email before inserting a fresh one
    await supabase.from("otps").delete().eq("email", email);

    // Insert the new OTP record
    const { error: insertError } = await supabase
      .from("otps")
      .insert([{ email, code, expires_at }]);

    if (insertError) throw insertError;

    // Dispatch the branded OTP email
    await sendOtpEmail(email, code);

    res.status(200).json({
      status: "success",
      message: "OTP code dispatched to email.",
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 3. Email OTP — Verify & Issue JWT
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/auth/otp/verify
 *
 * Validates the OTP code against the database record.
 * On success:
 *  1. Deletes the used OTP (single-use enforcement).
 *  2. Upserts the user into public.users if they don't already exist.
 *  3. Issues and returns a signed JWT for the mobile client to store.
 *
 * Req body: { email: "traveler@example.com", code: "048291" }
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const now = new Date().toISOString();

    // Fetch the OTP record matching both email AND code
    const { data: otpRecord, error: otpError } = await supabase
      .from("otps")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .single();

    if (otpError || !otpRecord) {
      return res.status(401).json({ error: "Invalid OTP code." });
    }

    // Check if the OTP has expired
    if (new Date(otpRecord.expires_at) < new Date(now)) {
      // Clean up the expired OTP
      await supabase.from("otps").delete().eq("id", otpRecord.id);
      return res.status(401).json({ error: "OTP code has expired. Please request a new one." });
    }

    // Consume the OTP — delete it so it cannot be reused
    await supabase.from("otps").delete().eq("id", otpRecord.id);

    // ------------------------------------------------------------------
    // Resolve the user's UUID from auth.users
    //
    // public.users.id is a FK → auth.users.id (ON DELETE CASCADE).
    // We cannot insert into public.users without a matching UUID in auth.users.
    //
    // Strategy:
    //  1. Check if a public.users row already exists for this email (returning user).
    //  2. If not, create a new user in auth.users via the admin API — this gives
    //     us a real UUID that satisfies the FK constraint.
    // ------------------------------------------------------------------

    // Step 1: Check for returning OTP user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("email", email)
      .maybeSingle();

    let user;

    if (existingUser) {
      // Returning user — skip upsert and use existing profile
      user = existingUser;
    } else {
      // New user — create in auth.users first to obtain a valid UUID
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Mark as confirmed since they passed OTP verification
      });

      if (authError) throw authError;
      const userId = authData.user.id;

      // Upsert into public.users with the new UUID
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .upsert(
          { id: userId, email, name: email.split("@")[0] },
          { onConflict: "email", ignoreDuplicates: true }
        )
        .select()
        .single();

      if (userError) throw userError;
      user = newUser;
    }

    // Issue a signed JWT for the mobile app session
    // This token mimics the shape of a Supabase JWT for compatibility with auth middleware
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        user_metadata: { role: user.role },
      },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 4. Get Current Authenticated User Profile
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/auth/me
 *
 * Returns the full profile of the currently authenticated user.
 * Requires the JWT auth middleware to be applied on the route.
 * `req.user.id` is populated by the auth middleware from the JWT `sub` field.
 */
exports.getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, phone, role, avatar_url, preferences, is_verified, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    res.status(200).json({ status: "success", user });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// 5. Developer / Testing Utility
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/auth/promote
 * 
 * Promotes the currently authenticated user to the 'provider' role.
 * This is incredibly useful for testing the Trip creation APIs without
 * having to manually edit the Supabase database.
 * 
 * Returns a FRESH token with the new role baked in.
 */
exports.promoteToProvider = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Update role in DB
    const { data: user, error } = await supabase
      .from("users")
      .update({ role: "provider" })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    // Issue a fresh token so they don't have to log in again
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        user_metadata: { role: user.role },
      },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      message: "Successfully promoted to provider!",
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};
