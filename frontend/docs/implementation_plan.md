# API Service and Redux State Architecture Implementation Plan

This plan outlines the complete setup of the client-side API layer, Redux state management architecture, and WebSocket integration for the Tripmate frontend application, mirroring all endpoints and real-time features exposed by the backend.

## User Review Required
> [!IMPORTANT]
> The following new dependencies will need to be installed in the `frontend` directory to support this architecture:
> - `@reduxjs/toolkit`: Modern Redux architecture.
> - `react-redux`: React bindings for Redux.
> - `axios`: Promise based HTTP client for robust API requests.
> - `@react-native-async-storage/async-storage`: To securely persist the JWT token across app restarts.
> - `socket.io-client`: To establish WebSocket connections for real-time platoon chat.

## Proposed Changes

### 1. API Service Layer
We will implement a centralized API client with specific domain API files to cleanly encapsulate all HTTP calls.

#### [NEW] `src/services/apiClient.js`
A centralized Axios instance.
- Configures the backend `baseURL` (loaded from env variables).
- **Request Interceptor**: Retrieves the JWT from `AsyncStorage` and attaches it to the `Authorization: Bearer <token>` header for every request.
- **Response Interceptor**: Catches and formats standard API errors (e.g., dispatching a logout action on `401 Unauthorized`).

#### Domain API Services
Specific files mapping precisely to our backend routes, using `apiClient`.
- **[NEW] `src/services/api/authApi.js`**: `/sync`, `/otp/request`, `/otp/verify`, `/me`, `/promote`.
- **[NEW] `src/services/api/tripsApi.js`**: `/` (GET/POST), `/:id` (GET/PUT), `/upload-url`.
- **[NEW] `src/services/api/platoonsApi.js`**: `/my`, `/:id`, `/` (POST), `/:id/join`, `/:id/approve`, `/:id/messages`.
- **[NEW] `src/services/api/paymentsApi.js`**: `/create-intent`.
- **[NEW] `src/services/api/dashboardApi.js`**: `/` (GET) - Retrieves analytics dashboard data.

---

### 2. WebSocket Service Layer (Socket.io)
To handle real-time chat within platoons, we need a dedicated socket service.

#### [NEW] `src/services/socketService.js`
A singleton service managing the Socket.io connection lifecycle.
- **`initSocket(token, dispatch)`**: Establishes the connection, passing the JWT in `extraHeaders` or `auth` payload. It takes the Redux `dispatch` function to push incoming events directly into the state.
- **Event Listeners**:
  - `message_received`: Dispatches an action (e.g., `platoonSlice.actions.messageReceived(message)`) to instantly append the new message to the chat view.
  - `user_typing`: Dispatches an action to show a typing indicator for that user.
  - `error`: Handles connection drops or unauthorized events.
- **Emitters**:
  - `joinPlatoon(platoonId)`: Emits `join_platoon` event.
  - `sendMessage(platoonId, text)`: Emits `send_message` event.
  - `sendTypingIndicator(platoonId, isTyping)`: Emits `typing_indicator` event.
- **`disconnect()`**: Closes the socket connection on logout.

---

### 3. Redux State Management Architecture

We will follow a domain-driven Slice structure utilizing Redux Toolkit.

#### Folder Structure
```text
src/
  store/
    index.js            # Store configuration and root reducer
    hooks.js            # Custom typed hooks (useAppDispatch, useAppSelector)
    slices/
      authSlice.js      # User authentication and profile state
      tripSlice.js      # Trips search and catalog state
      platoonSlice.js   # Platoon memberships, details, and chat state
      paymentSlice.js   # Payment processing state
      dashboardSlice.js # Analytics state
```

#### Slices and Thunks Functionality

**[NEW] `src/store/slices/authSlice.js`**
- **State**: `user`, `token`, `status`, `error`.
- **Thunks**: `requestOtp`, `verifyOtp`, `syncGoogleProfile`, `fetchCurrentUser`, `logout`.
- **Note**: `verifyOtp` and `syncGoogleProfile` will trigger `socketService.initSocket` upon successful login.

**[NEW] `src/store/slices/tripSlice.js`**
- **State**: `trips`, `currentTrip`, `status`, `error`.
- **Thunks**: `fetchTrips`, `fetchTripById`, `createTrip`, `updateTrip`.

**[NEW] `src/store/slices/platoonSlice.js`**
- **State**: 
  - `myPlatoons` (array of user's active platoons)
  - `currentPlatoon` (active platoon view)
  - `messages` (array of chat messages)
  - `typingUsers` (dict/array of users currently typing)
  - `status`, `error`
- **Reducers (Synchronous Actions for Sockets)**:
  - `messageReceived`: Appends a real-time message to the `messages` array.
  - `userTypingUpdated`: Adds/removes a user from `typingUsers`.
- **Thunks (API Calls)**: `fetchMyPlatoons`, `fetchPlatoonDetails`, `createPlatoon`, `joinPlatoon`, `approveJoinRequest`, `fetchMessages` (loads chat history on entering the room).

**[NEW] `src/store/slices/paymentSlice.js`**
- **State**: `clientSecret`, `status`, `error`.
- **Thunks**: `createPaymentIntent`.

**[NEW] `src/store/slices/dashboardSlice.js`**
- **State**: `analytics` (dashboard metrics), `status`, `error`.
- **Thunks**: `fetchDashboardData`.

---

### 4. Application Integration
#### [MODIFY] `src/app/_layout.js` (or entry point)
- Wrap the application with `Provider` from `react-redux`.
- Add an initialization effect to load the JWT from `AsyncStorage`. If a token exists, dispatch `fetchCurrentUser` and initialize `socketService` with the store's `dispatch` function.

## Verification Plan

### Manual Verification
- Install dependencies and verify the app compiles cleanly.
- Inject Redux Provider and verify Redux DevTools recognizes the store structure.
- Trigger `initSocket` and verify backend logs `🟢 Socket connected`.
- Test real-time flow: connect two clients (or a client and Postman), send a message via `sendMessage`, and verify `messageReceived` action is dispatched to the Redux store instantly.
