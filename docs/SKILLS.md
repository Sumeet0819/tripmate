# Professional Software Engineering & Coding Practices (SKILLS.md)

This document defines the strict professional development guidelines, coding conventions, architectural practices, and engineering standards for TripMate India. All code contributions—both client-side and server-side—must adhere to these rules.

---

## 1. Clean Code & Programming Principles

- **DRY (Don't Repeat Yourself):** Abstract repetitive logic (e.g., fetch request wrappers, layout headers, theme selectors) into reusable hooks, utility functions, or common components.
- **KISS (Keep It Simple, Stupid):** Write code that is easy to read and maintain. Avoid over-engineering solutions before scale issues arise.
- **Separation of Concerns (SoC):** Keep styling (NativeWind), logic (custom hooks/Redux), and presentation (components) segregated. Do not bundle heavy database calculations inside screen render pages.

---

## 2. Frontend Development Standards (React Native / Expo / TypeScript)

### 2.1 TypeScript Strictness

- **No `any` Types:** Always explicitly define types or interfaces. If a type is external or dynamic, utilize `unknown` with type-guard predicates instead of `any`.
- **Readonly Props:** Define React props as read-only to prevent state mutations outside standard lifecycle updates.
- **Implicit Returns:** Maintain consistent function return declarations. Enable strict null-checking configurations (`strictNullChecks`).

### 2.2 Component & Hook Guidelines

- **Component Structure:** Declare components using functional constants (`const MyComponent: React.FC<Props> = ...`). Keep components small (under 200 lines). If a file exceeds this limit, extract child components.
- **Styles Isolation:** Use NativeWind classes for general layouts. For customized native styling parameters, use the dynamic stylesheet utility, never inline styles directly inside components.
- **Custom Hooks:** Encapsulate screen logic inside hooks. (e.g., `usePlatoonChat.ts` should manage websocket listener attachments and state dispatches, keeping `platoons.tsx` focused solely on visual rendering).
- **Lifecycle Resource Cleanup:** Always return cleanup functions inside `useEffect` (e.g., disconnecting web sockets, terminating timer threads, unsubscribing from store listeners) to prevent mobile memory leaks.

```typescript
// Good Practice: Cleaning up event listeners
useEffect(() => {
  const socket = initializeSocket();
  socket.on("message_received", handleNewMessage);

  return () => {
    socket.off("message_received", handleNewMessage);
    socket.disconnect();
  };
}, [platoonId]);
```

---

## 3. Backend Development Standards (Node.js / Express / Supabase)

### 3.1 Async/Await Error Handling

- Avoid nesting `.then()` and `.catch()` chains. Use standard `try/catch` wrappers.
- Implement an asynchronous wrapper middleware to capture unhandled promise rejections automatically, preventing Express crashes:

```javascript
// Good Practice: Async router wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in routes/trips.js:
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await createTrip(req.body);
    res.status(201).json(data);
  })
);
```

### 3.2 Security-First Coding

- **Parameterized Queries:** Never assemble raw SQL query strings dynamically. Always use Supabase SDK functions (`supabase.from().select()`) to utilize auto-parameterized PostgreSQL prepared statements.
- **Payload Validation:** Validate body schemas at routing boundaries using verification models (e.g., checking UUID patterns, phone syntax, string parameters) before data hits the database.
- **Standardized API Responses:** Ensure all API responses conform to a unified format. Never leak internal server errors, stack traces, or DB engine logs to the client.

---

## 4. State Management Standards (Redux Toolkit)

- **Immutable State Updates:** Never modify state variables directly inside reducers. Use Redux Toolkit’s default `createSlice` which wraps updates in Immer automatically.
- **Encapsulated Thunks:** Put API request calls and axios integrations inside Redux Async Thunks (`createAsyncThunk`), keeping component actions clean.
- **Memoized Selectors:** Use `createSelector` from `@reduxjs/toolkit` or `reselect` for expensive data computations to prevent unnecessary component re-renders.

---

## 5. Version Control & Git Workflow

- **Branch Naming Conventions:**
  - `feature/feature-name` (e.g., `feature/stripe-payments`)
  - `bugfix/bug-description` (e.g., `bugfix/chat-typing-crash`)
  - `hotfix/critical-patch`
- **Semantic Commit Messages:**
  - `feat: add Google OAuth support`
  - `fix: resolve memory leak in platoon chat room`
  - `docs: update API endpoints definitions`
  - `refactor: isolate Stripe intent configurations`
- **Pull Request Checklists:**
  - Code builds cleanly without TypeScript compiler flags (`npm run tsc`).
  - Linting scripts return zero warnings.
  - No hardcoded secrets (API keys, DB Service roles) exist in git history.
