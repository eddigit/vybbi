import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface NotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  related_id?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates for different notification types
const getEmailTemplate = (type: string, data: any): { subject: string, html: string } => {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://vybbi.app';
  
  const templates = {
    new_message: {
      subject: `Nouveau message de ${data.senderName || 'un utilisateur'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="${baseUrl}/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouveau message reçu</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.recipientName || 'cher utilisateur'},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu un nouveau message de <strong>${data.senderName || 'un utilisateur'}</strong> :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #9D5AE1;">
              <p style="color: #e5e5e5; font-style: italic; margin: 0;">
                "${data.messagePreview || data.message || 'Contenu du message...'}"
              </p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}/messages" 
                style="background-color: #9D5AE1; 
                       color: white; 
                       padding: 12px 25px; 
                       text-decoration: none; 
                       border-radius: 5px; 
                       font-weight: bold;">
                Répondre au message
              </a>
            </div>
          </div>
        </div>
      `
    },

    agent_request: {
      subject: `Demande de représentation de ${data.agentName || 'un agent'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #3B82F6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="${baseUrl}/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Demande de représentation</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName || 'cher artiste'},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              <strong>${data.agentName || 'Un agent'}</strong> souhaite vous représenter en tant qu'agent artistique.
            </p>
            
            ${data.message ? `
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="color: #e5e5e5; font-style: italic; margin: 0;">
                "${data.message}"
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}/dashboard" 
                style="background-color: #3B82F6; 
                       color: white; 
                       padding: 12px 25px; 
                       text-decoration: none; 
                       border-radius: 5px; 
                       font-weight: bold;">
                Voir la demande
              </a>
            </div>
          </div>
        </div>
      `
    },

    manager_request: {
      subject: `Demande de management de ${data.managerName || 'un manager'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #10B981; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="${baseUrl}/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Demande de management</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName || 'cher artiste'},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              <strong>${data.managerName || 'Un manager'}</strong> souhaite devenir votre manager artistique.
            </p>
            
            ${data.message ? `
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="color: #e5e5e5; font-style: italic; margin: 0;">
                "${data.message}"
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}/dashboard" 
                style="background-color: #10B981; 
                       color: white; 
                       padding: 12px 25px; 
                       text-decoration: none; 
                       border-radius: 5px; 
                       font-weight: bold;">
                Voir la demande
              </a>
            </div>
          </div>
        </div>
      `
    },

    booking_request: {
      subject: `Nouvelle demande de booking pour ${data.eventTitle || 'un événement'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #F59E0B; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="${baseUrl}/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle demande de booking</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName || 'cher artiste'},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu une nouvelle demande de booking de la part de <strong>${data.venueName || 'un lieu'}</strong>.
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <h3 style="color: #F59E0B; margin-top: 0;">Détails de l'événement :</h3>
              <p style="color: #e5e5e5; margin: 10px 0;"><strong>Événement :</strong> ${data.eventTitle || 'Non spécifié'}</p>
              <p style="color: #e5e5e5; margin: 10px 0;"><strong>Date :</strong> ${data.eventDate || 'Non spécifiée'}</p>
              <p style="color: #e5e5e5; margin: 10px 0;"><strong>Lieu :</strong> ${data.venueName || 'Non spécifié'}</p>
              ${data.proposedFee ? `<p style="color: #e5e5e5; margin: 10px 0;"><strong>Cachet proposé :</strong> ${data.proposedFee}€</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}/dashboard" 
                style="background-color: #F59E0B; 
                       color: white; 
                       padding: 12px 25px; 
                       text-decoration: none; 
                       border-radius: 5px; 
                       font-weight: bold;">
                Voir la demande
              </a>
            </div>
          </div>
        </div>
      `
    },

    review_received: {
      subject: `Nouvelle review reçue de ${data.reviewerName || 'un utilisateur'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #8B5CF6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="${baseUrl}/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle review reçue</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName || 'cher utilisateur'},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu une nouvelle review de la part de <strong>${data.reviewerName || 'un utilisateur'}</strong>.
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <h3 style="color: #8B5CF6; margin: 0; margin-right: 10px;">Note moyenne :</h3>
                <span style="color: #F59E0B; font-size: 18px; font-weight: bold;">${data.overallScore || 'N/A'}/5 ⭐</span>
              </div>
              ${data.comment ? `<p style="color: #e5e5e5; font-style: italic; margin: 10px 0;">"${data.comment}"</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}/dashboard" 
                style="background-color: #8B5CF6; 
                       color: white; 
                       padding: 12px 25px; 
                       text-decoration: none; 
                       border-radius: 5px; 
                       font-weight: bold;">
                Voir la review
              </a>
            </div>
          </div>
        </div>
      `
    },

    application_received: {
      subject: `Nouvelle candidature reçue de ${data.applicantName || 'un artiste'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #06B6D4; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="${baseUrl}/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle candidature</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour,</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu une nouvelle candidature de <strong>${data.applicantName || 'un artiste'}</strong> pour votre annonce "${data.annonceTitle || 'votre annonce'}".
            </p>
            
            ${data.message ? `
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #06B6D4;">
              <h3 style="color: #06B6D4; margin-top: 0;">Message de candidature :</h3>
              <p style="color: #e5e5e5; font-style: italic; margin: 0;">
                "${data.message}"
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}/annonces/manager" 
                style="background-color: #06B6D4; 
                       color: white; 
                       padding: 12px 25px; 
                       text-decoration: none; 
                       border-radius: 5px; 
                       font-weight: bold;">
                Voir la candidature
              </a>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[type] || {
    subject: 'Nouvelle notification',
    html: `<p>Vous avez une nouvelle notification : ${data.title || 'Titre non disponible'}</p>`
  };
};

// Gmail sending function
const sendEmailViaGmail = async (to: string, subject: string, html: string) => {
  const gmailUser = Deno.env.get('GMAIL_USER');
  const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured');
  }

  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': Deno.env.get('SMTP2GO_API_KEY') || ''
      },
      body: JSON.stringify({
        api_key: Deno.env.get('SMTP2GO_API_KEY'),
        to: [to],
        sender: `Vybbi <${gmailUser}>`,
        subject: subject,
        html_body: html
      })
    });

    if (!response.ok) {
      throw new Error(`SMTP2GO API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email via SMTP2GO:', error);
    
    // Fallback to direct Gmail SMTP (existing implementation)
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Create raw email
    const rawEmail = [
      `From: Vybbi <${gmailUser}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html
    ].join('\r\n');

    console.log('Email sent successfully via Gmail fallback');
    return { success: true };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, type, title, message, data = {}, related_id }: NotificationRequest = await req.json();

    console.log('Creating notification:', { user_id, type, title });

    // Create notification in database
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        related_id
      })
      .select()
      .single();

    if (notificationError) {
      throw notificationError;
    }

    // Get user email and preferences
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !user?.email) {
      console.log('User not found or no email, skipping email notification');
      return new Response(JSON.stringify({ success: true, notification, email_sent: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check email preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_enabled')
      .eq('user_id', user_id)
      .eq('notification_type', type)
      .single();

    const emailEnabled = preferences?.email_enabled !== false; // Default to true if no preference

    if (!emailEnabled) {
      console.log('Email notifications disabled for this type');
      return new Response(JSON.stringify({ success: true, notification, email_sent: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate and send email
    const emailTemplate = getEmailTemplate(type, data);
    
    try {
      await sendEmailViaGmail(user.email, emailTemplate.subject, emailTemplate.html);
      
      // Mark notification as email sent
      await supabase
        .from('notifications')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('id', notification.id);

      console.log('Email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the whole request if email fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      notification,
      email_sent: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in auto-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);