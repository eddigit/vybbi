import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 Send test email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const toEmail = url.searchParams.get("to");

    if (!toEmail) {
      throw new Error("Missing 'to' query parameter");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      throw new Error("Invalid email format");
    }

    console.log("📧 Sending test email to:", toEmail);

    // Brevo API configuration
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const fromEmail = Deno.env.get("MAIL_FROM_EMAIL") || "info@vybbi.app";
    const fromName = Deno.env.get("MAIL_FROM_NAME") || "Vybbi";

    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Prepare email data for Brevo API
    const emailData = {
      sender: {
        name: fromName,
        email: fromEmail
      },
      to: [
        {
          email: toEmail,
          name: "Test User"
        }
      ],
      subject: "Test Brevo depuis Vybbi",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Test Vybbi</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email de test via Brevo API</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h1>Test OK</h1>
            <p>Email envoyé via Brevo API avec succès !</p>
            <p style="margin-top: 20px; color: #666;">
              Cet email de test confirme que l'intégration Brevo fonctionne correctement.
            </p>
            <p style="margin-top: 30px; font-size: 12px; color: #999;">
              Envoyé le ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      `,
      textContent: "Test OK - Email envoyé via Brevo API."
    };

    // Send email via Brevo API
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

    const responseData = await brevoResponse.json();
    console.log("✅ Email sent successfully via Brevo:", responseData);

    return new Response(JSON.stringify({ 
      status: "ok",
      messageId: responseData.messageId,
      message: `Test email sent successfully to ${toEmail}`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error in send-test-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: error.message
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