/**
 * controllers/dashboardController.js
 *
 * Provides aggregate analytics for the user's personal dashboard screen.
 *
 * Returns:
 *  - Total journeys (completed platoon count)
 *  - Active platoons count
 *  - Savings accumulated (₹) — estimated savings vs solo travel
 *  - Completed trips total
 *  - Monthly travel frequency (for bar charts)
 *  - Category breakdown (for radar/pie charts)
 *
 * All data is user-specific and computed via Supabase Postgres queries.
 * Aggregations are done server-side to minimize data transferred to the client.
 */

const supabase = require("../config/supabase");

// ---------------------------------------------------------------------------
// Get Dashboard Metrics for Authenticated User
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/dashboard
 *
 * Returns the full analytics payload for the authenticated user's dashboard.
 * The mobile client renders this in the Dashboard tab's metric grid and charts.
 *
 * Requires: auth middleware (req.user.id)
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // --- Query 1: Fetch all platoons the user belongs to ---
    // We use `contains` to filter platoons where the members UUID array
    // includes the authenticated user's UUID
    const { data: platoons, error: platoonsError } = await supabase
      .from("platoons")
      .select(
        "id, status, created_at, trip:trips(price, category)"
      )
      .contains("members", [userId]);

    if (platoonsError) throw platoonsError;

    // --- Compute Metric: Count by status ---
    const activePlatoons = platoons.filter((p) => p.status === "active").length;
    const completedTrips = platoons.filter((p) => p.status === "completed").length;
    const totalJourneys = platoons.length;

    // --- Compute Metric: Estimated Savings ---
    // Simple heuristic: completed trips with a price save 30% vs solo travel
    // This is a rough visual metric — not a financial calculation
    const savingsAccumulated = platoons
      .filter((p) => p.status === "completed" && p.trip?.price)
      .reduce((sum, p) => sum + Math.round(p.trip.price * 0.3), 0);

    // --- Compute Chart: Monthly travel frequency (last 12 months) ---
    const monthlyFrequency = buildMonthlyChart(platoons);

    // --- Compute Chart: Category breakdown ---
    const categoryBreakdown = buildCategoryBreakdown(platoons);

    res.status(200).json({
      status: "success",
      metrics: {
        totalJourneys,
        activePlatoons,
        completedTrips,
        savingsAccumulated, // Displayed as "₹X Saved" on the dashboard
      },
      charts: {
        monthlyFrequency,   // [{ month: "Jan", count: 2 }, ...]
        categoryBreakdown,  // [{ category: "Adventure", count: 5 }, ...]
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Private Chart Builder Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a monthly frequency array for the last 12 months.
 * Counts how many platoons were joined in each calendar month.
 *
 * @param {Array} platoons - All user platoons with created_at timestamps
 * @returns {Array} [{ month: "Jan 2026", count: 3 }, ...]
 */
function buildMonthlyChart(platoons) {
  const counts = {};

  platoons.forEach((platoon) => {
    const date = new Date(platoon.created_at);
    // Format: "Jun 2026"
    const label = date.toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    counts[label] = (counts[label] || 0) + 1;
  });

  // Return as array sorted chronologically
  return Object.entries(counts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(`1 ${a.month}`) - new Date(`1 ${b.month}`));
}

/**
 * Builds a category breakdown array from trip categories across platoons.
 *
 * @param {Array} platoons - Platoons with embedded trip.category
 * @returns {Array} [{ category: "Adventure", count: 4 }, ...]
 */
function buildCategoryBreakdown(platoons) {
  const counts = {};

  platoons.forEach((platoon) => {
    const category = platoon.trip?.category;
    if (category) {
      counts[category] = (counts[category] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count); // Descending by count
}
