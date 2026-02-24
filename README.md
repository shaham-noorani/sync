# Sync

A mobile app that makes it effortless to find time with friends — no more "we should hang out soon" threads that go nowhere.

Sync lets you set your weekly availability, see when your friend group overlaps, and coordinate hangouts in a few taps.

> **Status:** Phase 1 complete (shipped) · Phase 2 (hangout proposals + push notifications) in progress

---

## The Problem

Coordinating with friends is painful. Group chats turn into scheduling negotiations. People forget what days they said they were free. Nothing gets planned.

Sync centralizes availability so the hard part (finding a time that works) is automatic.

---

## Features

### Phase 1 — Complete
- **Auth** — Email/password signup with profile creation via Supabase RPC
- **Profiles** — Display name, bio, avatar upload (Supabase Storage), interest tags
- **Friends** — Send/accept/decline friend requests with real-time updates
- **Groups** — Create groups, join via share code, view all members
- **Availability heatmap** — Visual week-by-week heatmap of your free time
- **Availability editing** — Set recurring patterns, specific dates, and travel blocks
- **Friend & group availability** — Tap any friend or group to see their heatmap
- **Dark / light mode** — Persisted via AsyncStorage
- **57 unit tests** — Components, hooks, and screen tests via Jest + Testing Library

### Phase 2 — In Progress
- Hangout proposals (activity, time, location, guest list)
- Overlap detection with alert cards on the home screen
- Push notifications for proposals and responses (Expo + Supabase Edge Functions)

### Phase 3–4 — Planned
- Hangout feed with photos, reactions, and logging
- LLM-powered availability parsing via Claude API (natural language input)
- Calendar sync, profile stats, onboarding polish

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native (Expo SDK 54) + Expo Router |
| Language | TypeScript |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| Backend | Supabase (Postgres, Auth, Realtime, Storage, Edge Functions) |
| Data fetching | TanStack Query v5 |
| Testing | Jest + Testing Library (React Native) |
| E2E | Maestro |
| Fonts | Space Grotesk (Google Fonts via Expo) |

---

## Project Structure

```
app/
  (auth)/         # Login + signup screens
  (tabs)/         # Home, Friends, Groups, Profile, Feed, Propose tabs
  availability/   # Availability editing flows
  friends/        # Friend profile view
  group/          # Group detail screens
  proposal/       # Proposal detail screens
components/       # Shared UI (Avatar, HeatmapGrid, WeekNavigator, SkeletonLoader…)
hooks/            # Data hooks (useHangouts, useProposals…)
lib/              # Supabase client, query client, DB types, notifications
providers/        # React context providers
supabase/         # Database migrations and Edge Functions
__tests__/        # Unit tests mirroring app structure
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm start          # opens Expo dev menu
npm run ios        # iOS simulator
npm run android    # Android emulator

# Tests
npm test
npm run test:watch
```

You'll need a Supabase project. Copy `.env.example` to `.env.local` and fill in your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## Design Highlights

- **Availability heatmap** — custom-built grid component that visualizes availability density across a rolling week view, with skeleton loading states and smooth navigation
- **Real-time friends** — friend requests and status updates propagate instantly via Supabase Realtime subscriptions, no polling
- **Offline-first patterns** — TanStack Query handles caching, background refetching, and optimistic updates throughout
- **Type-safe DB layer** — Supabase-generated TypeScript types keep the database schema and application code in sync

---

Built by [Shaham Noorani](https://github.com/shaham-noorani)
