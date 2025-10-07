INSERT INTO public.email_templates (name, type, subject, html_content, variables) VALUES
('Inscription utilisateur', 'user_registration', 'Bienvenue sur Vybbi - Votre inscription est confirmée !', 
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Vybbi</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
    <div style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); padding: 40px; text-align: center;">
      <img src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 12px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Bienvenue sur Vybbi !</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #e5e5e5;">
        Bonjour <strong style="color: #8B5CF6;">{{userName}}</strong>,
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; color: #e5e5e5;">
        Votre inscription en tant que <strong style="color: #3B82F6;">{{profileType}}</strong> a été confirmée avec succès ! Vous faites maintenant partie de la communauté Vybbi.
      </p>
      <div style="background-color: #262626; padding: 30px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #8B5CF6;">
        <h3 style="color: #8B5CF6; margin-top: 0; font-size: 18px;">Prochaines étapes :</h3>
        <ul style="color: #e5e5e5; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Complétez votre profil pour une meilleure visibilité</li>
          <li>Explorez les opportunités disponibles</li>
          <li>Connectez-vous avec d autres professionnels</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://vybbi.com/dashboard" style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.2s;">
          Accéder à mon profil
        </a>
      </div>
      <p style="font-size: 14px; color: #a1a1aa; text-align: center; margin-top: 40px;">
        L équipe Vybbi<br>
        <a href="mailto:hello@vybbi.com" style="color: #8B5CF6;">hello@vybbi.com</a>
      </p>
    </div>
  </div>
</body>
</html>', 
'{"userName": "string", "userEmail": "string", "profileType": "string"}'),

('Notification administrateur', 'admin_notification', 'Nouvelle inscription sur Vybbi',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle inscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #F59E0B, #DC2626); padding: 30px; text-align: center;">
      <img src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi Logo" style="width: 60px; height: 60px; margin-bottom: 15px; border-radius: 8px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Notification Admin</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #F59E0B; margin-top: 0;">Nouvelle inscription</h2>
      <div style="background-color: #262626; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0; color: #e5e5e5;"><strong>Nom :</strong> {{userName}}</p>
        <p style="margin: 10px 0; color: #e5e5e5;"><strong>Email :</strong> {{userEmail}}</p>
        <p style="margin: 10px 0; color: #e5e5e5;"><strong>Type de profil :</strong> {{profileType}}</p>
      </div>
      <p style="font-size: 14px; color: #a1a1aa; text-align: center; margin-top: 30px;">
        Tableau de bord administrateur Vybbi
      </p>
    </div>
  </div>
</body>
</html>',
'{"userName": "string", "userEmail": "string", "profileType": "string"}'),

('Notification d avis', 'review_notification', 'Nouvel avis reçu sur votre profil Vybbi',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvel avis</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
      <img src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi Logo" style="width: 60px; height: 60px; margin-bottom: 15px; border-radius: 8px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Nouvel Avis !</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 16px; margin-bottom: 20px; color: #e5e5e5;">
        Bonjour <strong style="color: #10B981;">{{artistName}}</strong>,
      </p>
      <p style="font-size: 16px; margin-bottom: 30px; color: #e5e5e5;">
        Vous avez reçu un nouvel avis de <strong>{{reviewerName}}</strong> avec une note de <strong style="color: #F59E0B;">{{rating}}/5 étoiles</strong> !
      </p>
      <div style="background-color: #262626; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
        <p style="font-style: italic; color: #e5e5e5; margin: 0;">
          "{{message}}"
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://vybbi.com/profile/{{artistId}}" style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; font-weight: bold; display: inline-block;">
          Voir mon profil
        </a>
      </div>
    </div>
  </div>
</body>
</html>',
'{"artistName": "string", "artistId": "string", "reviewerName": "string", "rating": "number", "message": "string"}'),

('Message de contact', 'contact_message', 'Nouveau message via Vybbi',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 30px; text-align: center;">
      <img src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi Logo" style="width: 60px; height: 60px; margin-bottom: 15px; border-radius: 8px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Nouveau Message</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 16px; margin-bottom: 20px; color: #e5e5e5;">
        Vous avez reçu un nouveau message de <strong style="color: #3B82F6;">{{senderName}}</strong>
      </p>
      <div style="background-color: #262626; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #e5e5e5; line-height: 1.6;">{{message}}</p>
      </div>
      <p style="font-size: 14px; color: #a1a1aa; margin: 20px 0;">
        <strong>Email de contact :</strong> {{senderEmail}}
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:{{senderEmail}}" style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; font-weight: bold; display: inline-block;">
          Répondre
        </a>
      </div>
    </div>
  </div>
</body>
</html>',
'{"senderName": "string", "senderEmail": "string", "message": "string"}')

ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = now();