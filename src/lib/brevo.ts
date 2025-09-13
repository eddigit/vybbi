// Type pour les destinataires
interface EmailRecipient {
  email: string;
  name?: string;
}

// Type pour les paramètres d'email
interface SendEmailParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

// Type pour la réponse
interface EmailResponse {
  messageId: string;
}

/**
 * Envoie un email via l'API Brevo (côté client via edge function)
 * Cette fonction appelle notre edge function qui utilise l'API Brevo
 */
export const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent
}: SendEmailParams): Promise<EmailResponse> => {
  try {
    // Appel de notre edge function qui gère Brevo
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        htmlContent,
        textContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'envoi d\'email');
    }

    const result = await response.json();
    return {
      messageId: result.messageId
    };

  } catch (error: any) {
    console.error('Erreur lors de l\'envoi d\'email via Brevo:', error);
    throw new Error(`Échec d'envoi d'email: ${error.message}`);
  }
};

/**
 * Fonction utilitaire pour envoyer un email de test
 */
export const sendTestEmail = async (toEmail: string): Promise<EmailResponse> => {
  return sendEmail({
    to: [{ email: toEmail, name: 'Test User' }],
    subject: 'Test Brevo depuis Vybbi',
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
        </div>
      </div>
    `,
    textContent: 'Test OK - Email envoyé via Brevo API.'
  });
};