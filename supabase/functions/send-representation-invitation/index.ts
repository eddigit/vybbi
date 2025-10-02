import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  artist_profile_id: string;
  invited_email: string;
  invited_name: string;
  invitation_type: 'agent' | 'manager';
  artist_name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { artist_profile_id, invited_email, invited_name, invitation_type, artist_name } = await req.json() as InvitationRequest;

    // Generate unique token
    const token = crypto.randomUUID();

    // Insert invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('representation_invitations')
      .insert({
        artist_profile_id,
        invited_email,
        invited_name,
        invitation_type,
        token,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Get RESEND_API_KEY from admin_secrets
    const { data: secretData, error: secretError } = await supabaseClient
      .from('admin_secrets')
      .select('value')
      .eq('name', 'RESEND_API_KEY')
      .single();

    if (secretError || !secretData) {
      console.error('RESEND_API_KEY not found in admin_secrets');
      throw new Error('Email configuration not found');
    }

    const RESEND_API_KEY = secretData.value;

    // Prepare invitation link
    const invitationLink = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/auth?invitation_token=${token}&type=${invitation_type}`;

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Vybbi <noreply@vybbi.app>',
        to: [invited_email],
        subject: `${artist_name} vous invite à devenir son ${invitation_type === 'agent' ? 'agent' : 'manager'}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                    Invitation à représenter un artiste
                  </h1>
                </div>
                
                <div style="padding: 40px 30px;">
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                    Bonjour <strong>${invited_name}</strong>,
                  </p>
                  
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6;">
                    <strong>${artist_name}</strong> vous invite à devenir son <strong>${invitation_type === 'agent' ? 'agent' : 'manager'}</strong> sur <strong>Vybbi</strong>.
                  </p>
                  
                  <p style="font-size: 16px; color: #333; margin-bottom: 30px; line-height: 1.6;">
                    Vybbi est la plateforme qui connecte les artistes avec les professionnels de l'industrie musicale. 
                    En acceptant cette invitation, vous pourrez gérer le profil de ${artist_name} et recevoir directement les demandes de contact.
                  </p>
                  
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${invitationLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                      Accepter l'invitation
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <strong>Note :</strong> Si vous n'avez pas encore de compte Vybbi, vous pourrez en créer un gratuitement en cliquant sur le bouton ci-dessus.
                  </p>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 15px; line-height: 1.5;">
                    Cette invitation expire dans <strong>7 jours</strong>. Si vous n'êtes pas la bonne personne, vous pouvez ignorer cet email.
                  </p>
                  
                  <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                    Lien direct : <a href="${invitationLink}" style="color: #667eea; text-decoration: none;">${invitationLink}</a>
                  </p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0; font-size: 12px; color: #666;">
                    © ${new Date().getFullYear()} Vybbi - La plateforme des professionnels de la musique
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error('Resend error:', errorText);
      throw new Error('Failed to send invitation email');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation_id: invitation.id,
        message: 'Invitation sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});