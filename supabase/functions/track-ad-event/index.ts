import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackEventRequest {
  campaignId: string
  assetId?: string
  eventType: 'impression' | 'click'
  pageUrl: string
  referrer?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { campaignId, assetId, eventType, pageUrl, referrer }: TrackEventRequest = await req.json()

    // Get client information
    const userAgent = req.headers.get('user-agent') || ''
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || ''

    // Get user ID if authenticated
    const authHeader = req.headers.get('authorization')
    let userId = null
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id || null
    }

    // Insert tracking record
    const { error } = await supabase
      .from('ad_metrics')
      .insert({
        campaign_id: campaignId,
        asset_id: assetId || null,
        event_type: eventType,
        user_id: userId,
        ip_address: ipAddress || null,
        user_agent: userAgent,
        page_url: pageUrl,
        referrer: referrer || null
      })

    if (error) {
      console.error('Error tracking ad event:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to track event' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in track-ad-event function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})