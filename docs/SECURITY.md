# Security, Privacy & Access Control Specification: TripMate India

This document defines the security architecture, authentication standards, database access policies (Row-Level Security), API protections, real-time message security, and payment compliance models for TripMate India.

---

## 1. Security Architecture Summary

TripMate India implements a multi-layered security model to protect user data (PII), secure financial transactions, and prevent unauthorized chat access:

```
[React Native Client] 
   │
   ├── (Secure OAuth Session) ────► [Supabase Auth] (Encrypted Tokens)
   │
   ├── (JWT Signed Headers) ──────► [Express Gateway] (Auth Middleware)
   │                                   │
   │                                   ▼
   │                                [Supabase PostgreSQL DB] (Row-Level Security RLS)
   │
   └── (Stripe Payment Sheet) ────► [Stripe Gateway] (No PCI Data on App/Express)
```

---

## 2. Authentication & Session Security

### 2.1 Google OAuth Session Lifecycle
*   **Provider:** Authenticated via Google OAuth using Supabase Auth.
*   **Token Verification:** Supabase Auth issues a cryptographically signed JSON Web Token (JWT).
*   **Token Lifespan:** Expire default is set to 30 days. The client app uses Supabase SDK to auto-refresh session tokens in the background.

### 2.2 Client-Side Storage Security
Standard JWTs and OAuth secrets are highly sensitive and must never be stored in plaintext inside standard `AsyncStorage` (which is vulnerable to rooting and physical reading attacks).
*   **Implementation:** App sessions and tokens must be stored using **`expo-secure-store`**.
*   **Mechanism:** Encrypted on iOS via **Keychain Services** and on Android via the **KeyStore System** (using AES-256 GCM encryption).

### 2.3 Email OTP Security Controls
*   **Code Complexity:** Generated verification codes are cryptographically random 6-digit integers.
*   **Time-to-Live (TTL):** Codes expire precisely 5 minutes after database registration.
*   **Single-Use Execution:** Active verification pins are immediately deleted from `public.otps` upon the first validation attempt (whether successful or incorrect) to block replay or brute-force scanning.
*   **Rate Limits:** Requests for new verification codes are restricted to a maximum of 3 events per 10 minutes per email address to mitigate mail server spam.

---

## 3. Database Access Control & Row-Level Security (RLS)

Supabase PostgreSQL secures tables using Row-Level Security (RLS) rules. The custom Express server logs in with a service role key to bypass RLS for administrative updates, while mobile clients querying tables directly are bound to their session permissions.

```
                  Supabase PostgreSQL RLS Rules
                  ┌──────────────────────────┐
                  │   public.users table     │
                  │   - Read: ALL                │
                  │   - Update: owner only       │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │  public.platoons table   │
                  │   - Read: Platoon members│
                  │   - Write: Leader only   │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │  public.messages table   │
                  │   - Read: Platoon members│
                  │   - Insert: Platoon members│
                  └──────────────────────────┘
```

### 3.1 SQL RLS Policy Scripts

#### Users Table RLS
Profiles are readable by any authenticated traveler, but write actions are restricted to the account owner:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Allow all users to read user profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- 2. Restrict updates only to the logged-in owner
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);
```

#### Platoons Table RLS
Only platoon leaders can update configurations; members can view details only if their user UUID resides in the `members` array.
```sql
ALTER TABLE public.platoons ENABLE ROW LEVEL SECURITY;

-- 1. Members can view their joined platoons
CREATE POLICY "Members can select their platoons" 
ON public.platoons FOR SELECT 
USING (auth.uid() = ANY(members));

-- 2. Platoon leaders can update platoon settings
CREATE POLICY "Leaders can edit platoon details" 
ON public.platoons FOR UPDATE 
USING (auth.uid() = leader_id);
```

#### Messages Table RLS
Chat records can only be read or written if the requesting user's UUID is verified inside the platoon members list:
```sql
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. Read messages if user belongs to the platoon
CREATE POLICY "Members can read platoon chat history" 
ON public.messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.platoons 
        WHERE id = platoon_id AND auth.uid() = ANY(members)
    )
);

-- 2. Insert message if user is in platoon members list
CREATE POLICY "Members can post chat messages" 
ON public.messages FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.platoons 
        WHERE id = platoon_id AND auth.uid() = ANY(members)
    ) AND auth.uid() = sender_id
);
```

---

## 4. API Safety & Protection (Express.js)

### 4.1 CORS & Request Origins
The Express server rejects API requests originating from unauthorized clients.
*   **Local Host Policy:** Allowed domains are limited to `http://localhost:*` and designated private emulator IP scopes during dev.
*   **Production Policy:** Origin heads are restricted to the official mobile application bundle signature.

### 4.2 Rate Limiting
To prevent denial-of-service (DDoS) attempts, brute-force requests, and socket floods, Express enforces the following thresholds:
```javascript
const rateLimit = require('express-rate-limit');

// General API Rate Limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many API requests from this host, please retry later.' }
});

// Authentication Sync Rate Limiter
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit profile sync attempts
  message: { error: 'Too many profile sync attempts, security lockout applied.' }
});
```

### 4.3 Input Sanitization & Parameter Validation
To prevent SQL injection, cross-site scripting (XSS), and database poisoning:
1.  **Strict Schema Checking:** Request body payloads are checked using middleware validators (e.g., matching strict regexes for UUID formats and telephone indicators).
2.  **No Dynamic SQL Construction:** All operations on Supabase PostgreSQL tables must go through the Supabase JS Client library, which translates queries internally into parameterized SQL scripts.

---

## 5. Real-Time WebSocket Channel Security (Socket.io)

Unprotected web sockets allow eavesdropping. Socket.io implements validation and isolation policies:

1.  **JWT Verification Middleware:** Sockets must pass authentication middleware during connection handshakes. The connection is closed immediately if the token is missing or signature verification fails.
2.  **Scope Verification during Room Join:** When a client emits a `join_platoon` event with a target platoon UUID, the server checks the database to verify if `socket.user.id` belongs to the platoon's `members` list before calling `socket.join(platoonId)`.
3.  **Strict Sender Checks:** When the socket server catches a `send_message` payload, it enforces `sender_id = socket.user.id`. The sender UUID cannot be spoofed to match other users.

---

## 6. Payment Processing Compliance (Stripe)

Stripe operations are built to comply with PCI-DSS guidelines by ensuring zero credit card exposure:

*   **Zero Card Exposure:** Credit card numbers, cardholder names, expirations, and CVC codes are collected directly by Stripe via native iOS/Android payment sheets. This data never touches our Express backend or Supabase database.
*   **State Verification Webhooks:** The Express endpoint `/api/v1/payments/webhook` verifies webhook authenticity using Stripe’s cryptographic webhook signing secret (`stripe.webhooks.constructEvent()`).
*   **Double-Spend Protection:** The webhook processing logic tracks Stripe transaction IDs in a ledger to prevent processing the same payment event twice.

---

## 7. Storage Bucket Access Rules

Asset uploads inside Supabase Storage Buckets are structured into public and private zones:

1.  **Public Folder (`/trips`):** Publicly readable. Trips images are served directly via public CDN links.
2.  **Private Folder (`/avatars`):** Restricted folders. Avatars are only viewable by authenticated users.
3.  **Secure Upload Pipeline:**
    *   Clients request write permissions from the Express backend.
    *   Express validates user credentials, confirms active status, and generates a **Signed Upload URL** via the Supabase Node SDK with a tight expiration window (e.g., 60 seconds).
    *   The mobile client uploads the file directly to Supabase Storage using this Signed URL.
