/**
 * middleware/auth.js
 *
 * JWT Authentication Middleware for Express routes.
 *
 * How it works:
 *  1. Reads the "Authorization: Bearer <token>" header from the incoming request.
 *  2. Verifies the token signature against SUPABASE_JWT_SECRET (found in your
 *     Supabase dashboard → Project Settings → API → JWT Settings).
 *  3. If valid, attaches the decoded user object to `req.user` and calls next().
 *  4. If missing or invalid, responds with 401 Unauthorized immediately.
 *
 * The decoded Supabase JWT contains:
 *  - `sub`            → User's UUID (primary key in public.users)
 *  - `email`          → User's email address
 *  - `user_metadata`  → Extra profile data set during signup (e.g. role)
 */

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Extract token from "Authorization: Bearer <token>" header
  const authHeader = req.headers["authorization"];
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or malformed." });
  }

  try {
    // Verify using the Supabase project's JWT secret
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

    // Attach user identity payload to the request object for downstream use
    req.user = {
      id: decoded.sub,                             // UUID from auth.users
      email: decoded.email,
      role: decoded.user_metadata?.role || "traveler", // Fallback to default role
    };

    next();
  } catch (err) {
    // Token is expired, tampered, or signed by a different secret
    return res.status(401).json({ error: "Invalid token or session expired." });
  }
};
