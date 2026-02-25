import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

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

    // Fix 5: validate message presence, type, and length
    if (!message || typeof message !== 'string' || message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Invalid or too-long message' }), {
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

    // Fix 3: validate today before embedding in prompt
    const todayStr = (typeof today === 'string' && DATE_REGEX.test(today))
      ? today
      : new Date().toISOString().split('T')[0]

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
      // Fix 1: log full error server-side, return safe message to client
      const errText = await response.text()
      console.error(`Anthropic API error ${response.status}: ${errText}`)
      throw new Error('Failed to contact AI service')
    }

    const data = await response.json()

    // Fix 2: guard against unexpected response shape
    const rawText = data?.content?.[0]?.text
    if (typeof rawText !== 'string') {
      console.error('Unexpected Anthropic response shape:', JSON.stringify(data))
      throw new Error('Unexpected response shape from AI service')
    }

    const cleaned = rawText.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '')

    // Fix 4: wrap JSON.parse in try/catch
    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('Claude returned non-JSON:', cleaned)
      return new Response(
        JSON.stringify({ error: 'AI service returned an unreadable response' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
