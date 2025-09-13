import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthWebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: 'signup' | 'recovery' | 'email_change' | 'invite';
    site_url: string;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const baseStyle = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1C1C1C;">
      <div style="background-color: #1C1C1C; padding: 40px 20px; text-align: center;">
        <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 60px; margin-bottom: 20px;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">{title}</h1>
      </div>
      <div style="background-color: #ffffff; padding: 40px 20px;">
        {content}
        <div style="text-align: center; margin-top: 30px;">
          <a href="{action_url}" style="display: inline-block; background-color: #9D5AE1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            {button_text}
          </a>
        </div>
        <p style="color: #666666; font-size: 14px; margin-top: 30px; text-align: center;">
          Si vous n'avez pas demandé cette action, vous pouvez ignorer cet email en toute sécurité.
        </p>
      </div>
      <div style="background-color: #1C1C1C; padding: 20px; text-align: center;">
        <p style="color: #ffffff; margin: 0; font-size: 14px;">
          © 2024 Vybbi. Tous droits réservés.
        </p>
      </div>
    </div>
  `;

  const templates = {
    signup: {
      title: "Bienvenue sur Vybbi !",
      content: `
        <h2 style="color: #1C1C1C; margin: 0 0 20px 0; font-size: 24px;">Confirmez votre inscription</h2>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Merci de vous être inscrit sur Vybbi ! Pour finaliser votre inscription et accéder à votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
          Une fois votre email confirmé, vous pourrez commencer à explorer toutes les fonctionnalités de notre plateforme.
        </p>
      `,
      button_text: "Confirmer mon email",
      action_url: `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=${data.email_action_type}&redirect_to=${data.redirect_to}`
    },
    recovery: {
      title: "Réinitialisation de mot de passe",
      content: `
        <h2 style="color: #1C1C1C; margin: 0 0 20px 0; font-size: 24px;">Réinitialisez votre mot de passe</h2>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
          Ce lien expirera dans 1 heure pour des raisons de sécurité.
        </p>
      `,
      button_text: "Réinitialiser mon mot de passe",
      action_url: `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=${data.email_action_type}&redirect_to=${data.redirect_to}`
    },
    email_change: {
      title: "Confirmation de changement d'email",
      content: `
        <h2 style="color: #1C1C1C; margin: 0 0 20px 0; font-size: 24px;">Confirmez votre nouvelle adresse email</h2>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Vous avez demandé à changer votre adresse email. Pour confirmer cette nouvelle adresse, veuillez cliquer sur le bouton ci-dessous.
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
          Une fois confirmée, cette adresse deviendra votre nouvelle adresse de connexion.
        </p>
      `,
      button_text: "Confirmer la nouvelle adresse",
      action_url: `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=${data.email_action_type}&redirect_to=${data.redirect_to}`
    },
    invite: {
      title: "Invitation à rejoindre Vybbi",
      content: `
        <h2 style="color: #1C1C1C; margin: 0 0 20px 0; font-size: 24px;">Vous êtes invité à rejoindre Vybbi</h2>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Vous avez été invité à rejoindre notre plateforme Vybbi. Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte.
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
          Découvrez toutes les fonctionnalités de notre plateforme musicale !
        </p>
      `,
      button_text: "Accepter l'invitation",
      action_url: `${data.site_url}/auth/v1/verify?token=${data.token_hash}&type=${data.email_action_type}&redirect_to=${data.redirect_to}`
    }
  };

  const template = templates[type as keyof typeof templates] || templates.signup;
  
  return baseStyle
    .replace('{title}', template.title)
    .replace('{content}', template.content)
    .replace('{button_text}', template.button_text)
    .replace('{action_url}', template.action_url);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const hookSecret = Deno.env.get('AUTH_EMAIL_HOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!hookSecret || !supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Configuration incomplete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Prefer simple header secret verification as requested (x-hook-secret)
    const headerSecret = req.headers.get('x-hook-secret');
    let webhookData: AuthWebhookPayload | null = null;

    if (headerSecret && headerSecret === hookSecret) {
      webhookData = await req.json();
    } else {
      // Fallback: support Standard Webhooks signature if configured
      try {
        const payload = await req.text();
        const headers = Object.fromEntries(req.headers);
        const wh = new Webhook(hookSecret);
        webhookData = wh.verify(payload, headers) as AuthWebhookPayload;
      } catch (err) {
        console.error('Webhook verification failed (x-hook-secret and signature):', err);
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    const { user, email_data } = webhookData!;
    const { email_action_type } = email_data;

    console.log(`Processing auth email: ${email_action_type} for ${user.email}`);

    // Get subject based on email type
    const subjects = {
      signup: 'Bienvenue sur Vybbi - Confirmez votre inscription',
      recovery: 'Vybbi - Réinitialisation de votre mot de passe',
      email_change: 'Vybbi - Confirmez votre nouvelle adresse email',
      invite: 'Vybbi - Vous êtes invité à rejoindre la plateforme'
    };

    const subject = subjects[email_action_type as keyof typeof subjects] || subjects.signup;
    const htmlContent = getEmailTemplate(email_action_type, email_data);

    // Send email via Gmail SMTP using our function
    const gmailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/gmail-send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: user.email,
        subject,
        html: htmlContent,
        templateData: { 
          userName: user.user_metadata?.display_name || user.email,
          userEmail: user.email
        }
      })
    });

    if (!gmailResponse.ok) {
      const errorData = await gmailResponse.text();
      console.error('Gmail SMTP error:', errorData);
      throw new Error(`Gmail SMTP error: ${gmailResponse.status}`);
    }

    const result = await gmailResponse.json();
    console.log(`Auth email sent successfully via Gmail SMTP:`, result);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in auth-email-sender function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);