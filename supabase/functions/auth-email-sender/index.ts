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

// Enhanced logging function
function logWithTimestamp(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [AUTH-EMAIL] [${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

function getEmailTemplate(type: string, data: any): string {
  const { token, token_hash, redirect_to, site_url, email_action_type } = data;
  
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
        <p><a href="${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}" class="button">Confirmer mon compte</a></p>
        <p>Ou copiez ce lien dans votre navigateur :<br><small>${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}</small></p>
      `;
      break;
    case 'recovery':
      content = `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <p><a href="${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}" class="button">Réinitialiser mon mot de passe</a></p>
      `;
      break;
    case 'email_change':
      content = `
        <h2>Confirmation de changement d'email</h2>
        <p>Vous avez demandé à changer votre adresse email. Cliquez sur le lien ci-dessous pour confirmer :</p>
        <p><a href="${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}" class="button">Confirmer le changement</a></p>
      `;
      break;
    case 'invite':
      content = `
        <h2>Invitation à rejoindre Vybbi</h2>
        <p>Vous avez été invité à rejoindre notre plateforme. Cliquez sur le lien ci-dessous :</p>
        <p><a href="${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}" class="button">Accepter l'invitation</a></p>
      `;
      break;
    default:
      content = `
        <h2>Action requise</h2>
        <p>Cliquez sur le lien ci-dessous pour continuer :</p>
        <p><a href="${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}" class="button">Continuer</a></p>
      `;
  }
  
  return baseTemplate.replace('{{CONTENT}}', content);
}

const handler = async (req: Request): Promise<Response> => {
  logWithTimestamp('INFO', '=== AUTH EMAIL SENDER WEBHOOK TRIGGERED ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logWithTimestamp('INFO', 'CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw body
    const body = await req.text();
    logWithTimestamp('INFO', 'Webhook body received', { bodyLength: body.length });
    
    // Verify webhook secret
    const authHeader = req.headers.get('authorization');
    const hookSecret = req.headers.get('x-hook-secret');
    const expectedSecret = Deno.env.get('AUTH_EMAIL_HOOK_SECRET');
    
    logWithTimestamp('INFO', 'Secret verification', { 
      hasAuthHeader: !!authHeader, 
      hasHookSecret: !!hookSecret, 
      hasExpectedSecret: !!expectedSecret 
    });
    
    if (expectedSecret) {
      let isValid = false;
      
      if (authHeader?.startsWith('Bearer ')) {
        isValid = authHeader.slice(7) === expectedSecret;
      } else if (hookSecret) {
        isValid = hookSecret === expectedSecret;
      } else {
        // Try to parse webhook payload format
        try {
          const payload = JSON.parse(body);
          if (payload.secret === expectedSecret) {
            isValid = true;
          }
        } catch {
          // Not JSON, continue
        }
      }
      
      if (!isValid) {
        logWithTimestamp('ERROR', 'Invalid webhook secret - UNAUTHORIZED');
        return new Response('Unauthorized', { 
          status: 401,
          headers: corsHeaders 
        });
      }
      logWithTimestamp('SUCCESS', 'Webhook secret verified');
    }

    // Parse the payload
    let payload: AuthWebhookPayload;
    try {
      payload = JSON.parse(body);
      logWithTimestamp('SUCCESS', 'Payload parsed successfully');
    } catch (error) {
      logWithTimestamp('ERROR', 'Failed to parse webhook payload', { error: error.message });
      return new Response('Invalid JSON payload', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    logWithTimestamp('INFO', 'Auth webhook data', {
      type: payload.type,
      email_action_type: payload.email_data?.email_action_type,
      user_email: payload.user?.email,
      has_email_data: !!payload.email_data
    });

    // Only process email-related webhooks
    if (!payload.email_data || !payload.user?.email) {
      logWithTimestamp('INFO', 'Skipping non-email webhook - no action required');
      return new Response('OK - No email action required', { 
        headers: corsHeaders 
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      logWithTimestamp('ERROR', 'Missing required environment variables', { 
        hasSupabaseUrl: !!supabaseUrl, 
        hasServiceRoleKey: !!serviceRoleKey 
      });
      return new Response('Server configuration error', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Determine email subject and content
    const emailActionType = payload.email_data.email_action_type;
    let subject = 'Vybbi - Action requise';
    
    switch (emailActionType) {
      case 'signup':
        subject = 'Vybbi - Confirmez votre inscription';
        break;
      case 'recovery':
        subject = 'Vybbi - Réinitialisation de mot de passe';
        break;
      case 'email_change':
        subject = 'Vybbi - Confirmez votre nouvel email';
        break;
      case 'invite':
        subject = 'Vybbi - Vous êtes invité';
        break;
    }

    logWithTimestamp('INFO', 'Email details prepared', { 
      to: payload.user.email, 
      subject, 
      actionType: emailActionType 
    });

    // Generate HTML content
    const htmlContent = getEmailTemplate(emailActionType, {
      ...payload.email_data,
      site_url: payload.email_data.site_url || supabaseUrl?.replace('/rest/v1', '')
    });

    logWithTimestamp('INFO', 'HTML template generated', { contentLength: htmlContent.length });

    // Create Supabase client and send via Gmail
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    logWithTimestamp('INFO', '📧 SENDING EMAIL VIA GMAIL FUNCTION');
    
    const { data, error } = await supabase.functions.invoke('gmail-send-email', {
      body: {
        to: payload.user.email,
        subject: subject,
        html: htmlContent,
        templateData: {
          action_type: emailActionType,
          ...payload.email_data
        }
      }
    });
    
    if (error) {
      logWithTimestamp('ERROR', '❌ GMAIL SEND FAILED', { error: error.message });
      return new Response(JSON.stringify({ 
        error: 'Gmail send failed', 
        message: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    logWithTimestamp('SUCCESS', '✅ EMAIL SENT SUCCESSFULLY VIA GMAIL', { 
      messageId: data?.messageId,
      to: payload.user.email,
      accepted: data?.accepted
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      method: 'gmail', 
      messageId: data?.messageId,
      accepted: data?.accepted
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    logWithTimestamp('ERROR', 'CRITICAL ERROR in auth-email-sender', { error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);