# Sync

Friend coordination app -- set your weekly availability, see when friends overlap, and propose hangouts. Built by Shaham Noorani.

**Status:** Phase 1 (core features) shipped. Phase 2 (proposals, feed, push notifications) in progress.

## Tech Stack

- **Framework:** React Native with Expo SDK 54, Expo Router v6 (file-based routing)
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind v4 (Tailwind CSS for RN) + inline styles via `useColors()` theme tokens
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage, Edge Functions, RPC)
- **Data fetching:** TanStack Query v5 (queries + mutations, 5-min stale time, retry 2)
- **Fonts:** Space Grotesk (bold logo), SpaceMono, FontAwesome icons via `@expo/vector-icons`
- **Testing:** Jest + jest-expo + React Native Testing Library
- **E2E:** Maestro (flows in `.maestro/`)
- **Build:** EAS Build (eas.json with development/preview/production profiles)

## Project Structure

```
app/
  _layout.tsx          # Root layout: QueryProvider > AuthProvider > ThemeProvider > AuthGate > Stack
  (auth)/              # Login, signup, onboarding screens
  (tabs)/              # Tab navigator: Home, Proposals, Feed, Friends, Groups, Profile
  availability/        # Availability edit screen
  friends/             # Friend profile view, add friend
  group/               # Group detail, create, edit, join
  proposal/            # Proposal detail, create
  hangout/             # Hangout detail, log
  profile/             # Profile edit
  gcal/                # Google Calendar connection

components/            # Shared UI components
  ui/                  # Primitives: Button, Input, InterestChip, Toast
  HeatmapGrid.tsx      # Core availability visualization (7-day x 3-block grid)
  WeekNavigator.tsx    # Week forward/back navigation
  Avatar.tsx           # User avatar with fallback
  FriendCard.tsx       # Friend list item
  GroupCard.tsx        # Group list item
  SkeletonLoader.tsx   # Loading placeholder
  AiAvailabilityModal.tsx  # AI-powered availability input (Claude API)

hooks/                 # TanStack Query hooks (all data fetching lives here)
  useAvailability.ts   # Effective availability, patterns, travel periods
  useFriends.ts        # Friends list, requests, search, realtime subscription
  useGroups.ts         # Groups CRUD, members, join by code
  useProposals.ts      # Hangout proposals, responses
  useHangouts.ts       # Hangout logging, photos, reactions
  useOverlaps.ts       # Friend/group overlap detection
  useProfile.ts        # Current user profile
  useUpdateAvailability.ts  # Availability mutations
  useUpdateProfile.ts  # Profile mutations
  usePushNotifications.ts   # Expo push notification registration
  useGcalConnection.ts     # Google Calendar integration

lib/
  supabase.ts          # Supabase client (typed with Database, uses AsyncStorage for session)
  database.types.ts    # Generated Supabase TypeScript types
  query-client.ts      # TanStack QueryClient config
  constants.ts         # Interest tags enum
  notifications.ts     # Push notification helpers (Expo Push API)
  __mocks__/supabase.ts  # Jest mock for Supabase client

providers/
  AuthProvider.tsx     # Auth context (session, user, hasProfile, signOut)
  QueryProvider.tsx    # TanStack QueryClientProvider wrapper
  ThemeProvider.tsx     # Dark/light theme with ColorTokens, persisted via AsyncStorage

supabase/
  migrations/          # SQL migrations (initial schema through gcal integration)
  functions/           # Deno Edge Functions: connect-gcal, sync-gcal, parse-availability
  config.toml          # Local Supabase config

scripts/               # One-off data scripts (seed.mjs, fix scripts)
__tests__/             # Unit tests mirroring source structure
  test-utils.tsx       # renderWithProviders, createWrapper, mock fixtures
  components/          # Component tests
  hooks/               # Hook tests
  screens/             # Screen tests
  lib/                 # Lib tests
  providers/           # Provider tests
```

## Architecture Patterns

### Provider Hierarchy

Root layout wraps the app in: `QueryProvider > AuthProvider > ThemeProvider > AuthGate > Stack`

`AuthGate` handles routing logic: unauthenticated users go to `(auth)/login`, authenticated users without a profile go to `(auth)/onboarding`, otherwise `(tabs)`.

### Data Flow

All server data flows through TanStack Query hooks in `hooks/`. Each hook:
1. Uses `useAuth()` to get the current user
2. Calls Supabase (`.from()`, `.rpc()`, or `.storage`) in the `queryFn`
3. Returns typed data via `useQuery` or `useMutation`
4. Mutations call `queryClient.invalidateQueries()` on success

No Redux or Zustand. Server state = TanStack Query. Client state = React `useState` / context providers.

### Supabase Integration

- **Auth:** Email/password + Google OAuth (PKCE flow with deep link code exchange)
- **Database:** Direct client queries with RLS. Complex logic via Postgres RPC functions (`get_effective_availability`, `get_group_overlaps`)
- **Realtime:** Supabase channels for friend request updates (see `useFriendshipsRealtime`)
- **Storage:** Avatar uploads to `avatars` bucket, hangout photos to storage
- **Edge Functions:** Deno-based (connect-gcal, sync-gcal, parse-availability)

### Theming

`ThemeProvider` exposes `useColors()` which returns a `ColorTokens` object with semantic color values (bg, text, accent, border, danger, etc.). Components use both:
- NativeWind className for layout (`className="flex-row items-center px-6"`)
- Inline `style` with `useColors()` for theme-aware colors (`style={{ color: c.text }}`)

Theme preference is persisted in AsyncStorage under `sync_theme_preference`.

### Availability Model

Three layers combined by the `get_effective_availability` RPC:
1. **Patterns** (`availability_patterns`) -- recurring weekly schedule (day_of_week + time_block)
2. **Slots** (`availability_slots`) -- specific date overrides
3. **Travel** (`travel_periods`) -- date ranges that block all availability

Time blocks: `morning`, `afternoon`, `evening` (displayed as AM, PM, Eve).

### Environment Variables

Set in `.env.local` (not committed):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Development

```bash
npm install          # Install dependencies
npm start            # Expo dev server (press i for iOS, a for Android)
npm run ios          # iOS simulator directly
npm run android      # Android emulator directly
npm test             # Run Jest tests
npm run test:watch   # Watch mode
npm run e2e          # Maestro E2E tests (requires running app + Maestro CLI)
```

### Supabase Local Dev

Migrations are in `supabase/migrations/`. Edge Functions are in `supabase/functions/`.

## Testing

- **Framework:** Jest with `jest-expo` preset
- **Mocks:** Global mocks in `jest.setup.js` for expo-router, expo-secure-store, expo-notifications, nativewind, AsyncStorage, vector-icons, safe-area-context. Supabase is auto-mocked via `lib/__mocks__/supabase.ts`.
- **Test utils:** `__tests__/test-utils.tsx` provides `renderWithProviders()` (wraps in QueryClientProvider with retry disabled) and mock user/session/profile fixtures.
- **Path aliases:** `@/*` maps to project root (configured in both tsconfig and jest moduleNameMapper).
- **Structure:** Tests mirror source layout under `__tests__/` (components/, hooks/, screens/, lib/, providers/).

## Coding Conventions

- **File naming:** kebab-case for config files, PascalCase for components, camelCase for hooks (prefixed with `use`)
- **Exports:** Named exports for components and hooks (not default), except screen files which use `export default`
- **Component pattern:** Functional components with TypeScript props types defined inline or as a `type` above
- **Styling:** Mix of NativeWind `className` for layout and `style` prop with `useColors()` for theme colors. Avoid raw hex colors in components -- use theme tokens.
- **Icons:** `@expo/vector-icons` Ionicons throughout
- **No barrel files:** Direct imports from specific files (e.g., `../../hooks/useFriends`)
- **Queries:** Hook per feature in `hooks/`, query keys follow `['entity', userId, ...params]` pattern
- **Database types:** Manually maintained in `lib/database.types.ts` (matches Supabase schema)

## Gotchas

- **Session storage:** Uses AsyncStorage (not SecureStore) because Supabase session JSON exceeds SecureStore's 2KB limit. See comment in `lib/supabase.ts`.
- **Date handling:** All dates use `YYYY-MM-DD` strings. When creating Date objects from date strings, always append `T12:00:00` to avoid timezone offset issues (e.g., `new Date(dateStr + 'T12:00:00')`).
- **New Architecture:** Enabled (`newArchEnabled: true` in app.json). Uses React Native 0.81 with react-native-worklets.
- **NativeWind:** Requires both babel preset config (`jsxImportSource: 'nativewind'`) and metro config (`withNativeWind`). The `global.css` file must import Tailwind directives.
- **Path alias:** `@/` resolves to project root. Configured in `tsconfig.json` (`paths`) and `jest.config.js` (`moduleNameMapper`).
- **Deep linking:** OAuth redirect uses the `sync://` scheme. Code exchange happens in the root layout's `useEffect` for both cold and warm starts.
