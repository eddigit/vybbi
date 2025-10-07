-- Create missing email templates for booking system
INSERT INTO public.email_templates (name, type, subject, html_content, variables, is_active) VALUES
(
  'Demande de booking reçue',
  'booking_proposed',
  'Nouvelle demande de booking pour {{eventTitle}}',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nouvelle demande de booking</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Nouvelle demande de booking</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 25px;">Bonjour <strong>{{venueName}}</strong>,</p>
        
        <p>Vous avez reçu une nouvelle demande de booking :</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Détails de l''événement</h3>
            <p><strong>Titre :</strong> {{eventTitle}}</p>
            <p><strong>Date :</strong> {{eventDate}}</p>
            <p><strong>Artiste :</strong> {{artistName}}</p>
            <p><strong>Cachet proposé :</strong> {{proposedFee}}€</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Message de l''artiste</h3>
            <p style="font-style: italic;">{{message}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Gérer cette demande</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; text-align: center;">
            Cet email a été envoyé automatiquement par Vybbi.<br>
            <a href="{{unsubscribeUrl}}" style="color: #667eea;">Se désabonner</a>
        </p>
    </div>
</body>
</html>',
  '["venueName", "eventTitle", "eventDate", "artistName", "proposedFee", "message", "dashboardUrl", "unsubscribeUrl"]'::jsonb,
  true
),
(
  'Statut de booking modifié',
  'booking_status_changed',
  'Mise à jour de votre demande de booking : {{eventTitle}}',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Statut de booking modifié</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Mise à jour de booking</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 25px;">Bonjour <strong>{{artistName}}</strong>,</p>
        
        <p>Le statut de votre demande de booking a été mis à jour :</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Détails de l''événement</h3>
            <p><strong>Titre :</strong> {{eventTitle}}</p>
            <p><strong>Date :</strong> {{eventDate}}</p>
            <p><strong>Venue :</strong> {{venueName}}</p>
            <p><strong>Nouveau statut :</strong> <span style="background: {{statusColor}}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">{{status}}</span></p>
        </div>
        
        {{#if message}}
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Message de la venue</h3>
            <p style="font-style: italic;">{{message}}</p>
        </div>
        {{/if}}
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Voir mes bookings</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; text-align: center;">
            Cet email a été envoyé automatiquement par Vybbi.<br>
            <a href="{{unsubscribeUrl}}" style="color: #667eea;">Se désabonner</a>
        </p>
    </div>
</body>
</html>',
  '["artistName", "eventTitle", "eventDate", "venueName", "status", "statusColor", "message", "dashboardUrl", "unsubscribeUrl"]'::jsonb,
  true
),
(
  'Nouveau message reçu',
  'message_received',
  'Nouveau message de {{senderName}}',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nouveau message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Nouveau message</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 25px;">Bonjour <strong>{{recipientName}}</strong>,</p>
        
        <p>Vous avez reçu un nouveau message de <strong>{{senderName}}</strong> :</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="font-style: italic; margin: 0;">{{message}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{messageUrl}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Répondre au message</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; text-align: center;">
            Cet email a été envoyé automatiquement par Vybbi.<br>
            <a href="{{unsubscribeUrl}}" style="color: #667eea;">Se désabonner</a>
        </p>
    </div>
</body>
</html>',
  '["recipientName", "senderName", "message", "messageUrl", "unsubscribeUrl"]'::jsonb,
  true
),
(
  'Suivi de prospection',
  'prospect_follow_up',
  'Suite à votre inscription sur Vybbi',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Suite à votre inscription</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue sur Vybbi !</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 25px;">Bonjour <strong>{{userName}}</strong>,</p>
        
        <p>Comment allez-vous depuis votre inscription ? Nous espérons que vous avez pu explorer notre plateforme.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Nos conseils pour bien démarrer :</h3>
            <ul style="padding-left: 20px;">
                <li>Complétez votre profil à 100%</li>
                <li>Ajoutez vos médias (photos, musiques, vidéos)</li>
                <li>Explorez les opportunités disponibles</li>
                <li>Connectez-vous avec d''autres professionnels</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{profileUrl}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Compléter mon profil</a>
        </div>
        
        <p>Besoin d''aide ? N''hésitez pas à nous contacter !</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; text-align: center;">
            Cet email a été envoyé automatiquement par Vybbi.<br>
            <a href="{{unsubscribeUrl}}" style="color: #667eea;">Se désabonner</a>
        </p>
    </div>
</body>
</html>',
  '["userName", "profileUrl", "unsubscribeUrl"]'::jsonb,
  true
);

-- Update email service types
UPDATE public.email_templates SET type = 'booking_proposed' WHERE type = 'booking_proposed';
UPDATE public.email_templates SET type = 'booking_status_changed' WHERE type = 'booking_status_changed';
UPDATE public.email_templates SET type = 'message_received' WHERE type = 'message_received';
UPDATE public.email_templates SET type = 'prospect_follow_up' WHERE type = 'prospect_follow_up';