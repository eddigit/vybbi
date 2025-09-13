import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface NotificationEmailRequest {
  type: string;
  to: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  data?: Record<string, unknown>;
  isTest?: boolean;
  subject?: string;
  html?: string;
  htmlContent?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates avec CSS compatible pour les clients email
const getEmailTemplate = (type: string, data: Record<string, unknown>): { subject: string, html: string } => {
  const templates = {
    user_registration: {
      subject: `Bienvenue sur Vybbi, ${data.userName || 'nouveau membre'} !`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Bienvenue sur Vybbi !</h1>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Félicitations !</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Votre compte Vybbi a été créé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background-color: #3b82f6; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Accéder à mon compte
              </a>
            </div>
          </div>
        </div>
      `
    },

    admin_notification: {
      subject: `Nouvelle inscription : ${data.userName} (${data.profileType})`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle inscription sur Vybbi</h1>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Nouvel utilisateur inscrit</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Un nouvel utilisateur s'est inscrit sur la plateforme : <strong>${data.userName}</strong> (${data.userEmail})
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/admin/users" 
                 style="background-color: #3b82f6; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Voir les utilisateurs
              </a>
            </div>
          </div>
        </div>
      `
    },

    review_notification: {
      subject: `Nouvelle review reçue de ${data.reviewerName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle review reçue !</h1>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu une nouvelle review de la part de <strong>${data.reviewerName}</strong> :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>Note:</strong> ${data.rating}/5 ⭐</p>
              <p style="color: #e5e5e5;"><strong>Commentaire:</strong></p>
              <p style="color: #e5e5e5; font-style: italic;">"${data.comment}"</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background-color: #3b82f6; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Voir mes reviews
              </a>
            </div>
          </div>
        </div>
      `
    },

    contact_message: {
      subject: `Nouveau message de contact de ${data.name}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouveau message de contact</h1>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Nouveau message reçu</h2>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>De:</strong> ${data.name} (${data.email})</p>
              <p style="color: #e5e5e5;"><strong>Sujet:</strong> ${data.subject}</p>
              <p style="color: #e5e5e5;"><strong>Message:</strong></p>
              <p style="color: #e5e5e5;">${data.message}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/admin/messages" 
                 style="background-color: #3b82f6; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Gérer les messages
              </a>
            </div>
          </div>
        </div>
      `
    },

    booking_proposed: {
      subject: `Nouvelle demande de booking de ${data.artistName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
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
                 style="background-color: #3b82f6; 
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
          <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
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
                 style="background-color: #3b82f6; 
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
    },

    prospect_email: {
      subject: `${data.subject || 'Message depuis Vybbi'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
          <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎵 VYBBI</h1>
            <p style="color: white; margin: 10px 0 0; opacity: 0.9;">The Future of Music Industry Networking</p>
          </div>
          
          <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <div style="color: #e5e5e5; line-height: 1.6;">
              ${data.htmlContent || data.message || ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding-top: 20px; border-top: 1px solid #404040;">
              <p style="margin: 0 0 10px; color: #8b5cf6; font-size: 18px; font-weight: bold;">🎵 VYBBI</p>
              <p style="margin: 0; color: #888888; font-size: 14px;">The Future of Music Industry Networking</p>
              <div style="margin: 20px 0;">
                <a href="https://vybbi.com" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">🌐 Website</a>
                <a href="mailto:contact@vybbi.com" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">📧 Contact</a>
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
    const body = await req.json() as unknown;
    const {
      type,
      to,
      cc,
      bcc,
      replyTo,
      data = {},
      isTest,
      subject: providedSubject,
      html,
      htmlContent: providedHtmlContent,
    } = body as NotificationEmailRequest;

    console.log(`Sending ${type} email to ${to} ${isTest ? '(TEST)' : ''}`);
    console.log(`cc: ${Array.isArray(cc) ? cc.join(',') : cc || 'none'} | bcc: ${Array.isArray(bcc) ? bcc.join(',') : bcc || 'none'} | replyTo: ${replyTo || 'none'}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  let subject: string = '';
  let htmlContent: string = '';
  let useBrevoTemplate = false;
  let brevoTemplateId: number | null = null;
  let requiredVars: string[] = [];

    // If subject/html provided by caller, use them directly
    if ((providedSubject && (html || providedHtmlContent))) {
      subject = providedSubject;
      htmlContent = (html || providedHtmlContent) as string;

      // Replace variables if any data provided
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          // @ts-ignore - data is a dictionary of unknown values, safe to stringify
          subject = subject.replace(placeholder, String((data as Record<string, unknown>)[key]));
          // @ts-ignore
          htmlContent = htmlContent.replace(placeholder, String((data as Record<string, unknown>)[key]));
        });
      }
    } else {
      // Get email template from database (now includes provider)
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('subject, html_content, provider, brevo_template_id, required_variables')
        .eq('type', type)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        console.log('Template not found in DB, using fallback:', templateError);
        // Fallback to hardcoded templates
        const fallback = getEmailTemplate(type, data as Record<string, unknown>);
        subject = fallback.subject;
        htmlContent = fallback.html;
      } else {
        // Normalize required variables from Json to string[]
        if (Array.isArray(template.required_variables)) {
          requiredVars = template.required_variables.filter((v: unknown): v is string => typeof v === 'string');
        }

        if (template.provider === 'brevo' && template.brevo_template_id) {
          useBrevoTemplate = true;
          brevoTemplateId = template.brevo_template_id;
          subject = template.subject || providedSubject || '';
          // htmlContent not used for Brevo templates
        } else {
          subject = template.subject;
          htmlContent = template.html_content;
          // Replace variables in template
          Object.keys(data as Record<string, unknown>).forEach(key => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            // @ts-ignore - data is a dictionary of unknown values, safe to stringify
            subject = subject.replace(placeholder, String((data as Record<string, unknown>)[key]));
            // @ts-ignore
            htmlContent = htmlContent.replace(placeholder, String((data as Record<string, unknown>)[key]));
          });
        }
      }
    }

    // Validate required variables if defined
    if (requiredVars.length > 0) {
      const providedKeys = Object.keys((data || {}) as Record<string, unknown>);
      const missing = requiredVars.filter(k => !providedKeys.includes(k));
      if (missing.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Variables manquantes dans les paramètres: ${missing.join(', ')}`,
            missing,
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Send via Gmail SMTP instead of Brevo
    console.log('Attempting to send via Gmail SMTP');
    
    const { data: gmailData, error: gmailError } = await supabase.functions.invoke('gmail-send-email', {
      body: {
        to: to,
        subject: subject,
        html: htmlContent,
        templateData: data
      }
    });

    if (gmailError) {
      console.error("Gmail SMTP error:", gmailError);
      throw new Error(`Gmail SMTP error: ${gmailError.message}`);
    }

    const emailResult = gmailData;
    console.log("Email sent successfully via Gmail SMTP:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult?.messageId || 'sent'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);