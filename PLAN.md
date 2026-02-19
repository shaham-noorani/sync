# Sync App — Implementation Plan

## Phase 1: Foundation ✅ COMPLETE

- [x] Project Scaffolding (Expo, NativeWind, Supabase, TanStack Query)
- [x] Database Schema (profiles, interests, friendships, groups, availability)
- [x] Auth Flow (Login + Signup with RPC for profile creation)
- [x] Profile Screen (view, edit, avatar upload, interests)
- [x] Friends System (add, accept/decline, list, realtime)
- [x] Groups System (create, join by code, members, leave)
- [x] Availability Heatmap (view on home, week navigator)
- [x] Availability Editing (patterns, specific dates, travel periods)
- [x] Polish (error boundary, toast, skeleton loaders, 57 tests)

### Post-Phase 1 Enhancements ✅
- [x] Color palette update (Dusty Mauve, Lilac Ash, Lavender Grey)
- [x] Dark/light mode toggle with NativeWind + AsyncStorage persistence
- [x] Custom font (Space Grotesk Bold for "sync" logo)
- [x] Header bar removed (SafeAreaView with proper iOS status bar padding)
- [x] Friends & Groups moved to bottom tab bar (4 tabs: Home, Friends, Groups, Profile)
- [x] Calendar starts from today (not Sunday of week)
- [x] Darker purple in light mode (lavender-500 for accent text)
- [x] Friend profile view screen (tap friend → see their profile)

---

## Phase 2: Social + Proposals 🔄 IN PROGRESS

### New Database Tables
- [ ] `hangout_proposals` — proposal with title, activity, date, time, location, status
- [ ] `proposal_responses` — who's invited + their response (pending/accepted/declined/maybe)
- [ ] `availability_inputs` — raw LLM text inputs (for Phase 4)
- [ ] RLS policies for all new tables
- [ ] Realtime on hangout_proposals, proposal_responses

### Features
1. [ ] Friends' availability overlay on heatmap (see who's free)
2. [ ] Overlap detection + alert cards on home screen
3. [ ] Propose tab screen (activity, when, who, where)
4. [ ] Proposal detail screen (responses, accept/decline)
5. [ ] Push notification setup (expo-notifications + Supabase Edge Functions)
6. [ ] Notifications: new proposals, responses, overlap alerts

---

## Phase 3: Feed + Photos

### New Database Tables
- [ ] `hangouts` — logged hangout record
- [ ] `hangout_attendees` — who was there
- [ ] `hangout_photos` — uploaded photos (Supabase Storage)
- [ ] `hangout_reactions` — emoji reactions
- [ ] RLS policies, storage bucket for photos

### Features
1. [ ] Hangout logging screen (title, activity, attendees, location, photos)
2. [ ] Photo capture + upload to Supabase Storage
3. [ ] "It happened!" flow (proposal → hangout log)
4. [ ] Feed tab screen (reverse-chronological hangout cards with photos)
5. [ ] Reactions on hangouts (emoji taps)
6. [ ] Post-hangout photo prompt notification
7. [ ] Notification for hangout logged

---

## Phase 4: Intelligence + Polish (Future)
- LLM availability parsing (Claude API Edge Function)
- Natural language availability input
- Availability nudge notifications
- Profile stats (hangouts/month, streak, most-seen friend)
- Weekly summary notification
- Calendar sync (expo-calendar)
- Onboarding flow polish
- App icon + splash screen
