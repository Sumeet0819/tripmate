/**
 * config/supabase.js
 *
 * Initializes and exports the Supabase admin client.
 * We use the SERVICE ROLE key here (not the anon key) so that
 * the Express server can bypass Supabase Row Level Security (RLS)
 * and perform privileged operations like inserting users, reading OTPs, etc.
 *
 * ⚠️ This key must NEVER be exposed to the client (React Native app).
 *    It lives only in backend .env and is loaded via dotenv.
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file"
  );
}

/**
 * Supabase client configured with the service role key.
 * This client has admin-level access to the Supabase project.
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Disable session persistence — the server is stateless
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = supabase;
