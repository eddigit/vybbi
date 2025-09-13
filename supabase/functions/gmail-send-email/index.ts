import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createTransport } from "npm:nodemailer@6.9.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GmailSendRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  templateData?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    
    if (!gmailUser || !gmailPassword) {
      console.error('Gmail configuration missing:', { 
        hasUser: !!gmailUser, 
        hasPassword: !!gmailPassword 
      });
      return new Response(JSON.stringify({ error: 'Gmail SMTP configuration incomplete' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { to, subject, html, text, from, templateData }: GmailSendRequest = await req.json();

    if (!to || !subject || (!html && !text)) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: to, subject, and html or text' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Gmail SMTP transporter
    const transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Process template data if provided
    let processedHtml = html;
    let processedText = text;
    let processedSubject = subject;

    if (templateData && html) {
      // Simple template replacement
      for (const [key, value] of Object.entries(templateData)) {
        const placeholder = `{{${key}}}`;
        processedHtml = processedHtml?.replace(new RegExp(placeholder, 'g'), String(value));
        processedText = processedText?.replace(new RegExp(placeholder, 'g'), String(value));
        processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    const mailOptions = {
      from: from || `"Vybbi" <${gmailUser}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: processedSubject,
      html: processedHtml,
      text: processedText,
    };

    console.log('Sending email via Gmail SMTP:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully via Gmail:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return new Response(JSON.stringify({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in gmail-send-email function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send email via Gmail SMTP',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});