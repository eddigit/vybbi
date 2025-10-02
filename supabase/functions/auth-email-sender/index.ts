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
  const envSupabaseUrl = (Deno.env.get('SUPABASE_URL') || '').replace(/\/$/, '');
  const supabaseBase = envSupabaseUrl.replace(/\/rest\/v1$/, '');
  const siteBase = (site_url || supabaseBase).replace(/\/auth\/v1$/, '').replace(/\/$/, '');

  // Prefer provided verifyUrl (generated via Admin API) when available
  let verifyUrl = overrideVerifyUrl;

  if (!verifyUrl) {
    const useHash = !!token_hash;
    const paramName = useHash ? 'token_hash' : 'token';
    const paramValue = useHash ? token_hash : token;
    
    const callbackUrl = `${siteBase}/auth/callback`;
    verifyUrl = `${supabaseBase}/auth/v1/verify?${paramName}=${paramValue}&type=${email_action_type}&redirect_to=${encodeURIComponent(callbackUrl)}`;
  }
  
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vybbi - Action requise</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
          padding: 40px 20px;
          line-height: 1.6;
        }
        .email-wrapper { max-width: 600px; margin: 0 auto; }
        .container { 
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
          background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 50%, #6E59A5 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo-container {
          background: rgba(255, 255, 255, 0.95);
          display: inline-block;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .logo { 
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        .content { 
          padding: 40px 30px;
          color: #1a1a2e;
        }
        .content h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 20px;
          line-height: 1.3;
        }
        .content p {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 16px;
        }
        .highlight {
          background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }
        .cta-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
          color: #ffffff !important;
          font-size: 16px;
          font-weight: 600;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(155, 135, 245, 0.4);
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(155, 135, 245, 0.5);
        }
        .fallback-link {
          margin-top: 24px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #9b87f5;
        }
        .fallback-link p {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 8px;
        }
        .fallback-link a {
          color: #7E69AB;
          word-break: break-all;
          font-size: 13px;
        }
        .benefits {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 24px;
          border-radius: 12px;
          margin: 24px 0;
        }
        .benefit-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .benefit-icon {
          color: #9b87f5;
          font-size: 20px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .signature {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #e2e8f0;
        }
        .signature-name {
          font-weight: 600;
          color: #1a1a2e;
        }
        .signature-title {
          color: #7E69AB;
          font-size: 14px;
          font-style: italic;
        }
        .footer {
          background: #1a1a2e;
          padding: 30px;
          text-align: center;
        }
        .footer p {
          color: #a0aec0;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .footer a {
          color: #9b87f5;
          text-decoration: none;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: #9b87f5;
          font-size: 20px;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          body { padding: 20px 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .content h2 { font-size: 24px; }
          .button { padding: 14px 32px; font-size: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <div class="logo">🎵 VYBBI</div>
            </div>
          </div>
          <div class="content">
            {{CONTENT}}
          </div>
          <div class="footer">
            <p>Si vous n'avez pas demandé cette action, vous pouvez ignorer cet email en toute sécurité.</p>
            <p>Des questions ? Contactez-nous à <a href="mailto:contact@vybbi.app">contact@vybbi.app</a></p>
            <div class="social-links">
              <a href="https://vybbi.app" title="Vybbi">🌐</a>
              <a href="#" title="Instagram">📷</a>
              <a href="#" title="Twitter">🐦</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px;">© 2025 Vybbi - La plateforme qui connecte les talents musicaux</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  let content = '';
  
  switch (type) {
    case 'signup':
      content = `
        <h2>🎉 Bienvenue dans la famille Vybbi !</h2>
        <p>Bonjour et merci de rejoindre <span class="highlight">Vybbi</span>, la plateforme qui révolutionne le monde de la musique !</p>
        
        <p>Vous êtes à <strong>un clic</strong> de découvrir un écosystème unique où artistes, lieux, agents et managers se connectent et collaborent.</p>
        
        <div class="cta-container">
          <a href="${verifyUrl}" class="button">✨ Confirmer mon compte</a>
        </div>
        
        <div class="benefits">
          <div class="benefit-item">
            <span class="benefit-icon">🎤</span>
            <span><strong>Créez votre profil artistique</strong> et partagez votre univers musical</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🤝</span>
            <span><strong>Connectez-vous</strong> avec des professionnels de l'industrie</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">📊</span>
            <span><strong>Accédez à des outils</strong> de gestion et d'analyse performants</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🎵</span>
            <span><strong>Diffusez votre musique</strong> sur notre radio communautaire</span>
          </div>
        </div>
        
        <div class="fallback-link">
          <p><strong>Le bouton ne fonctionne pas ?</strong></p>
          <p>Copiez et collez ce lien dans votre navigateur :</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </div>
        
        <div class="signature">
          <p>À très bientôt sur Vybbi ! 🚀</p>
          <p class="signature-name">Gilles K.</p>
          <p class="signature-title">Fondateur & CEO de Vybbi</p>
        </div>
      `;
      break;
    case 'recovery':
      content = `
        <h2>🔐 Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe Vybbi.</p>
        
        <p>Pas de panique ! Cliquez simplement sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé.</p>
        
        <div class="cta-container">
          <a href="${verifyUrl}" class="button">🔑 Réinitialiser mon mot de passe</a>
        </div>
        
        <div class="fallback-link">
          <p><strong>Le bouton ne fonctionne pas ?</strong></p>
          <p>Copiez et collez ce lien dans votre navigateur :</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </div>
        
        <p style="margin-top: 24px; padding: 16px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px;">
          <strong>⚠️ Important :</strong> Ce lien expire dans 1 heure pour votre sécurité.
        </p>
        
        <div class="signature">
          <p>L'équipe Vybbi 🎵</p>
        </div>
      `;
      break;
    case 'email_change':
      content = `
        <h2>📧 Confirmation de changement d'email</h2>
        <p>Vous avez demandé à changer votre adresse email sur Vybbi.</p>
        
        <p>Pour confirmer ce changement et sécuriser votre compte, cliquez sur le bouton ci-dessous :</p>
        
        <div class="cta-container">
          <a href="${verifyUrl}" class="button">✅ Confirmer le changement</a>
        </div>
        
        <div class="fallback-link">
          <p><strong>Le bouton ne fonctionne pas ?</strong></p>
          <p>Copiez et collez ce lien dans votre navigateur :</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </div>
        
        <p style="margin-top: 24px; padding: 16px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px;">
          <strong>ℹ️ Note :</strong> Si vous n'avez pas demandé ce changement, contactez-nous immédiatement.
        </p>
        
        <div class="signature">
          <p>L'équipe Vybbi 🎵</p>
        </div>
      `;
      break;
    case 'invite':
      content = `
        <h2>🎊 Vous êtes invité(e) à rejoindre Vybbi !</h2>
        <p>Bonne nouvelle ! Vous avez été invité(e) à rejoindre <span class="highlight">Vybbi</span>, la plateforme qui connecte les talents musicaux.</p>
        
        <div class="benefits">
          <div class="benefit-item">
            <span class="benefit-icon">🌟</span>
            <span><strong>Réseau exclusif</strong> de professionnels de la musique</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🚀</span>
            <span><strong>Opportunités</strong> de collaborations et de bookings</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🎯</span>
            <span><strong>Outils professionnels</strong> pour gérer votre carrière</span>
          </div>
        </div>
        
        <div class="cta-container">
          <a href="${verifyUrl}" class="button">🎉 Accepter l'invitation</a>
        </div>
        
        <div class="fallback-link">
          <p><strong>Le bouton ne fonctionne pas ?</strong></p>
          <p>Copiez et collez ce lien dans votre navigateur :</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </div>
        
        <div class="signature">
          <p>Au plaisir de vous compter parmi nous ! 🎵</p>
          <p class="signature-name">L'équipe Vybbi</p>
        </div>
      `;
      break;
    default:
      content = `
        <h2>Action requise sur votre compte Vybbi</h2>
        <p>Une action est nécessaire pour finaliser votre demande.</p>
        
        <div class="cta-container">
          <a href="${verifyUrl}" class="button">Continuer</a>
        </div>
        
        <div class="fallback-link">
          <p><strong>Le bouton ne fonctionne pas ?</strong></p>
          <p>Copiez et collez ce lien dans votre navigateur :</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </div>
        
        <div class="signature">
          <p>L'équipe Vybbi 🎵</p>
        </div>
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

    // Handle user confirmation (send welcome email after validation)
    if (payload.type === 'user' && payload.table === 'users' && payload.record) {
      const user = payload.record;
      if (user.email_confirmed_at && !payload.old_record?.email_confirmed_at) {
        logWithTimestamp('INFO', `User confirmed email, sending welcome email to ${user.email}`);
        
        // Get user metadata for welcome email
        const displayName = user.raw_user_meta_data?.display_name || 'Utilisateur';
        const profileType = user.raw_user_meta_data?.profile_type || 'artist';
        
        try {
          // Send welcome email via external service
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
          const supa = createClient(supabaseUrl!, serviceRoleKey!);
          
          const { error: welcomeError } = await supa.functions.invoke('send-notification', {
            body: {
              type: 'welcome',
              recipientEmail: user.email,
              data: {
                userName: displayName,
                userType: profileType
              }
            }
          });
          
          if (welcomeError) {
            logWithTimestamp('ERROR', 'Failed to send welcome email', { error: welcomeError.message });
          } else {
            logWithTimestamp('SUCCESS', 'Welcome email sent after confirmation', { email: user.email });
          }
        } catch (error: any) {
          logWithTimestamp('ERROR', 'Welcome email send failed', { error: error.message });
        }
        
        return new Response('OK - Welcome email sent', { headers: corsHeaders });
      }
    }

    // Only process email-related webhooks for validation emails
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