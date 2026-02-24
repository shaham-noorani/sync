# Sync Visual Redesign — Partiful-Inspired

## Design Direction

Sleek, dark, electric. Partiful energy with Instagram restraint. The app should feel premium and social — like something you'd show off at a party. No over-the-top effects; every gradient and glow earns its place.

---

## Design Tokens

### Colors (replacing current palette)

| Token | Value | Usage |
|---|---|---|
| `background` | `#09090f` | All screen backgrounds |
| `card` | `rgba(255,255,255,0.05)` | Glass card backgrounds |
| `card-border` | `rgba(255,255,255,0.08)` | Glass card borders |
| `accent` | `#8875ff` | Primary accent (violet) |
| `accent-2` | `#c084fc` | Gradient endpoint (purple-pink) |
| `text-primary` | `#f0f0ff` | Headings, primary text |
| `text-secondary` | `#8b8fa8` | Subtext, placeholders |
| `glow` | `rgba(136,117,255,0.25)` | Radial glow behind hero elements |

### Gradient
```
linear: #8875ff → #c084fc  (left-to-right, used on CTAs + active states)
radial: rgba(136,117,255,0.25) center → transparent (used behind logo, avatar)
```

### Typography
- **Headings (screen titles, card titles, section headers):** Space Grotesk 700, tight letter spacing
- **Body / secondary:** System font, regular weight
- **Logo:** Space Grotesk 700, letter-spacing -2, gradient text fill

### Cards
- Background: `rgba(255,255,255,0.05)`
- Border: `1px rgba(255,255,255,0.08)`
- Border radius: 20px (up from 16px)
- Backdrop blur: `blur-xl` (React Native: needs `expo-blur` or workaround)

---

## Screen-by-Screen Plan

### 1. Global / Shared Components

**tailwind.config.js**
- Replace `lavender` palette with `violet` (`#8875ff`, shades)
- Add `accent-2` (`#c084fc`)
- Update `dark-900` background to `#09090f`
- Add `card` color token

**Button.tsx**
- Primary variant: gradient background (`#8875ff → #c084fc`) via `LinearGradient`
- Text: white, Space Grotesk 700
- Shadow: `0 4px 20px rgba(136,117,255,0.35)` glow under primary buttons
- Secondary/outline: unchanged, just update border color

**Input.tsx**
- Background: `rgba(255,255,255,0.06)` glass
- Border: `rgba(255,255,255,0.1)` default, `#8875ff` focused
- Label: Space Grotesk 600, `#f0f0ff`
- Placeholder: `#8b8fa8`

**Avatar.tsx**
- Add gradient ring option (for profile screen hero)

**Tab bar**
- Active tint: `#8875ff`
- Background: `#0f0f18` with `rgba(255,255,255,0.06)` top border
- Active tab: gradient icon tint + gradient underline dot

---

### 2. Login Screen

**Changes:**
- Background: `#09090f` with a radial gradient glow (`#8875ff` 20% opacity) behind the logo
- "sync" wordmark: gradient text (violet → purple-pink), larger (64px), Space Grotesk 700
- Subtitle: `text-secondary`, smaller (14px), regular weight
- Input fields: glass style (see Input.tsx above)
- "Sign In" button: gradient primary
- "Sign Up" link: `#8875ff` accent color
- No header, logo centered with `pt-20` breathing room

---

### 3. Signup Screen

**Changes:**
- Same background + logo treatment as Login
- Step 1 (info form): glass inputs, gradient CTA
- Step 2 (interests):
  - Selected chip: gradient background, white text, subtle glow
  - Unselected chip: glass background, `text-secondary`
  - "Create Account" button: gradient primary

---

### 4. Home Screen (Heatmap)

**Changes:**
- Header: "sync" wordmark left (gradient, 28px), "Availability" pill right (glass with `#8875ff` border)
- "Your Availability" section label: Space Grotesk 600, uppercase, `text-secondary`, smaller
- Week navigator: Space Grotesk 700 center date, `#8875ff` chevrons
- Today indicator: gradient circle (not flat lavender)
- **Heatmap cells:**
  - User free: `#8875ff` with 15% opacity glow aura
  - Friends free: `#c084fc` at 40% opacity
  - Busy: `rgba(255,255,255,0.04)` — barely visible
  - Full availability overlap: gradient fill
- Legend: `text-secondary`, small dots in respective colors
- Proposal cards (horizontal scroll):
  - Card: glass background, `rgba(255,255,255,0.05)`
  - Activity header: gradient band (using activity color as base, pushed toward violet)
  - Emoji: 40px, prominent
  - Title: Space Grotesk 700
  - Glow: subtle colored shadow matching activity

---

### 5. Friends Screen

**Changes:**
- Section tabs (Friends / Requests / Sent): gradient active underline, Space Grotesk
- FriendCard: glass background, `border border-white/8`
- Avatar: no change (keeps existing circle)
- Accept button: gradient primary (small)
- Decline button: glass with `text-secondary`
- Add friend header button: `#8875ff` icon

---

### 6. Groups Screen

**Changes:**
- GroupCard: glass background
- Group icon container: gradient background (small rounded square)
- Join/create inputs: glass style
- Create/Join buttons: gradient primary

---

### 7. Proposals Screen

**Changes:**
- Section headers: Space Grotesk 600, uppercase, `text-secondary`
- Proposal cards: glass card body, gradient activity header band
- "Respond" badge: gradient pill, white text
- Response status badges:
  - Going: `rgba(34,197,94,0.2)` bg, green text
  - Declined: `rgba(239,68,68,0.15)` bg, red text
  - Maybe: `rgba(234,179,8,0.15)` bg, yellow text
- Avatar stacks: subtle ring in gradient

---

### 8. Feed Screen

**Changes:**
- Filter chips: same treatment as interest chips (glass / gradient-selected)
- Hangout cards: glass card, photo carousel unchanged
- Gradient overlay on bottom of photos (title legibility)
- Reaction buttons: glass pill, active emoji gets `#8875ff` glow
- Creator name: Space Grotesk 700

---

### 9. Profile Screen

**Changes:**
- Avatar: gradient ring border (2px, `#8875ff → #c084fc`)
- Display name: Space Grotesk 700, 22px
- Username: `text-secondary`
- Stats card: glass background
- Interest chips: glass / gradient-selected (consistent with signup)
- Settings card (Friends/Groups/Dark Mode): glass background
- Dark mode toggle: gradient track when on
- Sign Out: glass outline button, `text-secondary`

---

## Phase 2 — Micro-interactions (after visual pass)

- Heatmap cell: spring scale on tap (0.92 → 1.0)
- Button: subtle pulse on press for gradient buttons
- Tab switch: fade + slide transition
- Card entry: fade-up on mount (staggered in lists)
- Interest chip select: scale bounce
- Proposal card: swipe-to-respond gesture

---

## Implementation Order

1. Design tokens (tailwind.config.js + constants)
2. Button + Input + Avatar components
3. Auth screens (Login, Signup)
4. Home screen (biggest visual impact)
5. Profile screen
6. Friends + Groups screens
7. Proposals + Feed screens
8. Phase 2 micro-interactions
