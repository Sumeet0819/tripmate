# Dual Authentication Implementation Plan (Google OAuth + Email OTP)

This plan details how we will integrate both Supabase Google OAuth and our custom Email OTP passwordless login within the React Native Expo frontend.

## User Review Required
> [!IMPORTANT]
> To support the OAuth flow in Expo, we need to install specific packages:
> - `@supabase/supabase-js`: The official Supabase client.
> - `expo-auth-session`: Handles the browser-based OAuth flow.
> - `expo-crypto`: Required by auth-session for secure nonces/PKCE.
> - `expo-web-browser`: Opens the in-app browser for Google login.

## Proposed Changes

### 1. Dual Auth Flow Architecture
The application will support two independent authentication paths. 

**Path A: Google OAuth (via Supabase)**
1. User taps "Continue with Google".
2. `expo-auth-session` opens the Google login browser.
3. Upon success, Supabase issues a session JWT.
4. The app dispatches the `syncGoogleProfile` thunk, sending the JWT to `/api/v1/auth/sync`.
5. Backend verifies the token, syncs the DB profile, and returns the user object.

**Path B: Email OTP (Custom Backend)**
1. User enters their email and taps "Send Code".
2. The app dispatches the `requestOtp` thunk, which hits `POST /api/v1/auth/otp/request`. The backend emails a 6-digit code.
3. User navigates to the OTP Verification screen and enters the 6-digit code.
4. The app dispatches the `verifyOtp` thunk, sending the email and code to `POST /api/v1/auth/otp/verify`.
5. Backend verifies the code, creates the user if new, and returns a signed custom JWT and user profile.

### 2. Supabase Client Configuration
**[NEW] `src/config/supabase.js`**
Initialize the Supabase client using environment variables for the Google Auth flow.
```javascript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL, 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, 
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true } }
);
```

### 3. Redux Thunks & API Integration
**[MODIFY] `src/store/slices/authSlice.js`**
The auth slice will manage state for both flows and handle token persistence.
- **State**: `user`, `token`, `status`, `otpStatus`, `error`.
- **Thunk: `syncGoogleProfile(supabaseJwt)`**: Calls `/api/v1/auth/sync` and stores the JWT.
- **Thunk: `requestOtp(email)`**: Calls `/api/v1/auth/otp/request` to trigger the email.
- **Thunk: `verifyOtp({ email, code })`**: Calls `/api/v1/auth/otp/verify`. On success, extracts the JWT returned directly by our backend, updates `AsyncStorage`, and sets the user state.

### 4. UI Components / Screens
**[NEW] `src/screens/LoginScreen.js`**
- Input field for Email.
- "Continue with Email" button -> Triggers `requestOtp` and navigates to `OtpScreen`.
- "Continue with Google" button -> Triggers `supabase.auth.signInWithOAuth()`.

**[NEW] `src/screens/OtpScreen.js`**
- Input field for the 6-digit code.
- "Verify Code" button -> Triggers `verifyOtp`. On success, the global auth state updates, automatically navigating the user to the main app dashboard.

### 5. Expo App Configuration
**[MODIFY] `app.json`**
Ensure the `scheme` is configured correctly so that the OAuth flow can successfully deep-link back into the application after the Google browser closes.

## Verification Plan
### Manual Verification
1. **Google Flow**: Tap "Sign in with Google", verify the browser opens, authenticates, and the backend `/sync` endpoint is hit successfully.
2. **OTP Flow**: Enter an email, verify the backend sends the Nodemailer email with the 6-digit code. Enter the code in the UI and verify the `/verify` endpoint succeeds and returns a JWT.
