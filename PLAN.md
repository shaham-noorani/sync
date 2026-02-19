# Sync App — Phase 1 Implementation Plan

## Progress Tracker

- [x] **Chunk 0**: Project Scaffolding
- [x] **Chunk 1**: Supabase Database Schema
- [x] **Chunk 2**: Auth Flow (Login + Signup)
- [x] **Chunk 3**: Profile Screen
- [x] **Chunk 4**: Friends System
- [x] **Chunk 5**: Groups System
- [x] **Chunk 6**: Availability Heatmap (View)
- [x] **Chunk 7**: Availability Editing
- [x] **Chunk 8**: Polish & Integration

---

## Chunk 0: Project Scaffolding (IN PROGRESS)

### Done
- `npx create-expo-app@latest sync --template tabs` ✅

### Remaining
1. Install deps: `@supabase/supabase-js`, `nativewind`, `@tanstack/react-query`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `expo-clipboard`, `expo-image-picker`, `react-native-reanimated` (already installed), `tailwindcss`
2. Configure NativeWind: `tailwind.config.js`, `global.css`, `metro.config.js`, `nativewind-env.d.ts`
3. `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. `lib/supabase.ts` — Supabase client with LargeSecureStore adapter
5. `lib/query-client.ts` — TanStack QueryClient
6. `providers/AuthProvider.tsx` — session/user context via `onAuthStateChange`
7. `providers/QueryProvider.tsx` — QueryClientProvider wrapper
8. `app/_layout.tsx` — root layout wrapping providers, auth gate
9. Placeholder route files for `(auth)` and `(tabs)` groups

---

## Chunk 1: Supabase Database Schema

- Create migration `supabase/migrations/<ts>_initial_schema.sql` with:
  - `nanoid()` function, `update_updated_at()` trigger function
  - Tables: `profiles`, `user_interests`, `friendships`, `groups`, `group_members`, `availability_patterns`, `availability_slots`, `travel_periods`
  - RLS policies on all tables
  - `get_effective_availability(user_id, start_date, end_date)` — merges patterns + slot overrides
  - `get_group_overlaps(group_id, start_date, end_date)` — finds shared free slots
  - Realtime enabled on `friendships`, `group_members`, `availability_patterns`, `availability_slots`
- `npx supabase gen types typescript --linked > lib/database.types.ts`

---

## Chunk 2: Auth Flow

- `app/(auth)/login.tsx` — email/password form, error handling, link to signup
- `app/(auth)/signup.tsx` — email, password, username, display_name, city, interest selection
- `app/_layout.tsx` — conditional routing: no session → auth, session → tabs
- `hooks/useProfile.ts` — TanStack query for profile + interests
- `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/InterestChip.tsx`

---

## Chunk 3: Profile Screen

- `app/(tabs)/profile.tsx` — display name, username, city, interests, friends/groups links, sign out
- `app/profile/edit.tsx` — edit display_name, city, avatar upload, edit interests
- `hooks/useUpdateProfile.ts` — mutation + query invalidation
- `components/Avatar.tsx` — image or initials circle
- `components/SkeletonLoader.tsx` — pulsing placeholder

---

## Chunk 4: Friends System

- `hooks/useFriends.ts` — friends list, pending requests, search users, send/respond mutations
- `app/friends/index.tsx` — tabs for Friends / Requests / Sent
- `app/friends/add.tsx` — search by username, send request
- `components/FriendCard.tsx` — avatar + name + action button
- Realtime subscription on `friendships`

---

## Chunk 5: Groups System

- `hooks/useGroups.ts` — my groups, single group, create, join by code, leave
- `app/group/create.tsx` — name + description form
- `app/group/[id].tsx` — members, invite code with copy, leave group
- `app/group/join/[code].tsx` — preview + join
- `components/GroupCard.tsx`

---

## Chunk 6: Availability Heatmap (View)

- `hooks/useAvailability.ts` — patterns, slots, effective availability via RPC, travel periods
- `app/(tabs)/index.tsx` — home screen with week navigator + 7x3 heatmap grid
- `components/HeatmapGrid.tsx` — 7 cols x 3 rows, amber=free, dark=busy, 44pt min cells
- `components/WeekNavigator.tsx` — week arrows + label

---

## Chunk 7: Availability Editing

- `hooks/useUpdateAvailability.ts` — toggle pattern, toggle specific slot, manage travel periods
- `app/availability/edit.tsx` — Weekly Pattern / Specific Dates modes, tap cells to toggle, travel section
- Extend `HeatmapGrid.tsx` with `editable` + `mode` props, optimistic updates

---

## Chunk 8: Polish & Integration

- Tab bar (Home + Profile, amber active, dark bar, Ionicons)
- Skeleton loaders on all data screens
- `components/ErrorBoundary.tsx` + `components/ui/Toast.tsx`
- Deep linking (`sync://` scheme in app.json)
- Navigation flow audit

---

## Key Decisions
- **TanStack Query** for all server state — no Redux, Context only for auth
- **Supabase RPC** for availability logic
- **Patterns vs Slots split** — recurring schedule + per-date overrides
- **NativeWind** for all styling — dark-mode-first with amber accent
- **3 time blocks** (morning/afternoon/evening) — 7x3 = 21 cells

## File Tree

```
sync/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/  { _layout, login, signup }
│   ├── (tabs)/  { _layout, index, profile }
│   ├── profile/ { edit }
│   ├── availability/ { edit }
│   ├── friends/ { index, add }
│   └── group/   { [id], create, join/[code] }
├── components/
│   ├── ui/ { Button, Input, InterestChip, Toast }
│   ├── Avatar, HeatmapGrid, WeekNavigator
│   ├── FriendCard, GroupCard, SkeletonLoader, ErrorBoundary
├── hooks/
│   ├── useProfile, useUpdateProfile
│   ├── useFriends, useGroups
│   ├── useAvailability, useUpdateAvailability
├── providers/ { AuthProvider, QueryProvider }
├── lib/ { supabase, query-client, database.types }
├── supabase/migrations/
├── tailwind.config.js, metro.config.js, global.css
└── .env
```
