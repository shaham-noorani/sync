# AI Availability Assistant — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users describe their availability in plain English from the availability edit screen; Claude Haiku parses it, shows a preview, and applies the changes on confirm.

**Architecture:** A Supabase Edge Function (`parse-availability`) proxies the Claude Haiku API call, keeping the API key out of the app bundle. The app calls it via `supabase.functions.invoke()`, renders a preview modal, and applies mutations using existing hooks on confirm.

**Tech Stack:** Supabase Edge Functions (Deno), Anthropic Claude Haiku API, React Native Modal, existing `useToggleSlot` / `useAddTravelPeriod` hooks.

---

### Task 1: Supabase Edge Function

**Files:**
- Create: `supabase/functions/parse-availability/index.ts`

**Context:**
- Edge functions live in `supabase/functions/<name>/index.ts` and are Deno TypeScript
- Deploy with: `npx supabase functions deploy parse-availability --project-ref hmnreygvxwkbsrzjxgvv`
- Set secret with: `npx supabase secrets set ANTHROPIC_API_KEY=<key> --project-ref hmnreygvxwkbsrzjxgvv`
- The app calls it via `supabase.functions.invoke('parse-availability', { body: { message, today } })`
- `today` is passed so Claude can resolve relative dates ("this weekend", "next Tuesday")
- For trips, only insert into `travel_periods` — do NOT have Claude emit individual slots for trip days. The DB's `get_effective_availability` RPC already handles travel periods as fully unavailable.

**Step 1: Create the edge function directory and file**

```bash
mkdir -p supabase/functions/parse-availability
```

Create `supabase/functions/parse-availability/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const buildSystemPrompt = (today: string) => `You are a scheduling assistant helping a user update their availability calendar. Today's date is ${today}.

Parse the user's message and return ONLY a valid JSON object with this exact structure:

{
  "summary": "one-sentence plain-English description of what you understood",
  "slots": [
    { "date": "YYYY-MM-DD", "time_block": "morning|afternoon|evening", "is_available": true|false }
  ],
  "trips": [
    { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "label": "descriptive label or null" }
  ]
}

Rules:
- "morning" = before noon, "afternoon" = noon–6pm, "evening" = after 6pm
- For trips/travel, add an entry to "trips" only — do NOT add individual slots for those days
- Use today's date to resolve relative references ("this weekend", "next Friday", "tomorrow", etc.)
- If both slots and trips are empty because nothing was understood, return: { "error": "brief explanation of what was unclear" }
- Return ONLY the JSON object — no markdown fences, no explanation text, nothing else`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, today } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const todayStr = today ?? new Date().toISOString().split('T')[0]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(todayStr),
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Anthropic API error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    const raw = data.content[0].text.trim()
    // Strip markdown code fences if Claude wraps the JSON
    const cleaned = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    const parsed = JSON.parse(cleaned)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Step 2: Set the API key secret**

```bash
npx supabase secrets set ANTHROPIC_API_KEY=<your-api-key> --project-ref hmnreygvxwkbsrzjxgvv
```

Expected output: `Finished supabase secrets set.`

**Step 3: Deploy the edge function**

```bash
npx supabase functions deploy parse-availability --project-ref hmnreygvxwkbsrzjxgvv
```

Expected: `Deployed Functions parse-availability`

**Step 4: Smoke-test with curl**

```bash
curl -X POST https://hmnreygvxwkbsrzjxgvv.supabase.co/functions/v1/parse-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbnJleWd2eHdrYnNyemp4Z3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzQ3OTQsImV4cCI6MjA4NzA1MDc5NH0.KNO1XHqLRYgfzXmeJv68Xk1I0HzkxR5m0sRZ-QwzUMI" \
  -d '{"message":"I am traveling to NYC March 5 through 8","today":"2026-02-25"}'
```

Expected: JSON with `summary`, empty `slots`, and `trips` array containing the NYC trip.

**Step 5: Commit**

```bash
git add supabase/functions/parse-availability/index.ts
git commit -m "feat: add parse-availability edge function"
```

---

### Task 2: AiAvailabilityModal Component

**Files:**
- Create: `components/AiAvailabilityModal.tsx`

**Context:**
- Uses `useColors()` from `providers/ThemeProvider` for all colors
- Uses existing hooks: `useToggleSlot` and `useAddTravelPeriod` from `hooks/useUpdateAvailability`
- Uses `supabase.functions.invoke()` from `lib/supabase`
- Modal has 4 states: `idle` (input), `loading` (spinner), `preview` (review changes), `error`
- On "Apply", calls `addTravel.mutateAsync` for each trip and `toggleSlot.mutateAsync` for each slot
- React Query cache invalidation happens automatically inside those hooks — the heatmap refreshes on its own
- `useToggleSlot` takes `{ date, timeBlock, isAvailable }` — it upserts so passing `is_available: false` marks busy

**Step 1: Create the component**

Create `components/AiAvailabilityModal.tsx`:

```tsx
import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useColors } from '../providers/ThemeProvider';
import { useToggleSlot, useAddTravelPeriod } from '../hooks/useUpdateAvailability';
import { Button } from './ui/Button';

type Slot = {
  date: string;
  time_block: 'morning' | 'afternoon' | 'evening';
  is_available: boolean;
};

type Trip = {
  start_date: string;
  end_date: string;
  label: string | null;
};

type ParseResult = {
  summary: string;
  slots: Slot[];
  trips: Trip[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00');
  const e = new Date(end + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (s.getMonth() === e.getMonth()) {
    return `${months[s.getMonth()]} ${s.getDate()} – ${e.getDate()}`;
  }
  return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}`;
}

export function AiAvailabilityModal({ visible, onClose }: Props) {
  const c = useColors();
  const [message, setMessage] = useState('');
  const [uiState, setUiState] = useState<'idle' | 'loading' | 'preview' | 'error'>('idle');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [applying, setApplying] = useState(false);

  const toggleSlot = useToggleSlot();
  const addTravel = useAddTravelPeriod();

  const reset = () => {
    setMessage('');
    setUiState('idle');
    setResult(null);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setUiState('loading');

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.functions.invoke('parse-availability', {
        body: { message: message.trim(), today },
      });

      if (error) throw new Error(error.message);
      if (data?.error) {
        setErrorMsg(data.error);
        setUiState('error');
        return;
      }
      if (!data?.slots?.length && !data?.trips?.length) {
        setErrorMsg("No changes detected. Try being more specific — e.g. \"Busy Saturday morning\" or \"Traveling to Austin Mar 3–5\".");
        setUiState('error');
        return;
      }

      setResult(data);
      setUiState('preview');
    } catch {
      setErrorMsg("Couldn't connect. Check your network and try again.");
      setUiState('error');
    }
  };

  const handleApply = async () => {
    if (!result) return;
    setApplying(true);
    try {
      await Promise.all(
        result.trips.map((trip) =>
          addTravel.mutateAsync({
            startDate: trip.start_date,
            endDate: trip.end_date,
            label: trip.label ?? undefined,
          })
        )
      );
      await Promise.all(
        result.slots.map((slot) =>
          toggleSlot.mutateAsync({
            date: slot.date,
            timeBlock: slot.time_block,
            isAvailable: slot.is_available,
          })
        )
      );
      handleClose();
    } catch {
      setErrorMsg('Failed to apply changes. Please try again.');
      setUiState('error');
    } finally {
      setApplying(false);
    }
  };

  // Group slots by date for the preview list
  const slotsByDate = (result?.slots ?? []).reduce<Record<string, Slot[]>>((acc, slot) => {
    (acc[slot.date] ??= []).push(slot);
    return acc;
  }, {});

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <View
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: 40,
            maxHeight: '85%',
            borderTopWidth: 1,
            borderColor: c.border,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 36,
              height: 4,
              backgroundColor: c.border,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginBottom: 20,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 18 }}>
                ✨ AI Scheduler
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>
                Describe your schedule in plain English
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={22} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Idle / Loading ── */}
            {(uiState === 'idle' || uiState === 'loading') && (
              <>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder={'e.g. "Traveling to NYC March 5–8" or "Busy Saturday morning"'}
                  placeholderTextColor={c.textMuted}
                  multiline
                  style={{
                    backgroundColor: c.bgCard,
                    borderWidth: 1,
                    borderColor: c.border,
                    borderRadius: 16,
                    padding: 14,
                    color: c.text,
                    fontSize: 15,
                    minHeight: 88,
                    textAlignVertical: 'top',
                  }}
                  editable={uiState !== 'loading'}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!message.trim() || uiState === 'loading'}
                  style={{
                    marginTop: 12,
                    backgroundColor: c.accent,
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: !message.trim() || uiState === 'loading' ? 0.5 : 1,
                  }}
                  activeOpacity={0.8}
                >
                  {uiState === 'loading' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                      Parse Schedule
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ── Preview ── */}
            {uiState === 'preview' && result && (
              <>
                {/* Summary pill */}
                <View
                  style={{
                    backgroundColor: c.accentBg,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 20,
                    flexDirection: 'row',
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>✨</Text>
                  <Text style={{ color: c.accent, fontSize: 14, flex: 1, lineHeight: 20 }}>
                    {result.summary}
                  </Text>
                </View>

                {/* Trips */}
                {result.trips.length > 0 && (
                  <>
                    <Text
                      style={{
                        color: c.textMuted,
                        fontSize: 11,
                        fontWeight: '700',
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}
                    >
                      Trip Added
                    </Text>
                    {result.trips.map((trip, i) => (
                      <View
                        key={i}
                        style={{
                          backgroundColor: c.bgCard,
                          borderWidth: 1,
                          borderColor: c.border,
                          borderRadius: 14,
                          padding: 14,
                          marginBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>✈️</Text>
                        <View>
                          <Text style={{ color: c.text, fontWeight: '600', fontSize: 14 }}>
                            {trip.label ?? 'Trip'}
                          </Text>
                          <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>
                            {formatDateRange(trip.start_date, trip.end_date)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {/* Slot changes */}
                {Object.keys(slotsByDate).length > 0 && (
                  <>
                    <Text
                      style={{
                        color: c.textMuted,
                        fontSize: 11,
                        fontWeight: '700',
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                        marginTop: result.trips.length > 0 ? 12 : 0,
                      }}
                    >
                      Availability Changes
                    </Text>
                    {Object.entries(slotsByDate)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([date, slots]) => (
                        <View
                          key={date}
                          style={{
                            backgroundColor: c.bgCard,
                            borderWidth: 1,
                            borderColor: c.border,
                            borderRadius: 14,
                            padding: 14,
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{ color: c.text, fontWeight: '600', fontSize: 14, marginBottom: 8 }}
                          >
                            {formatDate(date)}
                          </Text>
                          {slots.map((slot, i) => (
                            <View
                              key={i}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: i > 0 ? 6 : 0,
                              }}
                            >
                              <Ionicons
                                name={slot.is_available ? 'checkmark-circle' : 'close-circle'}
                                size={16}
                                color={slot.is_available ? '#22c55e' : c.danger}
                              />
                              <Text style={{ color: c.textSecondary, fontSize: 13, marginLeft: 8 }}>
                                {TIME_LABELS[slot.time_block]} —{' '}
                                {slot.is_available ? 'Free' : 'Busy'}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ))}
                  </>
                )}

                <View style={{ marginTop: 16, gap: 10 }}>
                  <Button title="Apply Changes" onPress={handleApply} loading={applying} />
                  <Button title="Cancel" variant="secondary" onPress={handleClose} />
                </View>
              </>
            )}

            {/* ── Error ── */}
            {uiState === 'error' && (
              <>
                <View
                  style={{
                    backgroundColor: c.dangerBg,
                    borderWidth: 1,
                    borderColor: c.dangerBorder,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: c.danger, fontSize: 14, lineHeight: 20 }}>
                    {errorMsg}
                  </Text>
                </View>
                <Button title="Try Again" onPress={() => setUiState('idle')} />
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | grep AiAvailabilityModal
```

Expected: no output (no errors).

**Step 3: Commit**

```bash
git add components/AiAvailabilityModal.tsx
git commit -m "feat: add AiAvailabilityModal component"
```

---

### Task 3: Wire the button into the availability edit screen

**Files:**
- Modify: `app/availability/edit.tsx`

**Context:**
- The edit screen already has a header with a back button and title
- Add a `useState` for modal visibility
- Add a small "✨ Ask AI" pill button to the right side of the header
- Import and render `<AiAvailabilityModal>` at the bottom of the component
- The header View is at the top of the returned JSX, inside the SafeAreaView

**Step 1: Add the import and state**

At the top of `app/availability/edit.tsx`, add the import:
```tsx
import { AiAvailabilityModal } from '../../components/AiAvailabilityModal';
```

Inside the `EditAvailabilityScreen` component, add state:
```tsx
const [aiModalVisible, setAiModalVisible] = useState(false);
```

**Step 2: Add the button to the header**

Find the header View (contains the back button and "My Availability" title). Add the AI button to the right side:

```tsx
<TouchableOpacity
  onPress={() => setAiModalVisible(true)}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.accentBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  }}
  activeOpacity={0.7}
>
  <Text style={{ fontSize: 13 }}>✨</Text>
  <Text style={{ color: c.accent, fontWeight: '600', fontSize: 13 }}>Ask AI</Text>
</TouchableOpacity>
```

**Step 3: Render the modal**

Just before the closing `</SafeAreaView>` tag, add:
```tsx
<AiAvailabilityModal
  visible={aiModalVisible}
  onClose={() => setAiModalVisible(false)}
/>
```

**Step 4: Verify the screen compiles**

```bash
npx tsc --noEmit 2>&1 | grep "edit.tsx"
```

Expected: no output.

**Step 5: Commit**

```bash
git add app/availability/edit.tsx
git commit -m "feat: wire Ask AI button into availability edit screen"
```

---

### Task 4: Manual end-to-end test

**No code changes — verification only.**

1. Run the app: `npx expo start`
2. Navigate to the availability edit screen
3. Tap "✨ Ask AI" — modal opens in idle state
4. Type: `"I'm traveling to Austin March 10–12"` → tap "Parse Schedule"
5. Verify preview shows a trip card for Austin, Mar 10–12 with the correct date range
6. Tap "Apply Changes" — modal closes, travel periods section updates
7. Re-open modal, type: `"Busy Saturday morning and Sunday afternoon"` → verify slot preview shows those two changes
8. Apply and confirm the heatmap on the main screen reflects the changes
