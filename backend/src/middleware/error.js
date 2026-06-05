/**
 * middleware/error.js
 *
 * Global Express Error Handling Middleware.
 *
 * This must be registered LAST in the middleware chain in app.js/server.js
 * (after all routes). Express identifies it as an error handler because it
 * accepts 4 arguments: (err, req, res, next).
 *
 * Any route or controller that calls `next(err)` will land here.
 * This prevents unhandled errors from crashing the server and ensures a
 * consistent JSON error response shape for the mobile client to parse.
 */

module.exports = (err, req, res, next) => {
  // Log the full error stack in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ [Error Handler]:", err.stack || err.message);
  }

  // Use the status code set on the error object, or default to 500
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: err.message || "An unexpected internal server error occurred.",
      // Only include stack traces in development mode — never in production
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};
