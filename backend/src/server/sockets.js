/**
 * server/sockets.js
 *
 * Socket.io Real-Time Chat Module.
 *
 * This module is initialized with the Socket.io Server instance (io) from app.js.
 * It sets up a JWT authentication middleware on the WebSocket connection handshake
 * and configures the event handlers for the platoon group chat system.
 *
 * Socket Events (Client → Server):
 *  join_platoon      → Client joins a platoon room by its UUID
 *  send_message      → Client sends a text message to a platoon room
 *  typing_indicator  → Client broadcasts their typing state to the room
 *
 * Socket Events (Server → Client):
 *  message_received  → Broadcast new message (with sender metadata) to all room members
 *  user_typing       → Broadcast typing indicator to other room members
 *  error             → Emits error string back to the sender socket
 *
 * Auth:
 *  Every incoming socket connection must send an Authorization header
 *  containing a valid Supabase JWT: `Authorization: Bearer <token>`.
 *  Connections without a valid token are rejected at the handshake level.
 */

const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

/**
 * @param {import("socket.io").Server} io - The Socket.io server instance
 */
module.exports = (io) => {

  // -------------------------------------------------------------------------
  // Socket.io Authentication Middleware
  // -------------------------------------------------------------------------
  // Runs before every connection is established.
  // Validates the JWT from the connection handshake headers.
  io.use((socket, next) => {
    const token = socket.handshake.headers["authorization"]
      ?.replace("Bearer ", "")
      .trim();

    if (!token) {
      return next(new Error("Authentication error: No token provided."));
    }

    try {
      // Verify and decode the Supabase JWT
      const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

      // Attach user identity to the socket object for use in event handlers
      socket.user = {
        id: decoded.sub,    // Supabase user UUID
        email: decoded.email,
      };

      next(); // Allow the connection to proceed
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token."));
    }
  });

  // -------------------------------------------------------------------------
  // Connection Handler
  // -------------------------------------------------------------------------
  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: user ${socket.user.id} (${socket.id})`);

    // -----------------------------------------------------------------------
    // Event: join_platoon
    // Client joins a Socket.io room identified by the platoon UUID.
    // All subsequent messages and typing events are scoped to this room.
    // -----------------------------------------------------------------------
    socket.on("join_platoon", ({ platoonId }) => {
      if (!platoonId) {
        return socket.emit("error", "platoonId is required to join a room.");
      }

      socket.join(platoonId); // Subscribe socket to the platoon room
      console.log(`📌 User ${socket.user.id} joined platoon room: ${platoonId}`);
    });

    // -----------------------------------------------------------------------
    // Event: send_message
    // Persists the message to Supabase and broadcasts it to all room members.
    // -----------------------------------------------------------------------
    socket.on("send_message", async ({ platoonId, text }) => {
      if (!platoonId || !text?.trim()) {
        return socket.emit("error", "platoonId and text are required.");
      }

      try {
        // 1. Write message to Supabase public.messages table
        //    We join with users to fetch sender metadata in a single query
        const { data: message, error } = await supabase
          .from("messages")
          .insert([
            {
              platoon_id: platoonId,
              sender_id: socket.user.id,
              text: text.trim(),
            },
          ])
          .select("id, text, created_at, sender:users(id, name, avatar_url)")
          .single();

        if (error) throw error;

        // 2. Broadcast the full message object to everyone in the platoon room
        //    `io.to(room).emit` sends to ALL sockets in the room, including sender
        io.to(platoonId).emit("message_received", message);

      } catch (err) {
        console.error("❌ Socket send_message error:", err.message);
        socket.emit("error", "Failed to send message. Please try again.");
      }
    });

    // -----------------------------------------------------------------------
    // Event: typing_indicator
    // Broadcasts typing state to other room members (not back to the sender).
    // -----------------------------------------------------------------------
    socket.on("typing_indicator", ({ platoonId, isTyping }) => {
      if (!platoonId) return;

      // `socket.to(room)` sends to everyone in the room EXCEPT the sender
      socket.to(platoonId).emit("user_typing", {
        userId: socket.user.id,
        isTyping,
      });
    });

    // -----------------------------------------------------------------------
    // Event: disconnect
    // -----------------------------------------------------------------------
    socket.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: user ${socket.user.id} (reason: ${reason})`);
    });
  });
};
