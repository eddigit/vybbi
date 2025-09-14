import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface GmailSendRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  templateData?: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced logging function
function logWithTimestamp(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [GMAIL] [${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

serve(async (req) => {
  logWithTimestamp('INFO', '=== GMAIL SEND EMAIL FUNCTION CALLED ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logWithTimestamp('INFO', 'CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Gmail credentials from environment variables
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');

    logWithTimestamp('INFO', 'Environment check', { 
      hasGmailUser: !!gmailUser, 
      hasGmailAppPassword: !!gmailAppPassword 
    });

    if (!gmailUser || !gmailAppPassword) {
      logWithTimestamp('ERROR', 'Gmail credentials not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Gmail credentials not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Parse request body
    const emailData: GmailSendRequest = await req.json();
    
    logWithTimestamp('INFO', 'Email data received', {
      to: emailData.to,
      subject: emailData.subject,
      hasHtml: !!emailData.html,
      hasText: !!emailData.text,
      from: emailData.from,
      cc: emailData.cc,
      bcc: emailData.bcc,
      replyTo: emailData.replyTo
    });
    
    // Validate required fields
    if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text)) {
      logWithTimestamp('ERROR', 'Missing required fields', { 
        hasTo: !!emailData.to, 
        hasSubject: !!emailData.subject, 
        hasHtml: !!emailData.html, 
        hasText: !!emailData.text 
      });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and html or text' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    logWithTimestamp('INFO', 'Preparing to send email via Gmail SMTP');

    // Configure nodemailer transporter for Gmail
    const transporter = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    };

    // Process template data for simple replacements
    let processedHtml = emailData.html;
    let processedText = emailData.text;
    
    if (emailData.templateData && processedHtml) {
      logWithTimestamp('INFO', 'Processing HTML template data', { keys: Object.keys(emailData.templateData) });
      Object.entries(emailData.templateData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedHtml = processedHtml?.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }
    
    if (emailData.templateData && processedText) {
      logWithTimestamp('INFO', 'Processing text template data', { keys: Object.keys(emailData.templateData) });
      Object.entries(emailData.templateData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedText = processedText?.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }

    // Prepare email options
    const mailOptions = {
      from: emailData.from || `"Vybbi" <${gmailUser}>`,
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      replyTo: emailData.replyTo,
      subject: emailData.subject,
      html: processedHtml,
      text: processedText,
    };

    logWithTimestamp('INFO', 'Mail options prepared', { from: mailOptions.from, to: mailOptions.to });

    // Send email using dynamic import of nodemailer
    logWithTimestamp('INFO', 'Importing nodemailer and creating transporter...');
    const { default: nodemailer } = await import('npm:nodemailer@6.9.7');
    const transporterInstance = nodemailer.createTransport(transporter);
    
    logWithTimestamp('INFO', 'Sending email via SMTP...');
    const info = await transporterInstance.sendMail(mailOptions);
    
    logWithTimestamp('SUCCESS', '✅ EMAIL SENT SUCCESSFULLY VIA GMAIL', {
      messageId: info.messageId,
      to: emailData.to,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: info.messageId,
        to: emailData.to,
        accepted: info.accepted
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    logWithTimestamp('ERROR', '❌ CRITICAL ERROR in Gmail send', { 
      error: error.message, 
      stack: error.stack,
      name: error.name 
    });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        message: error.message,
        type: error.name
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});