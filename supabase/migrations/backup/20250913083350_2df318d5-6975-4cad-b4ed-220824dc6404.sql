-- Create professional prospecting email templates
INSERT INTO public.email_templates (name, subject, body, template_type, target_type, variables) VALUES 
(
  'Premier Contact Professionnel',
  'Introduction to Vybbi - Your Music Industry Partner | Présentation de Vybbi - Votre Partenaire Musical',
  '<!DOCTYPE html>
<html lang="fr" style="margin: 0; padding: 0; background-color: hsl(222.2 84% 4.9%);">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vybbi - Introduction</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: hsl(222.2 84% 4.9%); color: hsl(210 40% 98%);">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, hsl(222.2 84% 4.9%), hsl(217.2 32.6% 17.5%)); border-radius: 12px; overflow: hidden; border: 1px solid hsl(217.2 32.6% 17.5%);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(262.1 83.3% 57.8%)); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎵 VYBBI</h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">The Future of Music Industry Networking</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <!-- English Version -->
            <div style="margin-bottom: 40px;">
                <h2 style="color: hsl(221.2 83.2% 53.3%); font-size: 22px; margin: 0 0 20px; border-bottom: 2px solid hsl(221.2 83.2% 53.3%); padding-bottom: 10px;">🇬🇧 Hello {{contact_name}}</h2>
                
                <p style="margin: 0 0 16px; line-height: 1.6; color: hsl(210 40% 98%);">
                    We hope this message finds you well. We''re reaching out to introduce <strong style="color: hsl(221.2 83.2% 53.3%);">Vybbi</strong>, the revolutionary platform that''s transforming how music industry professionals connect and collaborate.
                </p>

                <div style="background: hsl(217.2 32.6% 17.5%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid hsl(221.2 83.2% 53.3%);">
                    <h3 style="color: hsl(221.2 83.2% 53.3%); margin: 0 0 12px; font-size: 18px;">🚀 What makes Vybbi unique?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: hsl(210 40% 98%);">
                        <li style="margin-bottom: 8px;">Advanced AI matching between artists, venues, and industry professionals</li>
                        <li style="margin-bottom: 8px;">Integrated booking and commission management system</li>
                        <li style="margin-bottom: 8px;">Real-time messaging and collaboration tools</li>
                        <li style="margin-bottom: 8px;">Professional networking with verified industry contacts</li>
                    </ul>
                </div>

                <p style="margin: 16px 0; line-height: 1.6; color: hsl(210 40% 98%);">
                    We believe your expertise in <strong>{{company_name}}</strong> would be valuable to our growing community of music professionals.
                </p>
            </div>

            <!-- French Version -->
            <div>
                <h2 style="color: hsl(262.1 83.3% 57.8%); font-size: 22px; margin: 0 0 20px; border-bottom: 2px solid hsl(262.1 83.3% 57.8%); padding-bottom: 10px;">🇫🇷 Bonjour {{contact_name}}</h2>
                
                <p style="margin: 0 0 16px; line-height: 1.6; color: hsl(210 40% 98%);">
                    Nous espérons que ce message vous trouve en bonne santé. Nous vous contactons pour vous présenter <strong style="color: hsl(262.1 83.3% 57.8%);">Vybbi</strong>, la plateforme révolutionnaire qui transforme la façon dont les professionnels de l''industrie musicale se connectent et collaborent.
                </p>

                <div style="background: hsl(217.2 32.6% 17.5%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid hsl(262.1 83.3% 57.8%);">
                    <h3 style="color: hsl(262.1 83.3% 57.8%); margin: 0 0 12px; font-size: 18px;">🚀 Ce qui rend Vybbi unique ?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: hsl(210 40% 98%);">
                        <li style="margin-bottom: 8px;">Matching IA avancé entre artistes, lieux et professionnels</li>
                        <li style="margin-bottom: 8px;">Système intégré de booking et gestion des commissions</li>
                        <li style="margin-bottom: 8px;">Messagerie et outils de collaboration en temps réel</li>
                        <li style="margin-bottom: 8px;">Réseau professionnel avec contacts vérifiés de l''industrie</li>
                    </ul>
                </div>

                <p style="margin: 16px 0; line-height: 1.6; color: hsl(210 40% 98%);">
                    Nous pensons que votre expertise chez <strong>{{company_name}}</strong> serait précieuse pour notre communauté croissante de professionnels de la musique.
                </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://vybbi.com" style="display: inline-block; background: linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(262.1 83.3% 57.8%)); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: transform 0.2s;">
                    🎯 Discover Vybbi Platform | Découvrir la Plateforme Vybbi
                </a>
            </div>

            <!-- Signature -->
            <div style="border-top: 1px solid hsl(217.2 32.6% 17.5%); padding-top: 30px; margin-top: 40px;">
                <p style="margin: 0 0 8px; color: hsl(210 40% 98%); font-weight: bold;">Best regards | Cordialement,</p>
                <p style="margin: 0 0 4px; color: hsl(221.2 83.2% 53.3%); font-weight: bold;">The Vybbi Team</p>
                <p style="margin: 0; color: hsl(210 40% 50%); font-size: 14px;">Building the future of music industry networking</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: hsl(217.2 32.6% 17.5%); padding: 20px 30px; text-align: center; border-top: 1px solid hsl(214.3 31.8% 91.4%);">
            <p style="margin: 0; color: hsl(210 40% 50%); font-size: 12px;">
                © 2024 Vybbi. Professional music industry platform.
            </p>
        </div>
    </div>
</body>
</html>',
  'prospect',
  'prospect',
  '["contact_name", "company_name", "prospect_type"]'
),
(
  'Relance Prospect Qualifié',
  'Following up on Vybbi - Let''s Connect | Suivi Vybbi - Connectons-nous',
  '<!DOCTYPE html>
<html lang="fr" style="margin: 0; padding: 0; background-color: hsl(222.2 84% 4.9%);">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vybbi - Follow Up</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: hsl(222.2 84% 4.9%); color: hsl(210 40% 98%);">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, hsl(222.2 84% 4.9%), hsl(217.2 32.6% 17.5%)); border-radius: 12px; overflow: hidden; border: 1px solid hsl(217.2 32.6% 17.5%);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(262.1 83.3% 57.8%), hsl(221.2 83.2% 53.3%)); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">🎵 VYBBI</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Following up on our collaboration opportunity</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <!-- English -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: hsl(221.2 83.2% 53.3%); font-size: 20px; margin: 0 0 16px;">🇬🇧 Hi {{contact_name}}</h2>
                <p style="margin: 0 0 16px; line-height: 1.6;">
                    I hope you''ve had a chance to review our previous message about Vybbi. We''re excited about the potential collaboration with <strong>{{company_name}}</strong>.
                </p>
                <p style="margin: 0 0 16px; line-height: 1.6;">
                    Would you be available for a brief 15-minute call this week to discuss how Vybbi could benefit your operations?
                </p>
            </div>

            <!-- French -->
            <div>
                <h2 style="color: hsl(262.1 83.3% 57.8%); font-size: 20px; margin: 0 0 16px;">🇫🇷 Bonjour {{contact_name}}</h2>
                <p style="margin: 0 0 16px; line-height: 1.6;">
                    J''espère que vous avez eu l''occasion d''examiner notre message précédent concernant Vybbi. Nous sommes enthousiastes à l''idée d''une collaboration potentielle avec <strong>{{company_name}}</strong>.
                </p>
                <p style="margin: 0 0 16px; line-height: 1.6;">
                    Seriez-vous disponible pour un bref appel de 15 minutes cette semaine pour discuter de la façon dont Vybbi pourrait bénéficier à vos opérations ?
                </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://calendly.com/vybbi" style="display: inline-block; background: linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(262.1 83.3% 57.8%)); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                    📅 Schedule a Call | Planifier un Appel
                </a>
            </div>
        </div>
    </div>
</body>
</html>',
  'prospect',
  'prospect',
  '["contact_name", "company_name", "prospect_type"]'
),
(
  'Présentation Détaillée Vybbi',
  'Vybbi Platform Deep Dive - Exclusive Demo | Présentation Approfondie Vybbi - Démo Exclusive',
  '<!DOCTYPE html>
<html lang="fr" style="margin: 0; padding: 0; background-color: hsl(222.2 84% 4.9%);">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vybbi - Detailed Presentation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: hsl(222.2 84% 4.9%); color: hsl(210 40% 98%);">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, hsl(222.2 84% 4.9%), hsl(217.2 32.6% 17.5%)); border-radius: 12px; overflow: hidden; border: 1px solid hsl(217.2 32.6% 17.5%);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(262.1 83.3% 57.8%)); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">🎵 VYBBI EXCLUSIVE</h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Detailed Platform Overview & Demo</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <!-- English -->
            <div style="margin-bottom: 40px;">
                <h2 style="color: hsl(221.2 83.2% 53.3%); font-size: 22px; margin: 0 0 20px;">🇬🇧 Exclusive Demo for {{contact_name}}</h2>
                <p style="margin: 0 0 16px; line-height: 1.6;">
                    Thank you for your interest in Vybbi! We''re excited to share an exclusive detailed presentation designed specifically for <strong>{{company_name}}</strong>.
                </p>

                <div style="background: hsl(217.2 32.6% 17.5%); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: hsl(221.2 83.2% 53.3%); margin: 0 0 12px;">🎯 Key Features for Your Business:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
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
                <h2 style="color: hsl(262.1 83.3% 57.8%); font-size: 22px; margin: 0 0 20px;">🇫🇷 Démo Exclusive pour {{contact_name}}</h2>
                <p style="margin: 0 0 16px; line-height: 1.6;">
                    Merci pour votre intérêt envers Vybbi ! Nous sommes ravis de partager une présentation détaillée exclusive conçue spécifiquement pour <strong>{{company_name}}</strong>.
                </p>

                <div style="background: hsl(217.2 32.6% 17.5%); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: hsl(262.1 83.3% 57.8%); margin: 0 0 12px;">🎯 Fonctionnalités Clés pour Votre Business :</h3>
                    <ul style="margin: 0; padding-left: 20px;">
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
                <a href="https://demo.vybbi.com" style="display: inline-block; background: linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(262.1 83.3% 57.8%)); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                    🚀 Access Exclusive Demo | Accéder à la Démo Exclusive
                </a>
            </div>
        </div>
    </div>
</body>
</html>',
  'prospect',
  'prospect',
  '["contact_name", "company_name", "prospect_type"]'
);