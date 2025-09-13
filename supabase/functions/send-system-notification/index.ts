import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface SystemNotificationRequest {
  type: string;
  to: string;
  cc?: string | string[];
  bcc?: string | string[]; 
  replyTo?: string;
  data?: any;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates système (toujours en dur, jamais Brevo)
const getSystemEmailTemplate = (type: string, data: any): { subject: string, html: string } => {
  const templates = {
    user_registration: {
      subject: `Bienvenue sur Vybbi, ${data.userName || 'nouveau membre'} !`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Bienvenue sur Vybbi !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Félicitations !</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Votre compte Vybbi a été créé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background-color: #9D5AE1; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Accéder à mon compte
              </a>
            </div>
          </div>
        </div>
      `
    },

    admin_notification: {
      subject: `Nouvelle inscription : ${data.userName} (${data.profileType})`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle inscription sur Vybbi</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Nouvel utilisateur inscrit</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Un nouvel utilisateur s'est inscrit sur la plateforme : <strong>${data.userName}</strong> (${data.userEmail})
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/admin/users" 
                 style="background-color: #9D5AE1; 
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
      `
    },

    review_notification: {
      subject: `Nouvelle review reçue de ${data.reviewerName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle review reçue !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu une nouvelle review de la part de <strong>${data.reviewerName}</strong> :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>Note:</strong> ${data.rating}/5 ⭐</p>
              <p style="color: #e5e5e5;"><strong>Commentaire:</strong></p>
              <p style="color: #e5e5e5; font-style: italic;">"${data.comment}"</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background-color: #9D5AE1; 
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
      `
    },

    contact_message: {
      subject: `Nouveau message de contact de ${data.name}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouveau message de contact</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Nouveau message reçu</h2>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>De:</strong> ${data.name} (${data.email})</p>
              <p style="color: #e5e5e5;"><strong>Sujet:</strong> ${data.subject}</p>
              <p style="color: #e5e5e5;"><strong>Message:</strong></p>
              <p style="color: #e5e5e5;">${data.message}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/admin/messages" 
                 style="background-color: #9D5AE1; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Gérer les messages
              </a>
            </div>
          </div>
        </div>
      `
    },

    booking_proposed: {
      subject: `Nouvelle demande de booking de ${data.artistName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle demande de booking !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour,</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              L'artiste <strong>${data.artistName}</strong> souhaite être booké pour votre événement :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>Événement:</strong> ${data.eventTitle}</p>
              <p style="color: #e5e5e5;"><strong>Date:</strong> ${data.eventDate}</p>
              ${data.proposedFee ? `<p style="color: #e5e5e5;"><strong>Cachet proposé:</strong> ${data.proposedFee}€</p>` : ''}
              ${data.message ? `<p style="color: #e5e5e5;"><strong>Message:</strong></p><p style="color: #e5e5e5;">${data.message}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/events" 
                 style="background-color: #9D5AE1; 
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
      `
    },

    booking_status_changed: {
      subject: `Votre demande de booking a été ${data.bookingStatus === 'confirmed' ? 'confirmée' : 'annulée'}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Mise à jour de votre demande</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName},</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Votre demande de booking pour l'événement <strong>${data.eventTitle}</strong> a été <strong>${data.bookingStatus === 'confirmed' ? 'confirmée' : 'annulée'}</strong>.
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;"><strong>Lieu:</strong> ${data.venueName}</p>
              <p style="color: #e5e5e5;"><strong>Date:</strong> ${data.eventDate}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background-color: #9D5AE1; 
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
      `
    },

    message_received: {
      subject: `Nouveau message de ${data.senderName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouveau message reçu !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour,</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu un nouveau message de <strong>${data.senderName}</strong> :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <p style="color: #e5e5e5;">${data.message}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/messages" 
                 style="background-color: #9D5AE1; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Répondre au message
              </a>
            </div>
          </div>
        </div>
      `
    },

    account_validation: {
      subject: `Félicitations ${data.userName} ! Votre compte Vybbi est activé`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Compte activé avec succès !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Félicitations ${data.userName} !</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Votre adresse email a été validée avec succès. Votre profil <strong>${data.profileType || 'Artiste'}</strong> est maintenant actif sur Vybbi !
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <h3 style="color: #9D5AE1; margin: 0 0 15px 0;">Prochaines étapes :</h3>
              <ul style="color: #e5e5e5; margin: 0; padding-left: 20px;">
                ${data.profileType === 'artist' ? '<li>Complétez votre profil artistique</li><li>Ajoutez vos morceaux et photos</li><li>Explorez les opportunités de booking</li>' : ''}
                ${data.profileType === 'venue' ? '<li>Créez vos événements et programmations</li><li>Découvrez de nouveaux talents</li><li>Gérez vos bookings</li>' : ''}
                ${data.profileType === 'manager' ? '<li>Ajoutez vos artistes à gérer</li><li>Explorez les opportunités pour vos talents</li><li>Développez votre réseau professionnel</li>' : ''}
                ${!data.profileType ? '<li>Complétez votre profil</li><li>Explorez la plateforme</li><li>Connectez-vous avec la communauté</li>' : ''}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${data.dashboardUrl || Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background-color: #9D5AE1; 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px;">
                Accéder à mon tableau de bord
              </a>
            </div>
          </div>
        </div>
      `
    },

    contract_received: {
      subject: `🎵 Nouvelle proposition de contrat de ${data.venueName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle proposition de contrat !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.artistName} !</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Vous avez reçu une nouvelle proposition de contrat de la part de <strong>${data.venueName}</strong> :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <h3 style="color: #9D5AE1; margin: 0 0 15px 0;">${data.contractTitle || 'Détails du contrat'}</h3>
              <p style="color: #e5e5e5; margin: 5px 0;"><strong>📅 Date:</strong> ${data.eventDate}</p>
              <p style="color: #e5e5e5; margin: 5px 0;"><strong>📍 Lieu:</strong> ${data.venueName}</p>
              ${data.fee ? `<p style="color: #e5e5e5; margin: 5px 0;"><strong>💰 Cachet proposé:</strong> ${data.fee}€</p>` : ''}
              ${data.contractDetails ? `<p style="color: #e5e5e5; margin: 15px 0 5px 0;"><strong>📋 Détails:</strong></p><p style="color: #e5e5e5; margin: 5px 0;">${data.contractDetails}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/contracts" 
                 style="background-color: #9D5AE1; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        margin-right: 10px;">
                Voir le contrat
              </a>
              <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/messages" 
                 style="background-color: transparent; 
                        color: #9D5AE1; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border: 1px solid #9D5AE1; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Contacter ${data.venueManagerName || 'l\'organisateur'}
              </a>
            </div>
          </div>
        </div>
      `
    },

    business_opportunity: {
      subject: `💼 Nouvelle opportunité business de ${data.senderName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle opportunité business !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.recipientName} !</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              <strong>${data.senderName}</strong> vous propose une nouvelle opportunité de collaboration :
            </p>
            
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <h3 style="color: #9D5AE1; margin: 0 0 15px 0;">${data.opportunityTitle}</h3>
              ${data.opportunityType ? `<p style="color: #e5e5e5; margin: 5px 0;"><strong>Type:</strong> ${data.opportunityType}</p>` : ''}
              ${data.budget ? `<p style="color: #e5e5e5; margin: 5px 0;"><strong>Budget:</strong> ${data.budget}</p>` : ''}
              ${data.deadline ? `<p style="color: #e5e5e5; margin: 5px 0;"><strong>Deadline:</strong> ${data.deadline}</p>` : ''}
              <p style="color: #e5e5e5; margin: 15px 0 5px 0;"><strong>Description:</strong></p>
              <p style="color: #e5e5e5; margin: 5px 0;">${data.details}</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/opportunities" 
                 style="background-color: #9D5AE1; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        margin-right: 10px;">
                Voir l'opportunité
              </a>
              <a href="${Deno.env.get('SITE_URL') || 'https://vybbi.app'}/messages?to=${data.senderId}" 
                 style="background-color: transparent; 
                        color: #9D5AE1; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border: 1px solid #9D5AE1; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Répondre à ${data.senderName}
              </a>
            </div>
          </div>
        </div>
      `
    },

    action_confirmation: {
      subject: `✅ Confirmation : ${data.actionType}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #1C1C1C;">
          <div style="background-color: #9D5AE1; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://vybbi.app/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi" style="height: 40px; margin-bottom: 15px;" />
            <h1 style="color: white; margin: 0; font-size: 24px;">Action confirmée !</h1>
          </div>
          
          <div style="background: #1C1C1C; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #404040;">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bonjour ${data.userName} !</h2>
            
            <p style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
              Votre action "<strong>${data.actionType}</strong>" a été effectuée avec succès.
            </p>
            
            ${data.actionDetails ? `
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <h3 style="color: #9D5AE1; margin: 0 0 15px 0;">Détails de l'action :</h3>
              <p style="color: #e5e5e5; margin: 5px 0;">${data.actionDetails}</p>
            </div>
            ` : ''}
            
            ${data.nextSteps ? `
            <div style="background: #262626; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #404040;">
              <h3 style="color: #9D5AE1; margin: 0 0 15px 0;">Prochaines étapes :</h3>
              <p style="color: #e5e5e5; margin: 5px 0;">${data.nextSteps}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 25px 0;">
               <a href="${data.redirectUrl || Deno.env.get('SITE_URL') || 'https://vybbi.app'}/dashboard" 
                 style="background-color: #9D5AE1; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;">
                Retour au tableau de bord
              </a>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[type as keyof typeof templates] || {
    subject: 'Notification Vybbi',
    html: `<p>Notification: ${JSON.stringify(data)}</p>`
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const body = await req.json() as SystemNotificationRequest;
    const { type, to, cc, bcc, replyTo, data = {} } = body;

    console.log(`Sending system ${type} email to ${to}`);
    console.log(`cc: ${Array.isArray(cc) ? cc.join(',') : cc || 'none'} | bcc: ${Array.isArray(bcc) ? bcc.join(',') : bcc || 'none'} | replyTo: ${replyTo || 'none'}`);

    // Get email template (always from hardcoded templates for system emails)
    const template = getSystemEmailTemplate(type, data);
    let { subject, html: htmlContent } = template;

    // Replace variables in template
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, String(data[key]));
      htmlContent = htmlContent.replace(placeholder, String(data[key]));
    });

    // Send email via Brevo
    console.log(`Prepared system email: subject length=${subject?.length || 0}, html length=${htmlContent?.length || 0}`);
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const emailPayload = {
      sender: {
        name: "Vybbi",
        email: "noreply@vybbi.com"
      },
      to: [
        {
          email: to,
          name: data.userName || ""
        }
      ],
      subject: subject,
      htmlContent: htmlContent
    };

    // Add cc recipients if provided
    if (cc) {
      emailPayload.cc = Array.isArray(cc) 
        ? cc.map(email => ({ email: email.trim() }))
        : [{ email: cc.trim() }];
    }

    // Add bcc recipients if provided  
    if (bcc) {
      emailPayload.bcc = Array.isArray(bcc)
        ? bcc.map(email => ({ email: email.trim() }))
        : [{ email: bcc.trim() }];
    }

    // Add replyTo if provided
    if (replyTo) {
      emailPayload.replyTo = {
        email: replyTo.trim()
      };
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error('Brevo API error:', errorData);
      throw new Error(`Brevo API error: ${errorData.message}`);
    }

    const emailResult = await brevoResponse.json();
    console.log("System email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult.messageId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("Error in send-system-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);