import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  console.log(`[${timestamp}] [${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Send email via Brevo (preferred method)
async function sendViaBrevo(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL') || 'noreply@vybbi.com';
  const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'Vybbi';
  
  if (!brevoApiKey) {
    logWithTimestamp('ERROR', 'BREVO_API_KEY not found in environment');
    return { success: false, error: 'Brevo API key not configured' };
  }

  try {
    logWithTimestamp('INFO', 'Sending email via Brevo', { to, subject, senderEmail });
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      logWithTimestamp('SUCCESS', 'Email sent via Brevo', { messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } else {
      const errorText = await response.text();
      logWithTimestamp('ERROR', 'Brevo API error', { status: response.status, error: errorText });
      return { success: false, error: `Brevo error: ${response.status} - ${errorText}` };
    }
  } catch (error) {
    logWithTimestamp('ERROR', 'Exception in Brevo send', { error: error.message });
    return { success: false, error: `Brevo exception: ${error.message}` };
  }
}

// Fallback to Gmail
async function sendViaGmail(supabaseUrl: string, serviceRoleKey: string, to: string, subject: string, html: string, templateData: any): Promise<{ success: boolean; error?: string }> {
  try {
    logWithTimestamp('INFO', 'Attempting Gmail fallback', { to, subject });
    
    const gmailResponse = await fetch(`${supabaseUrl}/functions/v1/gmail-send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        templateData
      }),
    });

    if (gmailResponse.ok) {
      logWithTimestamp('SUCCESS', 'Email sent via Gmail fallback');
      return { success: true };
    } else {
      const errorText = await gmailResponse.text();
      logWithTimestamp('ERROR', 'Gmail fallback failed', { status: gmailResponse.status, error: errorText });
      return { success: false, error: `Gmail error: ${gmailResponse.status} - ${errorText}` };
    }
  } catch (error) {
    logWithTimestamp('ERROR', 'Exception in Gmail send', { error: error.message });
    return { success: false, error: `Gmail exception: ${error.message}` };
  }
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

    // Try Brevo first
    logWithTimestamp('INFO', '🟦 TRYING BREVO FIRST (Preferred Method)');
    const brevoResult = await sendViaBrevo(payload.user.email, subject, htmlContent);
    
    if (brevoResult.success) {
      logWithTimestamp('SUCCESS', '✅ EMAIL SENT SUCCESSFULLY VIA BREVO', { messageId: brevoResult.messageId });
      return new Response(JSON.stringify({ 
        success: true, 
        method: 'brevo', 
        messageId: brevoResult.messageId 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Fallback to Gmail
    logWithTimestamp('WARNING', '🟨 BREVO FAILED - TRYING GMAIL FALLBACK', { brevoError: brevoResult.error });
    const gmailResult = await sendViaGmail(supabaseUrl, serviceRoleKey, payload.user.email, subject, htmlContent, {
      action_type: emailActionType,
      ...payload.email_data
    });
    
    if (gmailResult.success) {
      logWithTimestamp('SUCCESS', '✅ EMAIL SENT VIA GMAIL FALLBACK');
      return new Response(JSON.stringify({ 
        success: true, 
        method: 'gmail_fallback' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Both methods failed
    logWithTimestamp('ERROR', '❌ BOTH BREVO AND GMAIL FAILED', { 
      brevoError: brevoResult.error, 
      gmailError: gmailResult.error 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Both email services failed', 
      brevoError: brevoResult.error, 
      gmailError: gmailResult.error 
    }), {
      status: 500,
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