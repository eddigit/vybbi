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
      // URL du webhook auth (needed for manual config message)
      const authHookUrl = `${supabaseUrl}/functions/v1/auth-email-sender`;
      
      return new Response(JSON.stringify({
        error: 'Setup completed',
        components: 'Configuration manuelle required',
        message: `La fonction auth-email-sender est prête.
        
        IMPORTANT: CONFIGURATION MANUELLE REQUISE
        
        Allez dans le Dashboard Supabase:
        1. Authentication > Hooks
        2. Activez "Send email"
        3. URL: ${authHookUrl}
        4. Header: x-hook-secret = ${authEmailHookSecret}
        5. Sauvegardez
        
        Puis dans Authentication > Email Templates:
        - Désactivez tous les templates (Confirm signup, Invite user, etc.)
        
        Une fois configuré, tous les emails d'auth passeront par info@vybbi.app via Brevo!`,
        manual_steps: {
          step1: 'Dashboard > Authentication > Hooks',
          step2: 'Enable "Send email"',
          step3: `URL: ${authHookUrl}`,
          step4: `Header: x-hook-secret = [votre secret]`,
          step5: 'Disable native email templates'
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
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
      return new Response(JSON.stringify({
        success: false, 
        error: 'auth_config_failed',
        message: `Erreur lors de la configuration du hook auth (${authHookResponse.status}): ${errorText}`,
        details: 'Le hook auth-email-sender ne peut pas être configuré automatiquement sans Personal Access Token'
      }), {
        status: authHookResponse.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Auth hook configured successfully! All auth emails will now use Brevo.');

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