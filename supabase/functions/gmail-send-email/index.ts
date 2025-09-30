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
  console.log(`[${timestamp}] [EMAIL] [${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

serve(async (req) => {
  logWithTimestamp('INFO', '=== EMAIL SEND FUNCTION CALLED ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logWithTimestamp('INFO', 'CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      logWithTimestamp('ERROR', 'RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
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

    logWithTimestamp('INFO', 'Preparing to send email via Resend API');

    // Prepare email payload
    const payload: any = {
      from: emailData.from || "Vybbi <onboarding@resend.dev>",
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      subject: emailData.subject,
    };

    if (emailData.cc) {
      payload.cc = Array.isArray(emailData.cc) ? emailData.cc : [emailData.cc];
    }
    if (emailData.bcc) {
      payload.bcc = Array.isArray(emailData.bcc) ? emailData.bcc : [emailData.bcc];
    }
    if (emailData.replyTo) {
      payload.reply_to = emailData.replyTo;
    }
    if (processedHtml) {
      payload.html = processedHtml;
    }
    if (processedText) {
      payload.text = processedText;
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      logWithTimestamp('ERROR', 'Failed to send email via Resend', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          message: responseData.message || 'Unknown error'
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }
    
    logWithTimestamp('SUCCESS', '✅ EMAIL SENT SUCCESSFULLY', {
      to: emailData.to,
      id: responseData.id
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        to: emailData.to,
        emailId: responseData.id
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    logWithTimestamp('ERROR', '❌ CRITICAL ERROR in email send', { 
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
