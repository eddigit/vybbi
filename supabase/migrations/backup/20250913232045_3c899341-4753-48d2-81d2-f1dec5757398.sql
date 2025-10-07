-- Créer des templates de base dans la DB basés sur le design Gmail actuel

-- Template d'inscription utilisateur
INSERT INTO public.email_templates (
  name,
  subject,
  html_content,
  type,
  category,
  language,
  provider,
  required_variables,
  is_active
) VALUES (
  'Bienvenue sur Vybbi',
  'Bienvenue sur Vybbi, {{userName}} !',
  '
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Bienvenue sur Vybbi !</h1>
      </div>
      
      <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
        <h2 style="color: #ffffff; margin-bottom: 20px;">Félicitations {{userName}} !</h2>
        
        <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
          Votre compte Vybbi a été créé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.
        </p>
        
        <div style="text-align: center; margin: 25px 0;">
           <a href="{{dashboardUrl}}" 
             style="background-color: #3b82f6; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Accéder à mon compte
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; text-align: center;">
          <p style="color: #888888; font-size: 14px; margin: 0;">
            Besoin d''aide ? Contactez-nous à <a href="mailto:support@vybbi.com" style="color: #3b82f6;">support@vybbi.com</a>
          </p>
        </div>
      </div>
    </div>
  ',
  'user_registration',
  'notifications',
  'fr',
  'internal',
  '["userName", "dashboardUrl"]'::jsonb,
  true
),

-- Template notification admin  
(
  'Nouvelle inscription admin',
  'Nouvelle inscription : {{userName}} ({{profileType}})',
  '
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle inscription sur Vybbi</h1>
      </div>
      
      <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
        <h2 style="color: #ffffff; margin-bottom: 20px;">Nouvel utilisateur inscrit</h2>
        
        <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
          <p style="color: #e5e5e5;"><strong>Nom:</strong> {{userName}}</p>
          <p style="color: #e5e5e5;"><strong>Email:</strong> {{userEmail}}</p>
          <p style="color: #e5e5e5;"><strong>Type de profil:</strong> {{profileType}}</p>
          <p style="color: #e5e5e5;"><strong>Date d''inscription:</strong> {{registrationDate}}</p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
           <a href="{{adminUrl}}" 
             style="background-color: #3b82f6; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Voir les utilisateurs
          </a>
        </div>
      </div>
    </div>
  ',
  'admin_notification',
  'notifications', 
  'fr',
  'internal',
  '["userName", "userEmail", "profileType", "registrationDate", "adminUrl"]'::jsonb,
  true
),

-- Template notification review
(
  'Notification review',
  'Nouvelle review reçue de {{reviewerName}}',
  '
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle review reçue !</h1>
      </div>
      
      <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
        <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour {{artistName}},</h2>
        
        <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
          Vous avez reçu une nouvelle review de la part de <strong>{{reviewerName}}</strong> :
        </p>
        
        <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
          <p style="color: #e5e5e5;"><strong>Note:</strong> {{rating}}/5 ⭐</p>
          <p style="color: #e5e5e5;"><strong>Commentaire:</strong></p>
          <p style="color: #e5e5e5; font-style: italic;">"{{message}}"</p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
           <a href="{{profileUrl}}" 
             style="background-color: #3b82f6; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Voir mes reviews
          </a>
        </div>
      </div>
    </div>
  ',
  'review_notification',
  'artistes',
  'fr', 
  'internal',
  '["artistName", "reviewerName", "rating", "message", "profileUrl"]'::jsonb,
  true
),

-- Template demande de booking
(
  'Demande de booking',
  'Nouvelle demande de booking de {{artistName}}',
  '
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle demande de booking !</h1>
      </div>
      
      <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
        <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour,</h2>
        
        <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
          L''artiste <strong>{{artistName}}</strong> souhaite être booké pour votre événement :
        </p>
        
        <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
          <p style="color: #e5e5e5;"><strong>Événement:</strong> {{eventTitle}}</p>
          <p style="color: #e5e5e5;"><strong>Date:</strong> {{eventDate}}</p>
          <p style="color: #e5e5e5;"><strong>Cachet proposé:</strong> {{proposedFee}}€</p>
          <p style="color: #e5e5e5;"><strong>Message:</strong></p>
          <p style="color: #e5e5e5;">{{message}}</p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
           <a href="{{dashboardUrl}}" 
             style="background-color: #3b82f6; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Gérer les demandes
          </a>
        </div>
      </div>
    </div>
  ',
  'booking_proposed',
  'lieux',
  'fr',
  'internal', 
  '["artistName", "eventTitle", "eventDate", "proposedFee", "message", "dashboardUrl"]'::jsonb,
  true
),

-- Template changement statut booking
(
  'Statut booking modifié',
  'Votre demande de booking a été {{status}}',
  '
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Mise à jour de votre demande</h1>
      </div>
      
      <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
        <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour {{artistName}},</h2>
        
        <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
          Votre demande de booking pour l''événement <strong>{{eventTitle}}</strong> a été <strong style="color: {{statusColor}};">{{status}}</strong>.
        </p>
        
        <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
          <p style="color: #e5e5e5;"><strong>Lieu:</strong> {{venueName}}</p>
          <p style="color: #e5e5e5;"><strong>Date:</strong> {{eventDate}}</p>
          <p style="color: #e5e5e5;"><strong>Statut:</strong> <span style="color: {{statusColor}};">{{status}}</span></p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
           <a href="{{dashboardUrl}}" 
             style="background-color: #3b82f6; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Voir mes bookings
          </a>
        </div>
      </div>
    </div>
  ',
  'booking_status_changed',
  'artistes',
  'fr',
  'internal',
  '["artistName", "eventTitle", "venueName", "eventDate", "status", "statusColor", "dashboardUrl"]'::jsonb,
  true
),

-- Template nouveau message  
(
  'Nouveau message reçu',
  'Nouveau message de {{senderName}}',
  '
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="background-color: #3b82f6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nouveau message reçu !</h1>
      </div>
      
      <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
        <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour {{recipientName}},</h2>
        
        <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
          Vous avez reçu un nouveau message de la part de <strong>{{senderName}}</strong> :
        </p>
        
        <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
          <p style="color: #e5e5e5; font-style: italic;">"{{message}}"</p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
           <a href="{{messageUrl}}" 
             style="background-color: #3b82f6; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Répondre au message
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; text-align: center;">
          <p style="color: #888888; font-size: 12px; margin: 0;">
            <a href="{{unsubscribeUrl}}" style="color: #888888;">Se désabonner des notifications</a>
          </p>
        </div>
      </div>
    </div>
  ',
  'message_received',
  'notifications',
  'fr',
  'internal',
  '["recipientName", "senderName", "message", "messageUrl", "unsubscribeUrl"]'::jsonb,
  true
),

-- Template suivi prospection
(
  'Suivi prospection',
  'Complétez votre profil Vybbi pour maximiser vos opportunités',
  '
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="background-color: #8b5cf6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎵 Maximisez votre potentiel sur Vybbi</h1>
      </div>
      
      <div style="background: #171717; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
        <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour {{userName}},</h2>
        
        <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
          Votre profil Vybbi a un potentiel énorme ! Quelques améliorations vous aideront à attirer plus d''opportunités :
        </p>
        
        <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
          <h3 style="color: #8b5cf6; margin-top: 0;">✨ Conseils pour optimiser votre profil :</h3>
          <ul style="color: #e5e5e5; padding-left: 20px;">
            <li>Ajoutez des photos professionnelles</li>
            <li>Complétez votre biographie</li>
            <li>Ajoutez vos liens réseaux sociaux</li>
            <li>Uploadez des échantillons de votre travail</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
           <a href="{{profileUrl}}" 
             style="background-color: #8b5cf6; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;">
            Compléter mon profil
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; text-align: center;">
          <p style="color: #888888; font-size: 12px; margin: 0;">
            <a href="{{unsubscribeUrl}}" style="color: #888888;">Se désabonner</a>
          </p>
        </div>
      </div>
    </div>
  ',
  'prospect_follow_up',
  'notifications',
  'fr',
  'internal',
  '["userName", "profileUrl", "unsubscribeUrl"]'::jsonb,
  true
);