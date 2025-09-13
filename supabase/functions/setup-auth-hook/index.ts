import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authEmailHookSecret = Deno.env.get('AUTH_EMAIL_HOOK_SECRET');
    const projectRef = 'fepxacqrrjvnvpgzwhyr';

    if (!supabaseUrl || !serviceRoleKey || !authEmailHookSecret) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Configuration incomplete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Setting up auth hooks configuration...');

    // URL du webhook auth
    const authHookUrl = `${supabaseUrl}/functions/v1/auth-email-sender`;
    
    // 1. Configurer le auth hook via l'API Management
    const authHookResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        ENABLE_SIGNUP: true,
        ENABLE_CONFIRMATIONS: true,
        ENABLE_EMAIL_CONFIRMATIONS: true,
        MAILER_AUTOCONFIRM: false,
        SMTP_HOST: '',
        SMTP_PORT: '',
        SMTP_USER: '',
        SMTP_PASS: '',
        SMTP_ADMIN_EMAIL: 'info@vybbi.app',
        EXTERNAL_EMAIL_ENABLED: true,
        HOOK_SEND_EMAIL_ENABLED: true,
        HOOK_SEND_EMAIL_URI: authHookUrl,
        HOOK_SEND_EMAIL_SECRETS: authEmailHookSecret
      })
    });

    if (!authHookResponse.ok) {
      const errorText = await authHookResponse.text();
      console.error('Failed to configure auth hook:', authHookResponse.status, errorText);
      
      // Fallback: essayer avec une autre structure
      const fallbackResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/hooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({
          type: 'auth.send_email',
          uri: authHookUrl,
          method: 'POST',
          secrets: {
            'x-hook-secret': authEmailHookSecret
          }
        })
      });

      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.text();
        console.error('Fallback hook creation failed:', fallbackResponse.status, fallbackError);
        throw new Error(`Hook configuration failed: ${authHookResponse.status} - ${errorText}`);
      }
      
      console.log('Auth hook configured via fallback method');
    } else {
      console.log('Auth hook configured successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Auth hook configured successfully. Emails will now be sent via Brevo.',
      hook_url: authHookUrl,
      instructions: 'You can now test by creating a new account. All auth emails will be sent via Brevo from info@vybbi.app'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error setting up auth hook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);