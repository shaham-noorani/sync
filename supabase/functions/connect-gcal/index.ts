import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Verify the user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify JWT and get user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const { access_token, refresh_token } = await req.json()
    if (!access_token) return new Response(JSON.stringify({ error: 'Missing access_token' }), { status: 400, headers: corsHeaders })

    // Fetch Google Calendar list using the access token
    const calListRes = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=50',
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    if (!calListRes.ok) {
      const text = await calListRes.text()
      console.error('Google calendarList error:', text)
      return new Response(JSON.stringify({ error: 'Failed to fetch calendars' }), { status: 502, headers: corsHeaders })
    }
    const calListData = await calListRes.json()

    // Get user's Google email from the calendar list (primary calendar id = email)
    const primaryCal = calListData.items?.find((c: any) => c.primary)
    const googleEmail = primaryCal?.id ?? user.email ?? 'unknown'

    // Use service role client for Vault + DB writes
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Store refresh token in Vault (upsert: delete old secret if exists, create new)
    const vaultSecretName = `gcal_refresh_${user.id}_${googleEmail.replace(/@/g, '_').replace(/\./g, '_')}`

    // Check if a secret with this name already exists
    const { data: existingSecrets } = await adminClient
      .schema('vault')
      .from('secrets')
      .select('id')
      .eq('name', vaultSecretName)
      .limit(1)

    if (existingSecrets && existingSecrets.length > 0) {
      // Update existing secret
      await adminClient.schema('vault').rpc('update_secret', {
        id: existingSecrets[0].id,
        secret: refresh_token ?? '',
      })
    } else {
      // Create new secret
      await adminClient.rpc('vault_create_secret', {
        secret: refresh_token ?? '',
        name: vaultSecretName,
        description: `GCal refresh token for ${user.id}`,
      })
    }

    // Upsert gcal_connections
    const tokenExpiry = new Date(Date.now() + 55 * 60 * 1000).toISOString() // ~55 min
    const { data: connection, error: connError } = await adminClient
      .from('gcal_connections')
      .upsert({
        user_id: user.id,
        google_email: googleEmail,
        vault_secret_name: vaultSecretName,
        access_token,
        token_expiry: tokenExpiry,
      }, { onConflict: 'user_id,google_email' })
      .select('id')
      .single()

    if (connError) throw connError
    if (!connection) throw new Error('Failed to retrieve gcal_connection after upsert')

    // Upsert gcal_calendars
    const calendars = (calListData.items ?? []).map((cal: any) => ({
      gcal_connection_id: connection.id,
      user_id: user.id,
      google_calendar_id: cal.id,
      calendar_name: cal.summary ?? cal.id,
      color: cal.backgroundColor ?? null,
      // Enable primary calendar and calendars owned by this user by default
      is_enabled: cal.primary === true || cal.accessRole === 'owner',
      is_primary: cal.primary === true,
    }))

    await adminClient
      .from('gcal_calendars')
      .upsert(calendars, { onConflict: 'gcal_connection_id,google_calendar_id' })

    return new Response(JSON.stringify({ calendars }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('connect-gcal error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: corsHeaders,
    })
  }
})
