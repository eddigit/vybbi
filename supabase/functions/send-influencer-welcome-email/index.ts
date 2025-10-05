import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  displayName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName }: WelcomeEmailRequest = await req.json();

    const baseUrl = Deno.env.get("SITE_URL") || "https://vybbi.app";
    const dashboardUrl = `${baseUrl}/affiliation`;

    const emailResponse = await resend.emails.send({
      from: "Vybbi <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Bienvenue dans le programme d'affiliation Vybbi !",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                color: #8B5CF6;
                margin-bottom: 10px;
              }
              h1 {
                color: #1a1a1a;
                font-size: 28px;
                margin-bottom: 10px;
              }
              .highlight {
                background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                text-align: center;
              }
              .highlight h2 {
                margin: 0 0 10px 0;
                font-size: 24px;
              }
              .highlight p {
                margin: 0;
                font-size: 18px;
                opacity: 0.9;
              }
              .steps {
                margin: 30px 0;
              }
              .step {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 15px;
                border-left: 4px solid #8B5CF6;
              }
              .step h3 {
                margin: 0 0 10px 0;
                color: #8B5CF6;
                font-size: 18px;
              }
              .step p {
                margin: 0;
                color: #666;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%);
                color: white;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 18px;
                margin: 20px 0;
                text-align: center;
              }
              .stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 30px 0;
              }
              .stat-card {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
              }
              .stat-card .number {
                font-size: 32px;
                font-weight: bold;
                color: #8B5CF6;
                display: block;
              }
              .stat-card .label {
                color: #666;
                font-size: 14px;
              }
              .faq {
                margin: 30px 0;
              }
              .faq-item {
                margin-bottom: 20px;
              }
              .faq-item h4 {
                color: #1a1a1a;
                margin: 0 0 5px 0;
              }
              .faq-item p {
                color: #666;
                margin: 0;
              }
              .footer {
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
                text-align: center;
                color: #999;
                font-size: 14px;
              }
              @media (max-width: 600px) {
                .stats {
                  grid-template-columns: 1fr;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">VYBBI</div>
                <h1>🎉 Bienvenue ${displayName} !</h1>
                <p style="color: #666; font-size: 18px;">
                  Vous êtes maintenant membre du programme d'affiliation Vybbi
                </p>
              </div>

              <div class="highlight">
                <h2>💰 Vos gains potentiels</h2>
                <p><strong>2€ par abonnement payant souscrit + 0,50€/mois récurrents*</strong></p>
              </div>

              <p style="font-size: 16px; color: #333;">
                Félicitations pour avoir rejoint notre programme exclusif ! Vous allez pouvoir gagner 
                des revenus en recommandant Vybbi à votre communauté. Attention : seuls les abonnements payants 
                souscrits via votre lien génèrent des commissions.
              </p>

              <div class="steps">
                <h2 style="text-align: center; color: #1a1a1a;">🚀 Prochaines étapes</h2>
                
                <div class="step">
                  <h3>1. Créez votre premier lien</h3>
                  <p>
                    Connectez-vous à votre dashboard et générez un lien d'affiliation unique. 
                    Vous pouvez créer plusieurs liens pour tracker différentes sources.
                  </p>
                </div>

                <div class="step">
                  <h3>2. Partagez sur vos réseaux</h3>
                  <p>
                    Ajoutez votre lien dans votre bio Instagram/TikTok, descriptions YouTube, 
                    newsletters, ou stories. Plus vous partagez, plus vous gagnez !
                  </p>
                </div>

                <div class="step">
                  <h3>3. Suivez vos performances</h3>
                  <p>
                    Consultez vos stats en temps réel : clics, conversions, commissions. 
                    Paiements automatiques dès 50€ de commissions.
                  </p>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="cta-button">
                  Accéder à mon dashboard 🎯
                </a>
              </div>

              <div class="stats">
                <div class="stat-card">
                  <span class="number">2€</span>
                  <span class="label">Par abonnement payant souscrit</span>
                </div>
                <div class="stat-card">
                  <span class="number">0,50€</span>
                  <span class="label">Par mois récurrent (abonnement payant)</span>
                </div>
              </div>

              <div class="faq">
                <h2 style="text-align: center; color: #1a1a1a;">❓ FAQ</h2>
                
                <div class="faq-item">
                  <h4>Quand suis-je payé ?</h4>
                  <p>Paiements mensuels automatiques dès que vous atteignez 50€ de commissions sur abonnements payants.</p>
                </div>

                <div class="faq-item">
                  <h4>Comment tracker mes performances ?</h4>
                  <p>Votre dashboard affiche en temps réel tous vos clics, conversions et gains.</p>
                </div>

                <div class="faq-item">
                  <h4>Puis-je créer plusieurs liens ?</h4>
                  <p>Oui ! Créez un lien par canal (Instagram, YouTube, etc.) pour mieux tracker.</p>
                </div>

                <div class="faq-item">
                  <h4>Y a-t-il une limite de gains ?</h4>
                  <p>Non, vos revenus sont illimités. Plus vous parrainez, plus vous gagnez !</p>
                </div>

                <div class="faq-item">
                  <h4>Combien de temps durent les commissions récurrentes ?</h4>
                  <p>Tant que l'utilisateur reste sur un abonnement payant Vybbi, vous continuez à gagner 0,50€/mois.</p>
                </div>
              </div>

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
                <p style="margin: 0; color: #0c4a6e;">
                  <strong>💡 Astuce :</strong> Nos meilleurs influenceurs gagnent en moyenne <strong>7000€/an</strong> 
                  en partageant régulièrement Vybbi sur leurs réseaux sociaux et newsletters.
                </p>
              </div>

              <div class="footer">
                <p>
                  <strong>Vybbi</strong> - La plateforme qui connecte artistes et professionnels<br>
                  <a href="${baseUrl}/conditions" style="color: #8B5CF6; text-decoration: none;">Conditions du programme</a> • 
                  <a href="${baseUrl}/contact" style="color: #8B5CF6; text-decoration: none;">Support</a>
                </p>
                <p style="margin-top: 15px; font-size: 12px;">
                  *Détails des commissions : 2€ par abonnement payant souscrit + 0,50€/mois tant que l'utilisateur reste sur un abonnement payant Vybbi.
                  Paiements mensuels automatiques via virement bancaire dès 50€ de commissions cumulées. 
                  <strong>Important : Les inscriptions gratuites ne génèrent pas de commission.</strong>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email envoyé avec succès:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
