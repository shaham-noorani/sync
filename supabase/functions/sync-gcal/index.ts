import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy'

// Returns the time slots that overlap with a busy interval
// slot hours: morning 6-12, afternoon 12-18, evening 18-24
function getBusySlots(dateStr: string, busyStart: Date, busyEnd: Date): string[] {
  const slots: string[] = []
  const slotRanges = [
    { name: 'morning',   start: 6,  end: 12 },
    { name: 'afternoon', start: 12, end: 18 },
    { name: 'evening',   start: 18, end: 24 },
  ]
  for (const { name, start, end } of slotRanges) {
    const slotStart = new Date(`${dateStr}T${String(start).padStart(2, '0')}:00:00`)
    const slotEnd   = new Date(`${dateStr}T${end === 24 ? '23:59:59' : `${end}:00:00`}`)
    // Mark busy if there's any overlap
    if (busyStart < slotEnd && busyEnd > slotStart) {
      slots.push(name)
    }
  }
  return slots
}

async function refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const googleClientId = Deno.env.get('EXPO_PUBLIC_GOOGLE_CLIENT_ID')!
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Get all gcal connections
    const { data: connections, error: connErr } = await adminClient
      .from('gcal_connections')
      .select('id, user_id, google_email, vault_secret_name, access_token, token_expiry')

    if (connErr) throw connErr
    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ message: 'No connections to sync' }), { headers: corsHeaders })
    }

    const now = new Date()
    const syncStart = now.toISOString()
    const syncEnd = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString() // 4 weeks

    let synced = 0
    let errors = 0

    for (const conn of connections) {
      try {
        // Get refresh token from Vault using correct schema access
        const { data: vaultRow } = await adminClient
          .schema('vault')
          .from('decrypted_secrets')
          .select('decrypted_secret')
          .eq('name', conn.vault_secret_name)
          .single() as any

        const refreshToken = vaultRow?.decrypted_secret
        if (!refreshToken) {
          console.error(`No refresh token for connection ${conn.id}`)
          continue
        }

        // Refresh the access token if expired or missing
        let accessToken = conn.access_token
        const isExpired = !conn.token_expiry || new Date(conn.token_expiry) <= now

        if (!accessToken || isExpired) {
          const tokenData = await refreshAccessToken(googleClientId, googleClientSecret, refreshToken)
          accessToken = tokenData.access_token
          const newExpiry = new Date(now.getTime() + (tokenData.expires_in - 60) * 1000).toISOString()
          await adminClient
            .from('gcal_connections')
            .update({ access_token: accessToken, token_expiry: newExpiry })
            .eq('id', conn.id)
        }

        // Get enabled calendar IDs for this connection
        const { data: enabledCals } = await adminClient
          .from('gcal_calendars')
          .select('google_calendar_id')
          .eq('gcal_connection_id', conn.id)
          .eq('is_enabled', true)

        if (!enabledCals || enabledCals.length === 0) continue

        // Call Google Freebusy API
        const freebusyRes = await fetch(GOOGLE_FREEBUSY_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeMin: syncStart,
            timeMax: syncEnd,
            items: enabledCals.map((c) => ({ id: c.google_calendar_id })),
          }),
        })

        if (!freebusyRes.ok) {
          console.error(`Freebusy failed for ${conn.id}: ${await freebusyRes.text()}`)
          errors++
          continue
        }

        const freebusyData = await freebusyRes.json()

        // Collect all busy intervals across all calendars
        const busyIntervals: Array<{ start: Date; end: Date }> = []
        for (const calId of enabledCals.map((c) => c.google_calendar_id)) {
          const intervals = freebusyData.calendars?.[calId]?.busy ?? []
          for (const interval of intervals) {
            busyIntervals.push({ start: new Date(interval.start), end: new Date(interval.end) })
          }
        }

        // Convert to date+slot pairs, deduplicate
        const busySlotSet = new Set<string>()
        for (const { start, end } of busyIntervals) {
          // Iterate days covered by this interval
          const cursor = new Date(start)
          cursor.setHours(0, 0, 0, 0)
          const endDay = new Date(end)
          endDay.setHours(23, 59, 59, 999)

          while (cursor <= endDay) {
            const dateStr = cursor.toISOString().split('T')[0]
            const slots = getBusySlots(dateStr, start, end)
            for (const slot of slots) busySlotSet.add(`${dateStr}::${slot}`)
            cursor.setDate(cursor.getDate() + 1)
          }
        }

        // Delete all gcal slots in sync window for this user, then re-insert
        // (simpler than diffing — window is only 4 weeks)
        const syncStartDate = now.toISOString().split('T')[0]
        const syncEndDate = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        await adminClient
          .from('availability_slots')
          .delete()
          .eq('user_id', conn.user_id)
          .eq('source', 'gcal')
          .gte('date', syncStartDate)
          .lte('date', syncEndDate)

        // Re-insert the current busy slots
        if (busySlotSet.size > 0) {
          const rows = Array.from(busySlotSet).map((key) => {
            const [date, time_block] = key.split('::')
            return { user_id: conn.user_id, date, time_block, is_available: false, source: 'gcal' }
          })
          await adminClient.from('availability_slots').insert(rows)
        }

        // Delete gcal slots outside the 4-week window (historical cleanup)
        await adminClient
          .from('availability_slots')
          .delete()
          .eq('user_id', conn.user_id)
          .eq('source', 'gcal')
          .lt('date', syncStartDate)

        synced++
      } catch (connError) {
        console.error(`Error syncing connection ${conn.id}:`, connError)
        errors++
      }
    }

    return new Response(JSON.stringify({ synced, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('sync-gcal fatal error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: corsHeaders,
    })
  }
})
