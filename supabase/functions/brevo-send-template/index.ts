import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrevoSendRequest {
  templateId: number;
  to: Array<{
    email: string;
    name?: string;
  }>;
  params?: Record<string, any>;
  subject?: string;
  tags?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    const brevoSenderEmail = Deno.env.get('BREVO_SENDER_EMAIL');
    const brevoSenderName = Deno.env.get('BREVO_SENDER_NAME');
    
    if (!brevoApiKey || !brevoSenderEmail || !brevoSenderName) {
      console.error('Missing Brevo configuration:', { 
        hasApiKey: !!brevoApiKey, 
        hasSenderEmail: !!brevoSenderEmail, 
        hasSenderName: !!brevoSenderName 
      });
      return new Response(JSON.stringify({ error: 'Brevo configuration incomplete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { templateId, to, params = {}, subject, tags = [] }: BrevoSendRequest = await req.json();

    if (!templateId || !to || !Array.isArray(to) || to.length === 0) {
      return new Response(JSON.stringify({ error: 'templateId and to array are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Prepare the email payload for Brevo
    const emailPayload = {
      templateId,
      to: to.map(recipient => ({
        email: recipient.email,
        name: recipient.name || recipient.email
      })),
      sender: {
        name: brevoSenderName,
        email: brevoSenderEmail
      },
      params: params,
      ...(subject && { subject }),
      ...(tags.length > 0 && { tags })
    };

    console.log('Sending email via Brevo template:', {
      templateId,
      recipientCount: to.length,
      hasParams: Object.keys(params).length > 0
    });

    // Send email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo send API error:', response.status, errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to send email via Brevo',
        details: errorData
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const result = await response.json();
    console.log('Email sent successfully via Brevo:', result);

    return new Response(JSON.stringify({
      success: true,
      messageId: result.messageId,
      result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in brevo-send-template function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);