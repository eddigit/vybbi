import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VenueProfileData {
  displayName: string;
  venueCategory?: string;
  venueCapacity?: number;
  phone?: string;
  email?: string;
  location?: string;
  city?: string;
  website?: string;
  instagram_url?: string;
  description?: string;
  genres?: string[];
  notes?: string;
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

    // Verify admin role
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      throw new Error('Admin role required');
    }

    const venueData: VenueProfileData = await req.json();

    // Generate slug from display name
    const baseSlug = venueData.displayName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check for slug uniqueness and add suffix if needed
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate temporary credentials
    const tempUsername = `venue-${slug}-${Math.random().toString(36).substring(2, 8)}`;
    const tempPassword = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12).toUpperCase();
    const claimToken = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(tempPassword);

    // Create the profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        display_name: venueData.displayName,
        profile_type: 'lieu',
        slug: slug,
        venue_category: venueData.venueCategory,
        venue_capacity: venueData.venueCapacity,
        phone: venueData.phone,
        email: venueData.email,
        location: venueData.location,
        city: venueData.city,
        website: venueData.website,
        instagram_url: venueData.instagram_url,
        bio: venueData.description,
        genres: venueData.genres,
        is_temporary: true,
        is_public: true,
        created_by_admin: user.id,
        temp_profile_notes: venueData.notes
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    // Store temporary credentials
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const { error: credError } = await supabaseClient
      .from('temporary_credentials')
      .insert({
        profile_id: profile.id,
        temp_username: tempUsername,
        temp_password_hash: passwordHash,
        claim_token: claimToken,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
        metadata: {
          venue_name: venueData.displayName,
          created_at: new Date().toISOString()
        }
      });

    if (credError) {
      console.error('Credentials creation error:', credError);
      // Rollback profile creation
      await supabaseClient.from('profiles').delete().eq('id', profile.id);
      throw credError;
    }

    console.log('Venue profile created successfully:', profile.id);

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: profile.id,
          slug: profile.slug,
          displayName: profile.display_name
        },
        credentials: {
          username: tempUsername,
          password: tempPassword,
          claimToken: claimToken,
          expiresAt: expiresAt.toISOString()
        },
        profileUrl: `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://vybbi.app')}/lieux/${profile.slug}`,
        claimUrl: `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://vybbi.app')}/claim-venue?token=${claimToken}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in admin-create-venue-profile:', error);
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