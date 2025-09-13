import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

// Configuration Brevo API
const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const fromEmail = Deno.env.get("MAIL_FROM_EMAIL") || "info@vybbi.app";
const fromName = Deno.env.get("MAIL_FROM_NAME") || "Vybbi";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  type: 'user_registration' | 'admin_notification' | 'review_notification' | 'contact_message' | 'booking_proposed' | 'booking_status_changed' | 'message_received' | 'prospect_follow_up' | 'prospect_email';
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
    eventTitle?: string;
    eventDate?: string;
    venueName?: string;
    bookingStatus?: string;
    proposedFee?: number;
    [key: string]: any;
  };
  subject?: string;
  html?: string;
  htmlContent?: string;
  template_id?: string;
  isTest?: boolean;
}

const getEmailTemplate = (type: string, data: any) => {
  const templates = {
    user_registration: {
      subject: `Bienvenue sur Vybbi, ${data.userName} !`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="width: 56px; height: 56px; display: block; margin: 0 auto 10px; border-radius: 8px; background: rgba(255,255,255,0.1);" />
            <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue sur Vybbi !</h1>
          </div>
          
          <div style="background: #171717; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.userName},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Félicitations ! Votre compte <strong>${data.profileType}</strong> a été créé avec succès sur Vybbi.
            </p>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 25px;">
              Pour finaliser l'activation de votre compte, <strong>veuillez confirmer votre adresse e-mail</strong> en cliquant sur le lien de validation que nous venons de vous envoyer.
            </p>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 25px;">
              Vous pouvez maintenant :
            </p>
            
            <ul style="color: #e5e5e5; line-height: 1.8; margin-bottom: 25px;">
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
            
            <p style="color: #a1a1aa; font-size: 14px; margin-top: 30px; border-top: 1px solid #404040; padding-top: 20px;">
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
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background: #262626; padding: 20px; border-left: 4px solid #667eea;">
            <h2 style="color: #ffffff; margin: 0 0 15px 0;">Nouvelle inscription sur Vybbi</h2>
            
            <div style="background: #171717; padding: 20px; border-radius: 5px; margin: 15px 0; border: 1px solid #404040;">
              <h3 style="color: #667eea; margin-top: 0;">Détails du nouveau membre :</h3>
              <p style="color: #e5e5e5;"><strong>Nom :</strong> ${data.userName}</p>
              <p style="color: #e5e5e5;"><strong>Email :</strong> ${data.userEmail}</p>
              <p style="color: #e5e5e5;"><strong>Type de profil :</strong> ${data.profileType}</p>
              <p style="color: #e5e5e5;"><strong>Date d'inscription :</strong> ${new Date().toLocaleString('fr-FR')}</p>
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
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvel avis reçu !</h1>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu un nouvel avis de la part de <strong>${data.reviewerName}</strong> !
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="color: #ffc107; margin-right: 10px; font-size: 18px;">
                  ${'★'.repeat(data.rating || 0)}${'☆'.repeat(5 - (data.rating || 0))}
                </span>
                <span style="color: #a1a1aa;">${data.rating}/5 étoiles</span>
              </div>
              ${data.message ? `<p style="color: #e5e5e5; font-style: italic; margin: 0;">"${data.message}"</p>` : ''}
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
            
            <p style="color: #a1a1aa; font-size: 14px; margin-top: 25px; border-top: 1px solid #404040; padding-top: 15px;">
              Les avis permettent de renforcer votre crédibilité sur la plateforme Vybbi.
            </p>
          </div>
        </div>
      `
    },

    contact_message: {
      subject: `Nouveau message de contact de ${data.senderName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background: #262626; padding: 20px; border-left: 4px solid #28a745;">
            <h2 style="color: #ffffff; margin: 0 0 15px 0;">Nouveau message de contact</h2>
            
            <div style="background: #171717; padding: 20px; border-radius: 5px; margin: 15px 0; border: 1px solid #404040;">
              <h3 style="color: #28a745; margin-top: 0;">Message reçu :</h3>
              <p style="color: #e5e5e5;"><strong>De :</strong> ${data.senderName}</p>
              <p style="color: #e5e5e5;"><strong>Email :</strong> ${data.senderEmail}</p>
              <p style="color: #e5e5e5;"><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              
              <div style="background: #262626; padding: 15px; margin: 15px 0; border-radius: 3px; border: 1px solid #404040;">
                <p style="margin: 0; white-space: pre-line; color: #e5e5e5;">${data.message}</p>
              </div>
            </div>
          </div>
        </div>
      `
    },

    booking_proposed: {
      subject: `Nouvelle demande de booking pour ${data.eventTitle}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle demande de booking !</h1>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour,</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              L'artiste <strong>${data.artistName}</strong> souhaite être booké pour votre événement :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>Événement:</strong> ${data.eventTitle}</p>
              <p style="color: #e5e5e5;"><strong>Date:</strong> ${data.eventDate}</p>
              ${data.proposedFee ? `<p style="color: #e5e5e5;"><strong>Cachet proposé:</strong> ${data.proposedFee}€</p>` : ''}
              ${data.message ? `<p style="color: #e5e5e5;"><strong>Message:</strong></p><p style="color: #e5e5e5;">${data.message}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/events" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Gérer les demandes
              </a>
            </div>
          </div>
        </div>
      `
    },

    booking_status_changed: {
      subject: `Votre demande de booking a été ${data.bookingStatus === 'confirmed' ? 'confirmée' : 'annulée'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Mise à jour de votre demande</h1>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Votre demande de booking pour l'événement <strong>${data.eventTitle}</strong> a été <strong>${data.bookingStatus === 'confirmed' ? 'confirmée' : 'annulée'}</strong>.
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>Lieu:</strong> ${data.venueName}</p>
              <p style="color: #e5e5e5;"><strong>Date:</strong> ${data.eventDate}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Voir mes bookings
              </a>
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
    const body = await req.json() as any;
    const { type, to, data = {}, isTest, subject: providedSubject, html, htmlContent: providedHtmlContent }: NotificationEmailRequest & { [key:string]: any } = body;

    console.log(`Sending ${type} email to ${to} ${isTest ? '(TEST)' : ''}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    let subject: string;
    let htmlContent: string;

    // If subject/html provided by caller, use them directly
    if ((providedSubject && (html || providedHtmlContent))) {
      subject = providedSubject;
      htmlContent = (html || providedHtmlContent) as string;

      // Replace variables if any data provided
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          subject = subject.replace(placeholder, String(data[key]));
          htmlContent = htmlContent.replace(placeholder, String(data[key]));
        });
      }
    } else {
      // Get email template from database
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('subject, html_content')
        .eq('type', type)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        console.log('Template not found in DB, using fallback:', templateError);
        // Fallback to hardcoded templates
        const fallback = getEmailTemplate(type, data);
        subject = fallback.subject;
        htmlContent = fallback.html;
      } else {
        subject = template.subject;
        htmlContent = template.html_content;

        // Replace variables in template
        Object.keys(data).forEach(key => {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          subject = subject.replace(placeholder, String(data[key]));
          htmlContent = htmlContent.replace(placeholder, String(data[key]));
        });
      }
    }

    // Send email via Brevo
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const emailData = {
      sender: {
        name: fromName,
        email: fromEmail
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    };

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey
      },
      body: JSON.stringify(emailData)
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error("Brevo API error:", errorData);
      throw new Error(`Brevo API error: ${brevoResponse.status} - ${errorData}`);
    }

    const emailResponse = await brevoResponse.json();

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.messageId 
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