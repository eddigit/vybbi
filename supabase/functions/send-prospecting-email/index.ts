import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Configuration Brevo API
const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const fromEmail = Deno.env.get("MAIL_FROM_EMAIL") || "info@vybbi.app";
const fromName = Deno.env.get("MAIL_FROM_NAME") || "Vybbi";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProspectingEmailRequest {
  to: string;
  subject: string;
  content: string;
  prospectId: string;
  agentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 Send prospecting email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, prospectId, agentId }: ProspectingEmailRequest = await req.json();

    console.log("📧 Sending email to:", to);
    console.log("📝 Subject:", subject);

    if (!to || !subject || !content) {
      throw new Error("Missing required fields: to, subject, or content");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email format");
    }

    // Send email via Brevo
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const emailData = {
      sender: {
        name: `${fromName} - Prospection`,
        email: fromEmail
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Vybbi</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">La plateforme de l'industrie musicale</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-top: none;">
            ${content.split('\n').map(line => {
              if (line.trim() === '') return '<br>';
              if (line.includes('✨') || line.includes('🎯') || line.includes('📈') || line.includes('💼') || line.includes('🏛️') || line.includes('⚡') || line.includes('💡') || line.includes('📊') || line.includes('🔔') || line.includes('📈') || line.includes('🎉') || line.includes('🌟')) {
                return `<p style="margin: 10px 0; font-size: 16px;">${line}</p>`;
              }
              return `<p style="margin: 15px 0; font-size: 16px; line-height: 1.6; color: #333;">${line}</p>`;
            }).join('')}
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #6c757d;">
              Cet email vous a été envoyé par Vybbi dans le cadre de notre prospection commerciale.<br>
              <a href="https://vybbi.com" style="color: #667eea; text-decoration: none;">www.vybbi.com</a>
            </p>
          </div>
        </div>
      `,
      textContent: content
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

    console.log("✅ Email sent successfully:", emailResponse);

    // Log the successful send
    console.log("📝 Logging email interaction for prospect:", prospectId);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.messageId,
      prospectId,
      agentId 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error in send-prospecting-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
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