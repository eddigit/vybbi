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
    const managementToken = Deno.env.get('SUPABASE_MANAGEMENT_ACCESS_TOKEN');
    const authEmailHookSecret = Deno.env.get('AUTH_EMAIL_HOOK_SECRET');
    const projectRef = 'fepxacqrrjvnvpgzwhyr';

    if (!supabaseUrl || !authEmailHookSecret) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Configuration incomplete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!managementToken) {
      return new Response(JSON.stringify({
        error: 'missing_management_token',
        message: 'Veuillez ajouter le secret SUPABASE_MANAGEMENT_ACCESS_TOKEN pour configurer automatiquement le hook.',
        action: 'Ajoutez le token (Dashboard > Account > Tokens), puis relancez.'
      }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    console.log('Setting up auth hooks configuration...');

    // URL du webhook auth
    const authHookUrl = `${supabaseUrl}/functions/v1/auth-email-sender`;
    
    // Configurer le Send Email Hook via l’API Management (clé PAT requise)
    const authHookResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Active le provider Email (utile pour signup email/password)
        external_email_enabled: true,
        // Active le hook d’email et redirige tout l’envoi vers notre Edge Function
        hook_send_email_enabled: true,
        hook_send_email_uri: authHookUrl,
        // Injecte l’en-tête personnalisé dans les requêtes sortantes
        hook_send_email_secrets: `x-hook-secret=${authEmailHookSecret}`,
        // Désactive l’autoconfirm (on veut des liens de confirmation)
        mailer_autoconfirm: false
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