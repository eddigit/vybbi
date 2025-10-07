-- Mettre à jour le template email de prospection avec du CSS compatible email
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html lang="fr" style="margin: 0; padding: 0; background-color: #0a0a0a;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vybbi - Detailed Presentation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden; border: 1px solid #333333;">
        <!-- Header -->
        <div style="background-color: #3b82f6; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">🎵 VYBBI EXCLUSIVE</h1>
            <p style="margin: 10px 0 0; color: #e5e5e5; font-size: 16px;">Detailed Platform Overview & Demo</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <!-- English -->
            <div style="margin-bottom: 40px;">
                <h2 style="color: #3b82f6; font-size: 22px; margin: 0 0 20px;">🇬🇧 Exclusive Demo for {{contact_name}}</h2>
                <p style="margin: 0 0 16px; line-height: 1.6; color: #e5e5e5;">
                    Thank you for your interest in Vybbi! We are excited to share an exclusive detailed presentation designed specifically for <strong>{{company_name}}</strong>.
                </p>

                <div style="background-color: #262626; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #404040;">
                    <h3 style="color: #3b82f6; margin: 0 0 12px;">🎯 Key Features for Your Business:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #e5e5e5;">
                        <li style="margin-bottom: 8px;">Advanced artist-venue matching algorithm</li>
                        <li style="margin-bottom: 8px;">Automated booking management system</li>
                        <li style="margin-bottom: 8px;">Commission tracking and payment processing</li>
                        <li style="margin-bottom: 8px;">Professional networking tools</li>
                        <li style="margin-bottom: 8px;">Real-time analytics and reporting</li>
                    </ul>
                </div>
            </div>

            <!-- French -->
            <div>
                <h2 style="color: #8b5cf6; font-size: 22px; margin: 0 0 20px;">🇫🇷 Démo Exclusive pour {{contact_name}}</h2>
                <p style="margin: 0 0 16px; line-height: 1.6; color: #e5e5e5;">
                    Merci pour votre intérêt envers Vybbi ! Nous sommes ravis de partager une présentation détaillée exclusive conçue spécifiquement pour <strong>{{company_name}}</strong>.
                </p>

                <div style="background-color: #262626; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #404040;">
                    <h3 style="color: #8b5cf6; margin: 0 0 12px;">🎯 Fonctionnalités Clés pour Votre Business :</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #e5e5e5;">
                        <li style="margin-bottom: 8px;">Algorithme de matching artiste-lieu avancé</li>
                        <li style="margin-bottom: 8px;">Système de gestion de booking automatisé</li>
                        <li style="margin-bottom: 8px;">Suivi des commissions et traitement des paiements</li>
                        <li style="margin-bottom: 8px;">Outils de networking professionnel</li>
                        <li style="margin-bottom: 8px;">Analytics en temps réel et reporting</li>
                    </ul>
                </div>
            </div>

            <!-- Demo CTA -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://demo.vybbi.com" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    🚀 Access Exclusive Demo | Accéder à la Démo Exclusive
                </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #404040;">
                <p style="margin: 0 0 10px; color: #8b5cf6; font-size: 18px; font-weight: bold;">🎵 VYBBI</p>
                <p style="margin: 0; color: #888888; font-size: 14px;">The Future of Music Industry Networking</p>
                <div style="margin: 20px 0;">
                    <a href="https://vybbi.com" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">🌐 Website</a>
                    <a href="mailto:contact@vybbi.com" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">📧 Contact</a>
                </div>
                <p style="margin: 20px 0 0; color: #666666; font-size: 12px;">
                    This email was sent to {{contact_email}}. If you no longer wish to receive these emails, please contact us.
                </p>
            </div>
        </div>
    </div>
</body>
</html>'
WHERE type = 'prospect_email' AND name = 'Vybbi Exclusive Demo'