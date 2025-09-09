import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  type: 'user_registration' | 'admin_notification' | 'review_notification' | 'contact_message';
  to: string;
  data: {
    userName?: string;
    userEmail?: string;
    profileType?: string;
    artistName?: string;
    reviewerName?: string;
    rating?: number;
    message?: string;
    senderName?: string;
    senderEmail?: string;
    [key: string]: any;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const templates = {
    user_registration: {
      subject: `Bienvenue sur Vybbi, ${data.userName} !`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue sur Vybbi !</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${data.userName},</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Félicitations ! Votre compte <strong>${data.profileType}</strong> a été créé avec succès sur Vybbi.
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              Vous pouvez maintenant :
            </p>
            
            <ul style="color: #555; line-height: 1.8; margin-bottom: 25px;">
              <li>Compléter votre profil</li>
              <li>Découvrir les artistes, agents et lieux</li>
              <li>Publier ou répondre aux annonces</li>
              <li>Échanger avec la communauté</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;
                        display: inline-block;">
                Accéder à mon tableau de bord
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              L'équipe Vybbi<br>
              <em>La plateforme qui met en avant le professionnalisme et la transparence dans l'industrie musicale</em>
            </p>
          </div>
        </div>
      `
    },

    admin_notification: {
      subject: `Nouvelle inscription : ${data.userName} (${data.profileType})`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin: 0 0 15px 0;">Nouvelle inscription sur Vybbi</h2>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Détails du nouveau membre :</h3>
              <p><strong>Nom :</strong> ${data.userName}</p>
              <p><strong>Email :</strong> ${data.userEmail}</p>
              <p><strong>Type de profil :</strong> ${data.profileType}</p>
              <p><strong>Date d'inscription :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background: #667eea; 
                        color: white; 
                        padding: 10px 20px; 
                        text-decoration: none; 
                        border-radius: 3px; 
                        font-size: 14px;">
                Voir dans l'administration
              </a>
            </div>
          </div>
        </div>
      `
    },

    review_notification: {
      subject: `Nouvel avis reçu pour ${data.artistName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvel avis reçu !</h1>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${data.artistName},</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu un nouvel avis de la part de <strong>${data.reviewerName}</strong> !
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #ffc107; margin-right: 10px; font-size: 18px;">
                  ${'★'.repeat(data.rating || 0)}${'☆'.repeat(5 - (data.rating || 0))}
                </span>
                <span style="color: #666;">${data.rating}/5 étoiles</span>
              </div>
              ${data.message ? `<p style="color: #555; font-style: italic; margin: 0;">"${data.message}"</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/artists/${data.artistId || ''}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Voir tous mes avis
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 25px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
              Les avis permettent de renforcer votre crédibilité sur la plateforme Vybbi.
            </p>
          </div>
        </div>
      `
    },

    contact_message: {
      subject: `Nouveau message de contact de ${data.senderName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #28a745;">
            <h2 style="color: #333; margin: 0 0 15px 0;">Nouveau message de contact</h2>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Message reçu :</h3>
              <p><strong>De :</strong> ${data.senderName}</p>
              <p><strong>Email :</strong> ${data.senderEmail}</p>
              <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              
              <div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 3px;">
                <p style="margin: 0; white-space: pre-line;">${data.message}</p>
              </div>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[type as keyof typeof templates] || {
    subject: 'Notification Vybbi',
    html: `<p>Notification: ${JSON.stringify(data)}</p>`
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { type, to, data }: NotificationEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`);

    const template = getEmailTemplate(type, data);
    
    const emailResponse = await resend.emails.send({
      from: "vybbiapp@gmail.com",
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.name
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);