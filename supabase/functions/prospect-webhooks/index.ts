import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookEvent {
  event_type: 'prospect_created' | 'prospect_converted' | 'prospect_updated' | 'task_completed' | 'booking_scheduled';
  prospect_id: string;
  agent_id?: string;
  data: Record<string, any>;
  timestamp?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event: WebhookEvent = await req.json();
    console.log('Processing webhook event:', event.event_type);

    // Get all active webhook subscriptions
    const { data: webhooks } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('is_active', true)
      .contains('events', [event.event_type]);

    if (!webhooks?.length) {
      console.log('No active webhooks for event:', event.event_type);
      return new Response(
        JSON.stringify({ message: 'No webhooks configured for this event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enrich event data
    const { data: prospect } = await supabase
      .from('prospects')
      .select(`
        *,
        vybbi_agents:assigned_agent_id (
          name,
          email
        )
      `)
      .eq('id', event.prospect_id)
      .single();

    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      prospect: prospect,
      source: 'vybbi_crm'
    };

    // Send to each webhook endpoint
    const webhookPromises = webhooks.map(async (webhook) => {
      try {
        console.log(`Sending webhook to: ${webhook.url}`);
        
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Vybbi-CRM-Webhooks/1.0',
            ...(webhook.headers || {})
          },
          body: JSON.stringify(enrichedEvent),
        });

        // Log webhook delivery
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          event_type: event.event_type,
          payload: enrichedEvent,
          response_status: response.status,
          response_body: await response.text(),
          delivered_at: new Date().toISOString(),
          success: response.ok
        });

        return { 
          webhook_id: webhook.id, 
          url: webhook.url,
          success: response.ok, 
          status: response.status 
        };
      } catch (error) {
        console.error(`Webhook delivery failed for ${webhook.url}:`, error);
        
        // Log failed delivery
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          event_type: event.event_type,
          payload: enrichedEvent,
          response_status: 0,
          response_body: error.message,
          delivered_at: new Date().toISOString(),
          success: false
        });

        return { 
          webhook_id: webhook.id, 
          url: webhook.url,
          success: false, 
          error: error.message 
        };
      }
    });

    const results = await Promise.all(webhookPromises);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`Webhook delivery complete: ${successCount}/${results.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        delivered: successCount,
        total: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in prospect-webhooks:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});