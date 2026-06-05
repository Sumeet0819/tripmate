/**
 * server.js  (root entry point)
 *
 * HTTP & Socket.io Server Bootstrap.
 *
 * This is the file that Node.js actually runs (`npm run dev` or `npm start`).
 * It wraps the Express app in a native Node.js HTTP server so that Socket.io
 * can share the same port — WebSocket upgrades happen on the HTTP server.
 *
 * Responsibilities:
 *  1. Import the configured Express app from src/app.js
 *  2. Create an HTTP server wrapping the app
 *  3. Attach Socket.io to the HTTP server
 *  4. Initialize the Socket.io room/event handlers from src/server/sockets.js
 *  5. Start listening on the configured PORT
 */

const http = require("http");
const { Server } = require("socket.io");

// Import the configured Express application
const app = require("./src/app");

// ---------------------------------------------------------------------------
// Create HTTP Server
// ---------------------------------------------------------------------------

// Wrapping in http.createServer() lets Socket.io intercept WebSocket upgrade
// requests on the same port as the REST API — no extra port needed.
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// Initialize Socket.io
// ---------------------------------------------------------------------------

const io = new Server(server, {
  cors: {
    // In production, replace "*" with your specific app's origin domain
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Mount the Socket.io event handlers (chat rooms, messaging, typing)
require("./src/server/sockets")(io);

// ---------------------------------------------------------------------------
// Start the Server
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 TripMate India API running on port ${PORT}`);
  console.log(`   REST API  → http://localhost:${PORT}/api/v1`);
  console.log(`   Health    → http://localhost:${PORT}/health`);
  console.log(`   WebSocket → ws://localhost:${PORT}\n`);
});

// Handle uncaught errors to prevent silent crashes
server.on("error", (err) => {
  console.error("❌ Server error:", err.message);
  process.exit(1);
});
