# AI Availability Assistant — Design

**Goal:** Let users describe their availability in plain English; the AI parses it into structured changes and shows a preview before applying them.

**Entry point:** "Ask AI" button on the existing `/availability/edit` screen opens a modal.

---

## Architecture

### Supabase Edge Function: `parse-availability`

- **Input:** `{ message: string, today: string }`
- **Output:** `{ summary: string, slots: Slot[], trips: Trip[] }` or `{ error: string }`
- **Model:** Claude Haiku (fast, low cost)
- **Auth:** User JWT passed automatically via `supabase.functions.invoke()`
- **Secret:** `ANTHROPIC_API_KEY` stored in Supabase secrets

```ts
type Slot = {
  date: string;           // YYYY-MM-DD
  time_block: 'morning' | 'afternoon' | 'evening';
  is_available: boolean;
};

type Trip = {
  start_date: string;     // YYYY-MM-DD
  end_date: string;       // YYYY-MM-DD
  label: string | null;
};
```

### System Prompt Strategy

Claude receives today's date and is instructed to return **only** a JSON object with `summary`, `slots`, and `trips`. The summary is a one-sentence human-readable description of what it understood. If it cannot parse the message, it returns `{ error: "..." }`.

---

## UI

### Trigger
Small "✨ Ask AI" pill button added to the availability edit screen header area.

### Modal Flow
1. **Input state** — multiline text field, "What's going on with your schedule?" placeholder, Send button
2. **Loading state** — spinner while edge function runs
3. **Preview state** — shows:
   - Claude's `summary` at top
   - Trips to be added (date range + label)
   - Slot changes grouped by date
   - "Apply" (primary) + "Cancel" (secondary) buttons
4. **Error state** — friendly message if parsing fails

### Applying Changes
On "Apply", the app runs:
- `useAddTravelPeriod` for each trip
- `useToggleSlot` (upsert) for each slot
- Invalidates relevant React Query caches → heatmap refreshes live

---

## Data Flow

```
User types message
      ↓
supabase.functions.invoke('parse-availability', { message, today })
      ↓
Edge function → Claude Haiku (with JSON schema system prompt)
      ↓
{ summary, slots, trips }
      ↓
Preview rendered in modal
      ↓
User taps "Apply"
      ↓
Batch mutations → Supabase DB
      ↓
React Query invalidation → heatmap updates
```

---

## Error Handling

- Claude returns `{ error }` → show "I couldn't understand that — try rephrasing"
- Malformed JSON from Claude → edge function catches, returns `{ error }`
- Network/Supabase error → show generic retry message
- Empty slots + trips after parse → show "No changes detected"
