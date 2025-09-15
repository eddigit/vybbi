import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hook-secret',
};

interface AuthWebhookPayload {
  type: string;
  table: string;
  record?: any;
  old_record?: any;
  user?: {
    id: string;
    email: string;
  };
  email_data?: {
    token: string;
    token_hash: string;
    redirect_to?: string;
    email_action_type: string;
    site_url: string;
  };
}

function logWithTimestamp(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [AUTH-EMAIL] [${level}] ${message}`, data ? JSON.stringify(data) : '');
}

function getEmailTemplate(type: string, data: any): string {
  const { token, token_hash, redirect_to, site_url, email_action_type, verifyUrl: overrideVerifyUrl } = data;

  // Build a correct public verification URL using Supabase verify endpoint
  // Use token for signup/recovery/invite/magic_link, token_hash for email_change
  const envSupabaseUrl = (Deno.env.get('SUPABASE_URL') || '').replace(/\/$/, '');
  const supabaseBase = envSupabaseUrl.replace(/\/rest\/v1$/, '');
  const siteBase = (site_url || supabaseBase).replace(/\/auth\/v1$/, '').replace(/\/$/, '');

  // Prefer provided verifyUrl (generated via Admin API) when available
  let verifyUrl = overrideVerifyUrl;

  if (!verifyUrl) {
    // Prefer token_hash when available (GoTrue v2); fallback to token
    const useHash = !!token_hash;
    const paramName = useHash ? 'token_hash' : 'token';
    const paramValue = useHash ? token_hash : token;
    
    // Use callback URL for proper client-side handling
    const callbackUrl = `${siteBase}/auth/callback`;
    verifyUrl = `${supabaseBase}/auth/v1/verify?${paramName}=${paramValue}&type=${email_action_type}&redirect_to=${encodeURIComponent(callbackUrl)}`;
  }
  
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vybbi - Action requise</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
        .content { line-height: 1.6; color: #333; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎵 Vybbi</div>
        </div>
        <div class="content">
          {{CONTENT}}
        </div>
        <div class="footer">
          <p>Si vous n'avez pas demandé cette action, ignorez cet email.</p>
          <p>© 2024 Vybbi - Plateforme de talents musicaux</p>
        </div>
      </div>
    </body>
    </html>
  `;

  let content = '';
  
  switch (type) {
    case 'signup':
      content = `
        <h2>Bienvenue sur Vybbi !</h2>
        <p>Merci de vous être inscrit sur notre plateforme. Pour activer votre compte, cliquez sur le lien ci-dessous :</p>
        <p><a href="${verifyUrl}" class="button">Confirmer mon compte</a></p>
        <p>Ou copiez ce lien dans votre navigateur :<br><small>${verifyUrl}</small></p>
      `;
      break;
    case 'recovery':
      content = `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <p><a href="${verifyUrl}" class="button">Réinitialiser mon mot de passe</a></p>
      `;
      break;
    case 'email_change':
      content = `
        <h2>Confirmation de changement d'email</h2>
        <p>Vous avez demandé à changer votre adresse email. Cliquez sur le lien ci-dessous pour confirmer :</p>
        <p><a href="${verifyUrl}" class="button">Confirmer le changement</a></p>
      `;
      break;
    case 'invite':
      content = `
        <h2>Invitation à rejoindre Vybbi</h2>
        <p>Vous avez été invité à rejoindre notre plateforme. Cliquez sur le lien ci-dessous :</p>
        <p><a href="${verifyUrl}" class="button">Accepter l'invitation</a></p>
      `;
      break;
    default:
      content = `
        <h2>Action requise</h2>
        <p>Cliquez sur le lien ci-dessous pour continuer :</p>
        <p><a href="${verifyUrl}" class="button">Continuer</a></p>
      `;
  }
  
  return baseTemplate.replace('{{CONTENT}}', content);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw body
    const body = await req.text();
    logWithTimestamp('INFO', 'Processing auth webhook', { bodyLength: body.length });
    
    // Parse the payload
    let payload: AuthWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (error: any) {
      logWithTimestamp('ERROR', 'Invalid JSON payload', { error: error.message });
      return new Response('Invalid JSON payload', { status: 400, headers: corsHeaders });
    }

    // Only process email-related webhooks
    if (!payload.email_data || !payload.user?.email) {
      return new Response('OK - No email action required', { headers: corsHeaders });
    }

    const { email_action_type, user } = { 
      email_action_type: payload.email_data.email_action_type, 
      user: payload.user 
    };
    logWithTimestamp('INFO', `Processing ${email_action_type} email for ${user.email}`);

    // Env
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      logWithTimestamp('ERROR', 'Missing required environment variables');
      return new Response('Server configuration error', { status: 500, headers: corsHeaders });
    }

    // Email meta
    const emailActionType = payload.email_data.email_action_type;
    const subjectMap = {
      signup: 'Vybbi - Confirmez votre inscription',
      recovery: 'Vybbi - Réinitialisation de mot de passe',
      email_change: "Vybbi - Confirmez votre nouvel email",
      invite: "Vybbi - Vous êtes invité",
    } as const;
    const subject = (subjectMap as any)[emailActionType] || 'Vybbi - Action requise';

    // Prepare callback and site URL
    const siteUrl = payload.email_data.site_url || supabaseUrl.replace('/rest/v1', '');
    const siteBase = (siteUrl || '').replace(/\/auth\/v1$/, '').replace(/\/$/, '');
    const callbackUrl = `${siteBase}/auth/callback`;

    // Background task: generate link + send email
    const backgroundTask = async () => {
      try {
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        const mappedType = (emailActionType === 'signup') ? 'magiclink' : (emailActionType as any);
        // @ts-ignore - admin API typing is broad in esm shim
        const { data: linkData, error: linkError } = await (adminClient.auth as any).admin.generateLink({
          type: mappedType,
          email: user.email,
          options: { redirectTo: callbackUrl },
        });

        let verifyUrlOverride: string | undefined;
        if (linkError) {
          logWithTimestamp('ERROR', 'Failed to generate action link', { error: linkError.message, emailActionType, mappedType });
        } else {
          verifyUrlOverride = (linkData?.properties?.action_link) || (linkData?.action_link);
          logWithTimestamp('INFO', 'Generated action link via Admin API', { emailActionType, mappedType });
        }

        // Build HTML
        const htmlContent = getEmailTemplate(emailActionType, {
          ...payload.email_data,
          site_url: siteUrl,
          verifyUrl: verifyUrlOverride,
        });

        const supa = createClient(supabaseUrl, serviceRoleKey);
        const { data, error } = await supa.functions.invoke('gmail-send-email', {
          body: {
            to: user.email,
            subject,
            html: htmlContent,
            templateData: { action_type: emailActionType, ...payload.email_data },
          },
        });

        if (error) {
          logWithTimestamp('ERROR', 'GMAIL send failed', { error: error.message });
        } else {
          logWithTimestamp('SUCCESS', 'Email sent successfully', { messageId: (data as any)?.messageId, to: user.email });
        }
      } catch (err: any) {
        logWithTimestamp('ERROR', 'Background task crashed', { error: err?.message });
      }
    };

    // Fire-and-forget to satisfy 5s webhook SLA
    // @ts-ignore - Edge runtime helper available at runtime
    EdgeRuntime.waitUntil(backgroundTask());

    return new Response(JSON.stringify({ success: true, queued: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    logWithTimestamp('ERROR', 'Critical error', { error: error.message });
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);