import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VenueClaimEmailData {
  venueName: string;
  venueEmail: string;
  profileUrl: string;
  claimUrl: string;
  tempUsername: string;
  tempPassword: string;
  expiresAt: string;
  adminName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: VenueClaimEmailData = await req.json();

    const GMAIL_USER = Deno.env.get('GMAIL_USER');
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured');
    }

    const expiryDate = new Date(data.expiresAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎵 Votre Page Professionnelle Vybbi</h1>
    </div>
    <div class="content">
      <h2>Bonjour !</h2>
      
      <p>Suite à notre passage dans votre établissement <strong>${data.venueName}</strong>, nous avons le plaisir de vous informer que nous avons créé un exemple de page professionnelle pour vous sur <strong>Vybbi</strong>, la plateforme qui connecte les artistes et les lieux événementiels.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.profileUrl}" class="button">📍 Voir ma page Vybbi</a>
      </div>
      
      <h3>📋 Cette page est un exemple que vous pouvez :</h3>
      <ul>
        <li>✅ Personnaliser entièrement à votre image</li>
        <li>✅ Mettre à jour avec vos informations et événements</li>
        <li>✅ Utiliser pour être visible par des milliers d'artistes</li>
        <li>❌ Supprimer si vous ne souhaitez pas être référencé</li>
      </ul>
      
      <div class="credentials-box">
        <h3>🔐 Identifiants Temporaires</h3>
        <p>Pour gérer votre page immédiatement, vous pouvez utiliser ces identifiants temporaires :</p>
        <p><strong>Login :</strong> <code>${data.tempUsername}</code></p>
        <p><strong>Mot de passe :</strong> <code>${data.tempPassword}</code></p>
      </div>
      
      <div class="warning">
        <p><strong>⚠️ Important :</strong> Ces identifiants temporaires expirent le <strong>${expiryDate}</strong>.</p>
      </div>
      
      <h3>🎯 Créez Votre Compte Définitif</h3>
      <p>Pour une gestion complète et sécurisée de votre page, nous vous recommandons de créer votre compte définitif :</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.claimUrl}" class="button" style="background: #28a745;">✨ Créer Mon Compte Définitif</a>
      </div>
      
      <h3>💡 Pourquoi créer votre compte ?</h3>
      <ul>
        <li>🔒 Sécurité renforcée avec votre propre email et mot de passe</li>
        <li>📧 Recevez des notifications pour les demandes de booking</li>
        <li>📊 Accès aux statistiques de votre page</li>
        <li>🎨 Gestion complète de votre profil et événements</li>
      </ul>
      
      <div class="footer">
        <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>
        <p><strong>L'équipe Vybbi</strong></p>
        <p style="margin-top: 10px;">
          <a href="https://vybbi.app" style="color: #667eea;">vybbi.app</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const emailText = `
Votre Page Professionnelle Vybbi

Bonjour,

Suite à notre passage dans votre établissement ${data.venueName}, nous avons créé un exemple de page professionnelle pour vous sur Vybbi.

🔗 Votre page : ${data.profileUrl}

Cette page est un exemple que vous pouvez :
✅ Personnaliser entièrement
✅ Mettre à jour avec vos informations
✅ Supprimer si vous ne souhaitez pas être référencé

📝 Identifiants temporaires (expirent le ${expiryDate}) :
Login: ${data.tempUsername}
Mot de passe: ${data.tempPassword}

🎯 Créez votre compte définitif :
${data.claimUrl}

L'équipe Vybbi
https://vybbi.app
    `;

    // Use Gmail SMTP via edge function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/gmail-send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        to: data.venueEmail,
        subject: `🎵 Votre page professionnelle Vybbi est prête, ${data.venueName} !`,
        html: emailHtml,
        text: emailText
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email sending failed: ${error}`);
    }

    console.log('Venue claim email sent successfully to:', data.venueEmail);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-venue-claim-email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});