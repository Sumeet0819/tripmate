# TripMate India

**TripMate India** is a premium mobile travel networking platform designed to connect travelers and trip organizers in India. It enables users to form travel groups (“platoons”), share itineraries, find travel companions, and access exclusive partner deals on hotels, restaurants, and adventure activities.

---

## 📱 App Architecture & Tech Stack

This project is built as a **cross-platform mobile application** using Expo and React Native, tailored for high-performance visual aesthetics and fluid user experiences.

### Frontend (Mobile App)

- **Framework:** [Expo (v56.0.0)](https://docs.expo.dev/versions/v56.0.0/) with file-based routing via `expo-router`.
- **Language:** TypeScript
- **Styling & Design System:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native) paired with a Material 3-based design system in [utils/theme.tsx](file:///d:/tripmate/utils/theme.tsx).
- **Animations:** [Moti](https://moti.fyi/) & [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for responsive micro-interactions (e.g., spring-based navigation tabs).
- **Icons:** [react-native-remix-icon](https://github.com/remix-design/RemixIcon) (Remix Design system).
- **State Management (Planned):** Redux Toolkit (to handle auth state, active platoon syncing, and cached trip packages).

### Backend & API (Target Integration)

- **Target Stack:** Node.js with Express.js & MongoDB (Mongoose ORM).
- **Authentication:** JSON Web Tokens (JWT) with OTP-based verification.
- **APIs:** Axios for network calls and route-handling.

---

## 📂 Project Structure

```
tripmate/
├── android/               # Native Android build configurations
├── assets/                # Core static media assets
│   └── images/            # App icons, splash screens, and favicons
├── app/                   # Expo Router file-based screen navigation
│   ├── (auth)/            # Authentication Flow
│   │   ├── _layout.tsx    # Auth Stack Layout
│   │   ├── onboarding.tsx # Landing screen with brand pitch and theme switcher
│   │   ├── login.tsx      # Sign-in panel
│   │   ├── register.tsx   # Account registration
│   │   └── verify-otp.tsx # 4-digit verification code screen
│   ├── (tabs)/            # Main App Shell (Tab Navigation)
│   │   ├── _layout.tsx    # Bottom navigation layout wrapping screens
│   │   ├── home.tsx       # Journey discovery hub (Featured & Category list)
│   │   ├── dashboard.tsx  # Metrics display and travel analytics charts
│   │   ├── platoons.tsx   # Travel groups management page
│   │   └── profile.tsx    # User settings and personal details
│   ├── _layout.tsx        # Global root layout wrapping theme & safe area providers
│   └── index.tsx          # Router entrypoint (handles auth and redirection)
├── components/            # Reusable premium UI components
│   ├── AnalyticsChartCard.tsx # Line/Bar chart analytics visualization
│   ├── AuthHeader.tsx     # Custom navigation headers for auth flows
│   ├── BottomNavBar.tsx   # Spring-animated dynamic bottom tab navigation
│   ├── FeaturedTripCard.tsx # Large card layout for featured expeditions
│   ├── FormInput.tsx      # Configurable modern text input fields
│   ├── MetricCard.tsx     # 2x2 dashboard metric container
│   ├── OrganicHeader.tsx  # Interactive search bar & curved top header
│   ├── PillButton.tsx     # Custom styled action buttons (Primary/Secondary)
│   └── TripCard.tsx       # General trip listing container
├── utils/                 # Utilities and helper libraries
│   ├── colors.ts          # Color processing utilities (hexToRgba, etc.)
│   ├── navigation.ts      # Typing and route path configurations
│   └── theme.tsx          # Active Theme Context (Light/Dark mode palettes)
├── tailwind.config.js     # Tailwind CSS / NativeWind configuration
├── app.json               # Expo configuration manifest
├── package.json           # Project dependencies & scripts
└── tsconfig.json          # TypeScript configurations
```

---

## 🌟 Features Breakdown

### 🧑 For Travelers

1.  **Form Platoons:** Share travel costs and coordinate safety by forming/joining travel squads (platoons).
2.  **Explore Curated Trips:** Browse verified travel packages (e.g. _Ladakh Bike Expedition_, _Kerala Backwaters Cruise_) with active slot indicators, pricing, and category filters.
3.  **Search & Discover:** Interactive organic search header to filter trips by title, category, or location.
4.  **Travel Analytics Dashboard:** Visual stats on total trips taken, active platoons, budget saved, and completed journeys.

### 🏢 For Trip Providers

- **Publish Packages:** Upload itineraries, categories (Trekking, Heritage, Beach, Adventure), pricing, and total available slots.
- **Traveler Coordination:** Track active bookings and manage traveler slot limits.

### 🤝 For Partners

- Offer special promotional rates on stays, dining, and transit options.
- Track commissions and transactions directly through the platform.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and the Expo Go app (on iOS/Android) or an emulator installed.

### Installation

1.  Clone the repository and open the workspace:
    ```bash
    cd tripmate
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure Lottie support is configured:
    ```bash
    npm install lottie-web
    ```

### Running the App

Start the Expo development server:

```bash
npm run start
```

- Press **`a`** to open in an Android Emulator.
- Press **`i`** to open in an iOS Simulator.
- Press **`w`** to open in a web browser.
- Scan the QR code in the terminal using the Expo Go app on your physical mobile device to run it directly.

---

## 🛡️ State Management (Redux Architecture)

Redux is utilized to synchronize traveler activities and session data.

- **Slices:**
  - `authSlice.js`: Current active traveler user info, login state, and JWT credentials.
  - `tripSlice.js`: Active expeditions, search cache, and filter preferences.
  - `platoonSlice.js`: Platoon group chats, member listings, and cost-splitting ledgers.
- **Store:** Initialized in a central store, hooked globally using `<Provider>` in the root app config.
- **Async Actions:** Handled via `createAsyncThunk` communicating with the backend APIs.

---

## 📅 Roadmap & Future Enhancements

- **Real-time Chat:** Socket.io messaging integration within platoons.
- **Interactive Budgets:** Automated expense splitting and digital ledger inside platoons.
- **AI Recommendations:** Suggesting trips based on previous travel categories and budgets.
- **Payment Gateways:** Secure payment gateway integration for advance bookings.

---

## 📄 License

MIT License
