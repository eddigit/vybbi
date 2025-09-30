import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  phone: string;
  message: string;
  prospect_id?: string;
  template_name?: string;
  template_variables?: Record<string, string>;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const whatsappToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN');
const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, prospect_id, template_name, template_variables }: WhatsAppRequest = await req.json();

    console.log('Sending WhatsApp message to:', phone);

    // Format phone number (remove +, spaces, etc.)
    const formattedPhone = phone.replace(/[^\d]/g, '');
    
    let whatsappPayload;

    if (template_name) {
      // Use WhatsApp Business template
      whatsappPayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: template_name,
          language: { code: "fr" },
          components: template_variables ? [{
            type: "body",
            parameters: Object.entries(template_variables).map(([key, value]) => ({
              type: "text",
              text: value
            }))
          }] : []
        }
      };
    } else {
      // Send regular text message
      whatsappPayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body: message }
      };
    }

    // Send to WhatsApp Business API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappPayload),
      }
    );

    const whatsappResult = await whatsappResponse.json();
    console.log('WhatsApp API response:', whatsappResult);

    if (whatsappResponse.ok) {
      // Log interaction in database if prospect_id provided
      if (prospect_id) {
        await supabase.from('prospect_interactions').insert({
          prospect_id,
          type: 'whatsapp_sent',
          content: message,
          metadata: {
            phone: formattedPhone,
            template_name,
            whatsapp_message_id: whatsappResult.messages?.[0]?.id,
            delivery_status: 'sent'
          }
        });

        // Update last contact timestamp
        await supabase
          .from('prospects')
          .update({ last_contact_at: new Date().toISOString() })
          .eq('id', prospect_id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message_id: whatsappResult.messages?.[0]?.id,
          status: 'sent' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('WhatsApp API error:', whatsappResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: whatsappResult.error?.message || 'Failed to send WhatsApp message' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in whatsapp-sender:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});