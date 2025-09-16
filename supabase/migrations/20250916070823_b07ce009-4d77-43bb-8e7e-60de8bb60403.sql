-- Templates d'emails pour le système de prospection Vybbi
INSERT INTO public.email_templates (name, type, subject, html_content, required_variables, variables, category, is_active, language) VALUES 
(
  'Premier Contact - Artiste',
  'vybbi_prospect_artist_first_contact',
  'Développez votre carrière artistique avec Vybbi 🎵',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vybbi - Développez votre carrière artistique</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎵 Vybbi</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">La plateforme qui booste votre carrière artistique</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px 30px;">
      <h2 style="color: #1a202c; margin: 0 0 20px; font-size: 24px;">Bonjour {{contact_name}} ! 👋</h2>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px;">
        Je suis de l''équipe Vybbi et je vous contacte car nous avons découvert votre travail artistique qui nous impressionne vraiment.
      </p>
      
      <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
        <h3 style="color: #667eea; margin: 0 0 15px; font-size: 18px;">🚀 Pourquoi Vybbi peut vous aider :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
          <li style="margin: 8px 0;">Accès direct à notre réseau de lieux, agents et managers</li>
          <li style="margin: 8px 0;">Outils de promotion et de visibilité avancés</li>
          <li style="margin: 8px 0;">Gestion simplifiée de vos bookings et contrats</li>
          <li style="margin: 8px 0;">Analytics détaillés de votre performance</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://vybbi.com/artists" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          📱 Découvrir Vybbi
        </a>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0;">
        Seriez-vous disponible pour un bref échange cette semaine ? Je serais ravi de vous expliquer comment Vybbi peut accélérer votre développement artistique.
      </p>
    </div>
    
    <!-- Signature -->
    <div style="background: #2d3748; padding: 30px; color: white;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background: #667eea; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 20px;">
          🎵
        </div>
        <div>
          <h4 style="margin: 0; font-size: 16px;">Équipe Vybbi</h4>
          <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Business Development</p>
        </div>
      </div>
      <p style="margin: 0; opacity: 0.7; font-size: 12px;">
        Vybbi - La plateforme qui révolutionne l''industrie musicale<br>
        📧 contact@vybbi.com | 🌐 vybbi.com
      </p>
    </div>
  </div>
</body>
</html>',
  '["contact_name"]'::jsonb,
  '{}'::jsonb,
  'prospection',
  true,
  'fr'
),
(
  'Premier Contact - Lieu/Club',
  'vybbi_prospect_venue_first_contact',
  'Vybbi : Trouvez les artistes parfaits pour vos événements 🎤',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vybbi - Programmation musicale simplifiée</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎤 Vybbi</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Votre réseau d''artistes sur-mesure</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px 30px;">
      <h2 style="color: #1a202c; margin: 0 0 20px; font-size: 24px;">Bonjour {{contact_name}} ! 🎶</h2>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px;">
        Je découvre {{company_name}} et j''aimerais vous présenter Vybbi, la plateforme qui révolutionne la programmation musicale pour les lieux comme le vôtre.
      </p>
      
      <div style="background: #fff5eb; border-left: 4px solid #ed8936; padding: 20px; margin: 30px 0;">
        <h3 style="color: #ed8936; margin: 0 0 15px; font-size: 18px;">🎯 Ce que Vybbi vous apporte :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
          <li style="margin: 8px 0;">Base de données de 10,000+ artistes vérifiés</li>
          <li style="margin: 8px 0;">Matching intelligent selon vos critères</li>
          <li style="margin: 8px 0;">Gestion simplifiée des contrats et paiements</li>
          <li style="margin: 8px 0;">Analytics de performance événementielle</li>
        </ul>
      </div>
      
      <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: #2d3748;">📊 Résultats typiques de nos partenaires :</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #ed8936;">+40%</div>
            <div style="font-size: 12px; color: #718096;">Fréquentation moyenne</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #38a169;">-60%</div>
            <div style="font-size: 12px; color: #718096;">Temps de recherche</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://vybbi.com/venues" style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          🏢 Découvrir Vybbi Venues
        </a>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0;">
        Nous avons des artistes exceptionnels qui cherchent des scènes comme {{company_name}}. Seriez-vous intéressé(e) pour en discuter ?
      </p>
    </div>
    
    <!-- Signature -->
    <div style="background: #2d3748; padding: 30px; color: white;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background: #ed8936; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 20px;">
          🎤
        </div>
        <div>
          <h4 style="margin: 0; font-size: 16px;">Équipe Vybbi</h4>
          <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Partnerships & Venues</p>
        </div>
      </div>
      <p style="margin: 0; opacity: 0.7; font-size: 12px;">
        Vybbi - Connectez-vous à l''écosystème musical<br>
        📧 venues@vybbi.com | 🌐 vybbi.com/venues
      </p>
    </div>
  </div>
</body>
</html>',
  '["contact_name", "company_name"]'::jsonb,
  '{}'::jsonb,
  'prospection',
  true,
  'fr'
),
(
  'Suivi - Prospect Intéressé',
  'vybbi_prospect_follow_up_interested',
  'Suite à votre intérêt pour Vybbi 🚀',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vybbi - Suivi de prospection</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">✨ Vybbi</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Prêt à franchir l''étape suivante ?</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px 30px;">
      <h2 style="color: #1a202c; margin: 0 0 20px; font-size: 24px;">Merci {{contact_name}} ! 🙌</h2>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px;">
        Je suis ravi de votre intérêt pour Vybbi ! Pour vous offrir la meilleure expérience possible, j''aimerais mieux comprendre vos besoins spécifiques.
      </p>
      
      <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #38a169; margin: 0 0 15px; font-size: 18px;">🎯 Prochaines étapes :</h3>
        <ol style="margin: 0; padding-left: 20px; color: #2d3748;">
          <li style="margin: 10px 0;">Programmation d''un appel découverte (15-30 min)</li>
          <li style="margin: 10px 0;">Présentation personnalisée de nos services</li>
          <li style="margin: 10px 0;">Période d''essai gratuite de 30 jours</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://calendly.com/vybbi/demo" style="background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          📅 Réserver un Créneau
        </a>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0; text-align: center;">
        <em>Vous préférez nous appeler ? Contactez-nous au +33 1 23 45 67 89</em>
      </p>
    </div>
    
    <!-- Signature -->
    <div style="background: #2d3748; padding: 30px; color: white;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background: #38a169; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 20px;">
          🎯
        </div>
        <div>
          <h4 style="margin: 0; font-size: 16px;">Équipe Vybbi</h4>
          <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Customer Success</p>
        </div>
      </div>
      <p style="margin: 0; opacity: 0.7; font-size: 12px;">
        Vybbi - Votre succès, notre mission<br>
        📧 success@vybbi.com | 🌐 vybbi.com
      </p>
    </div>
  </div>
</body>
</html>',
  '["contact_name"]'::jsonb,
  '{}'::jsonb,
  'prospection',
  true,
  'fr'
),
(
  'Relance - Agent/Manager',
  'vybbi_prospect_agent_follow_up',
  'Opportunités exclusives pour vos artistes avec Vybbi 🌟',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vybbi - Partenariat Agents & Managers</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #805ad5 0%, #553c9a 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">⭐ Vybbi Pro</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Le réseau premium des professionnels</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px 30px;">
      <h2 style="color: #1a202c; margin: 0 0 20px; font-size: 24px;">Bonjour {{contact_name}}, 🤝</h2>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px;">
        Suite à notre précédent échange, je voulais vous présenter nos programmes exclusifs pour les agents et managers comme {{company_name}}.
      </p>
      
      <div style="background: #faf5ff; border-left: 4px solid #805ad5; padding: 20px; margin: 30px 0;">
        <h3 style="color: #805ad5; margin: 0 0 15px; font-size: 18px;">💎 Programme Partenaire Premium :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
          <li style="margin: 8px 0;">Commission de 15% sur chaque booking réalisé</li>
          <li style="margin: 8px 0;">Accès prioritaire aux opportunités VIP</li>
          <li style="margin: 8px 0;">Dashboard dédié pour vos artistes</li>
          <li style="margin: 8px 0;">Support 24/7 et account manager</li>
        </ul>
      </div>
      
      <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; color: #234e52; font-weight: bold;">🎯 Offre de lancement : 0% de commission les 3 premiers mois !</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://vybbi.com/partners/signup" style="background: linear-gradient(135deg, #805ad5 0%, #553c9a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          🚀 Rejoindre le Programme
        </a>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0;">
        Quand pourrait-on programmer un appel pour vous expliquer comment maximiser les opportunités de vos artistes ?
      </p>
    </div>
    
    <!-- Signature -->
    <div style="background: #2d3748; padding: 30px; color: white;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background: #805ad5; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 20px;">
          🤝
        </div>
        <div>
          <h4 style="margin: 0; font-size: 16px;">Équipe Vybbi</h4>
          <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Partnerships</p>
        </div>
      </div>
      <p style="margin: 0; opacity: 0.7; font-size: 12px;">
        Vybbi - Ensemble, créons l''avenir de la musique<br>
        📧 partnerships@vybbi.com | 🌐 vybbi.com/partners
      </p>
    </div>
  </div>
</body>
</html>',
  '["contact_name", "company_name"]'::jsonb,
  '{}'::jsonb,
  'prospection',
  true,
  'fr'
),
(
  'Proposition Partenariat - Sponsor',
  'vybbi_prospect_sponsor_partnership',
  'Partenariat stratégique avec Vybbi - Opportunités exclusives 💼',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vybbi - Partenariat Sponsors</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ecc94b 0%, #d69e2e 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">💎 Vybbi Sponsors</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Partenariats premium dans la musique</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px 30px;">
      <h2 style="color: #1a202c; margin: 0 0 20px; font-size: 24px;">Bonjour {{contact_name}} ! ✨</h2>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px;">
        {{company_name}} et Vybbi partagent une vision commune : soutenir l''écosystème musical et les talents émergents.
      </p>
      
      <div style="background: #fffbeb; border-left: 4px solid #ecc94b; padding: 20px; margin: 30px 0;">
        <h3 style="color: #ecc94b; margin: 0 0 15px; font-size: 18px;">🎯 Opportunités de partenariat :</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
          <li style="margin: 8px 0;">Sponsoring d''événements exclusifs (50K+ participants)</li>
          <li style="margin: 8px 0;">Placement de marque auprès de 10K+ artistes</li>
          <li style="margin: 8px 0;">Campagnes co-brandées sur nos plateformes</li>
          <li style="margin: 8px 0;">Accès VIP aux talents en devenir</li>
        </ul>
      </div>
      
      <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 15px; color: #2d3748; text-align: center;">📈 Impact de nos partenaires actuels</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #ecc94b;">2M+</div>
            <div style="font-size: 11px; color: #718096;">Impressions/mois</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #38a169;">85%</div>
            <div style="font-size: 11px; color: #718096;">Taux d''engagement</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #805ad5;">15K+</div>
            <div style="font-size: 11px; color: #718096;">Artistes exposés</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://vybbi.com/sponsors" style="background: linear-gradient(135deg, #ecc94b 0%, #d69e2e 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
          💼 Voir les Opportunités
        </a>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6; margin: 20px 0;">
        Seriez-vous disponible pour un appel stratégique cette semaine ? J''ai quelques idées passionnantes à partager avec {{company_name}}.
      </p>
    </div>
    
    <!-- Signature -->
    <div style="background: #2d3748; padding: 30px; color: white;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background: #ecc94b; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 20px;">
          💎
        </div>
        <div>
          <h4 style="margin: 0; font-size: 16px;">Équipe Vybbi</h4>
          <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Strategic Partnerships</p>
        </div>
      </div>
      <p style="margin: 0; opacity: 0.7; font-size: 12px;">
        Vybbi - Innovation & Partenariats Stratégiques<br>
        📧 sponsors@vybbi.com | 🌐 vybbi.com/sponsors
      </p>
    </div>
  </div>
</body>
</html>',
  '["contact_name", "company_name"]'::jsonb,
  '{}'::jsonb,
  'prospection',
  true,
  'fr'
);