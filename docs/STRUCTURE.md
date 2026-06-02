# Component Analysis & Project Folder Structure: TripMate India

This document analyzes the required architectural components for the mobile client (Expo/React Native) and backend server (Node.js/Express/Supabase) and details the final unified folder structure.

---

## 1. Analysis of Needed Components

To develop the application efficiently, the codebase is structured around modular, reusable parts. Below is the list of components that must be built:

### 1.1 Frontend (Mobile App - Expo Router)

#### 🖥️ UI & Screen Components
*   **Onboarding Components:** Swipable intro cards, layout templates, pagination indicators, and mode-switching controls.
*   **Authentication Forms:** Reusable, validated fields for mobile numbers, passwords, emails, name entries, and OTP code verification grids.
*   **Discovery Hub (Home):** Categorized filter tabs, horizontal featured sliders, list scrolling feeds, search inputs, and organic curved layouts.
*   **Analytics Dashboard:** Visual indicators, numeric widgets for saved travel capital, and SVG charts for tracking activity.
*   **Platoons (Squads) Interfaces:** Lists of user groups, join request logs (for squad leaders), custom itinerary input dialogs, and a live chat bubble layout.
*   **User Profile Screen:** Preference checklists (travel styles), profile summary badges, and settings lists.

#### ⚙️ Service & Infrastructure Components
*   **Redux Slices:** Slices for authentication sessions, trip feeds, and platoon chat groups.
*   **Stripe Payment Wrappers:** Context hooks validating checkout configurations and native sheets triggers.
*   **WebSockets Hooks:** Real-time socket handlers listening for incoming messages, user typing statuses, and reconnect events inside active chat scopes.
*   **Navigation & Custom Hooks:** Hook definitions mapping path redirects and standard safe area parameters.

---

### 1.2 Backend (REST API & Socket Server - Express)

#### 🔀 API Routing & Logic
*   **Authentication Sync:** Validates Supabase JWTs and copies user records into public tables.
*   **Trip Coordinators:** Resolves queries with search parameters, checks role permissions, and creates trip records.
*   **Platoon Directors:** Manages squad creation, processes join approvals, and fetches historical chats from PostgreSQL.
*   **Dashboard Aggregators:** Executes PostgreSQL group-by queries to compute trip numbers, platoon counts, and estimated savings.
*   **Payment Managers:** Creates Stripe Payment Intents, ephemeral customer keys, and verifies Stripe Webhook signatures.

#### 🔒 Security & Middleware
*   **Auth Filter:** Express middleware inspecting JWT authorizations and passing decrypted UUIDs down routing tracks.
*   **Body Validators:** Validates incoming payloads to ensure correct data formats before writing to Supabase.
*   **Errors Processor:** Captures API crash states and returns standardized error payloads.
*   **Sockets Room Manager:** Maps socket IDs to platoon rooms (`socket.join`) and manages message persistence to PostgreSQL.

---

## 2. Complete Project Folder Structure

Below is the complete, file-level directory structure for the unified codebase.

```
tripmate/
├── backend/                        # Express.js & Socket.io Server Code
│   ├── config/                     # Configuration Profiles
│   │   ├── keys.js                 # Environment validation profiles (JWT keys, secrets)
│   │   └── supabase.js             # Initialized Supabase client instance SDK
│   ├── controllers/                # Business Logic Controllers
│   │   ├── authController.js       # Syncs user oauth profiles to PostgreSQL
│   │   ├── dashboardController.js  # Calculates user metrics using SQL aggregation
│   │   ├── paymentController.js    # Generates Stripe intents and processes webhooks
│   │   ├── platoonController.js    # Manages squads, joins, and approvals
│   │   └── tripController.js       # Handles trip filters and provider creation
│   ├── middleware/                 # Express Request Middlewares
│   │   ├── auth.js                 # Verifies Supabase JWT tokens in request headers
│   │   ├── error.js                # Formats uncaught application errors
│   │   └── validate.js             # Payload structure schema checking
│   ├── models/                     # Schema specifications & seeding scripts
│   │   └── schema.sql              # Supabase PostgreSQL database tables definition
│   ├── routes/                     # REST API Routing mappings
│   │   ├── auth.js                 # Auth endpoint mapping (/api/v1/auth)
│   │   ├── dashboard.js            # Metrics metrics mapping (/api/v1/dashboard)
│   │   ├── payments.js             # Stripe intent and webhook routes (/api/v1/payments)
│   │   ├── platoons.js             # Squad joins and listings (/api/v1/platoons)
│   │   └── trips.js                # Trip explorer and lists (/api/v1/trips)
│   ├── utils/                      # Helper modules
│   │   └── helpers.js              # Date formatters and calculators
│   ├── .env                        # Private server credentials (STRIPE_SECRET, SUPABASE_KEY)
│   ├── package.json                # Server Node configurations and scripts
│   └── server.js                   # Node entry point, Express config & Socket.io listeners
│
├── app/                            # Expo Router Mobile Screens (Existing & Expanded)
│   ├── (auth)/                     # Auth & Landing Stack
│   │   ├── _layout.tsx             # Auth layout mapping
│   │   ├── login.tsx               # Login panel with Google sign-in
│   │   ├── onboarding.tsx          # Landing carousel with mode switcher
│   │   ├── register.tsx            # Sign-up page with Google sign-in
│   │   └── verify-otp.tsx          # Phone verification code input
│   ├── (tabs)/                     # Main bottom-tab stack
│   │   ├── _layout.tsx             # Dynamic animated bottom-bar layout wrapper
│   │   ├── dashboard.tsx           # Graphical charts and travel metrics widgets
│   │   ├── home.tsx                # Discovery hub (featured sliders & categorized feeds)
│   │   ├── platoons.tsx            # Traveler platoons list and join alerts
│   │   └── profile.tsx             # Preferences checklist and user details
│   ├── _layout.tsx                 # Root layout (SafeArea, Redux, Theme wrappers)
│   └── index.tsx                   # Redirect entry check
│
├── components/                     # Reusable Mobile Presentation Components
│   ├── AnalyticsChartCard.tsx      # SVG chart cards displaying travel history
│   ├── AuthHeader.tsx              # Reusable navigation headers for auth flows
│   ├── BottomNavBar.tsx            # Moti-powered spring animated tab bar
│   ├── FeaturedTripCard.tsx        # Swipe cards for high-tier trip campaigns
│   ├── FormInput.tsx               # Standardized text inputs with error tags
│   ├── MetricCard.tsx              # 2x2 grid stats widget
│   ├── OrganicHeader.tsx           # Search bar input with curved visual overlay
│   ├── PillButton.tsx              # Custom action buttons (Primary/Secondary styles)
│   ├── PlatoonChat.tsx             # [NEW] Chat screen component inside platoon details
│   ├── PaymentSheetButton.tsx      # [NEW] Stripe trigger sheet launch button
│   └── TripCard.tsx                # Listing cards displaying slots, durations, prices
│
├── redux/                          # Redux State Architecture (New Directory)
│   ├── store.ts                    # Redux store combiner
│   └── slices/                     # Redux slices
│       ├── authSlice.ts            # Logged-in profile, Google OAuth caching
│       ├── platoonSlice.ts         # User platoons lists, messages, and socket logs
│       └── tripSlice.ts            # Queried trips, filters, active selections
│
├── utils/                          # Frontend Helper Libraries
│   ├── colors.ts                   # Color converters (e.g., hexToRgba)
│   ├── navigation.ts               # Safe navigation routes
│   └── theme.tsx                   # Dark/Light mode theme provider & hooks
│
├── assets/                         # Static app icons, splash pages, and images
├── tailwind.config.js              # NativeWind style tokens mapping
├── tsconfig.json                   # Client-side typescript properties
├── package.json                    # Client-side mobile dependency tree & scripts
└── app.json                        # Expo build manifest (Google Sign-In, plugins)
```

---

## 3. Directory & File Responsibilities

### 3.1 Backend Service Core
*   `server.js`: Starts the Express server and links Socket.io connection handshakes. Standardizes API routers under `/api/v1/` routes.
*   `config/supabase.js`: Initializes `@supabase/supabase-js` using environment variables. Allows the Express controllers to query the Postgres database.
*   `controllers/paymentController.js`: Links Stripe Node SDK. Generates Stripe client keys for mobile users and handles payment webhook updates.
*   `models/schema.sql`: Contains the raw SQL table declarations to build database tables directly in the Supabase SQL editor.

### 3.2 Frontend Mobile Client Core
*   `app/_layout.tsx`: Wraps screens in `ReduxProvider`, `ThemeProvider`, `SafeAreaProvider`, and `StripeProvider`. Sets up the status bar theme.
*   `redux/store.ts`: The central state store combining the `auth`, `trip`, and `platoon` slices, configured with middleware to ignore non-serializable socket elements.
*   `components/PlatoonChat.tsx`: Handles messages mapping and triggers socket emitters (`send_message`, `typing_indicator`) to update squad members instantly.
*   `utils/theme.tsx`: Injects light/dark mode properties to NativeWind variables.
