import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClaimRequest {
  claimToken: string;
  email?: string;
  password?: string;
  action: 'verify' | 'claim' | 'delete';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: ClaimRequest = await req.json();
    const { claimToken, email, password, action } = requestData;

    // Get credential record
    const { data: credential, error: credError } = await supabaseClient
      .from('temporary_credentials')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('claim_token', claimToken)
      .single();

    if (credError || !credential) {
      throw new Error('Invalid or expired claim token');
    }

    // Check expiration
    if (new Date(credential.expires_at) < new Date()) {
      throw new Error('Claim token has expired');
    }

    // Check if already claimed
    if (credential.is_claimed) {
      throw new Error('This profile has already been claimed');
    }

    // Verify action - just return profile info
    if (action === 'verify') {
      return new Response(
        JSON.stringify({
          success: true,
          profile: {
            id: credential.profile.id,
            displayName: credential.profile.display_name,
            slug: credential.profile.slug,
            venueCategory: credential.profile.venue_category,
            location: credential.profile.location,
            city: credential.profile.city
          },
          expiresAt: credential.expires_at
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Delete action - remove profile and credentials
    if (action === 'delete') {
      // Delete profile (credentials will cascade)
      const { error: deleteError } = await supabaseClient
        .from('profiles')
        .delete()
        .eq('id', credential.profile_id);

      if (deleteError) {
        throw deleteError;
      }

      console.log('Profile deleted:', credential.profile_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Profile deleted successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Claim action - create user account and link profile
    if (action === 'claim') {
      if (!email || !password) {
        throw new Error('Email and password required for claiming');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: credential.profile.display_name,
          claimed_venue: true
        }
      });

      if (authError || !authData.user) {
        throw new Error(`Failed to create user account: ${authError?.message}`);
      }

      // Update profile to link to new user
      const { error: profileUpdateError } = await supabaseClient
        .from('profiles')
        .update({
          user_id: authData.user.id,
          is_temporary: false,
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', credential.profile_id);

      if (profileUpdateError) {
        // Rollback: delete created user
        await supabaseClient.auth.admin.deleteUser(authData.user.id);
        throw profileUpdateError;
      }

      // Create user role
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'lieu'
        });

      if (roleError) {
        console.error('Role creation error:', roleError);
      }

      // Mark credential as claimed
      const { error: claimError } = await supabaseClient
        .from('temporary_credentials')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString(),
          claimed_by_user_id: authData.user.id
        })
        .eq('id', credential.id);

      if (claimError) {
        console.error('Credential update error:', claimError);
      }

      console.log('Profile claimed successfully:', credential.profile_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Profile claimed successfully',
          userId: authData.user.id,
          profileId: credential.profile_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in claim-venue-profile:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});