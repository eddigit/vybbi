import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format

    console.log(`Starting monthly commission calculation for ${currentMonth}`);

    // Step 1: Get all confirmed subscription conversions that should generate recurring commissions
    const { data: conversions, error: conversionsError } = await supabase
      .from('affiliate_conversions')
      .select(`
        id,
        link_id,
        user_id,
        converted_at,
        is_exclusive_program,
        influencer_links!inner(
          influencer_profile_id,
          profiles!inner(
            siret_number,
            siret_verified
          )
        )
      `)
      .eq('conversion_type', 'subscription')
      .eq('conversion_status', 'confirmed')
      .lte('converted_at', currentDate.toISOString());

    if (conversionsError) {
      console.error('Error fetching conversions:', conversionsError);
      throw conversionsError;
    }

    console.log(`Found ${conversions?.length || 0} eligible conversions`);

    let processedCount = 0;
    let errorCount = 0;

    if (conversions) {
      for (const conversion of conversions) {
        try {
          // Check if the influencer has a verified SIRET (required for payments)
          const profile = conversion.influencer_links.profiles;
          if (!profile.siret_number || !profile.siret_verified) {
            console.log(`Skipping conversion ${conversion.id}: Influencer has no verified SIRET`);
            continue;
          }

          // Check if user is still active (has signed in within last 60 days)
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(conversion.user_id);
          
          if (userError) {
            console.error(`Error checking user ${conversion.user_id}:`, userError);
            continue;
          }

          const lastSignIn = userData.user?.last_sign_in_at;
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

          const isUserActive = lastSignIn && new Date(lastSignIn) > sixtyDaysAgo;

          if (!isUserActive) {
            console.log(`Skipping conversion ${conversion.id}: User not active in last 60 days`);
            continue;
          }

          // Check if commission for this month already exists
          const { data: existingCommission, error: existingError } = await supabase
            .from('recurring_commissions')
            .select('id')
            .eq('influencer_profile_id', conversion.influencer_links.influencer_profile_id)
            .eq('user_id', conversion.user_id)
            .eq('month_year', currentMonth)
            .maybeSingle();

          if (existingError) {
            console.error(`Error checking existing commission:`, existingError);
            continue;
          }

          if (existingCommission) {
            console.log(`Commission already exists for conversion ${conversion.id} in ${currentMonth}`);
            continue;
          }

          // Determine commission amount based on exclusive program status
          const conversionDate = new Date(conversion.converted_at);
          const exclusiveDeadline = new Date('2026-01-31');
          const isEligibleForExclusive = conversionDate <= exclusiveDeadline;

          const commissionAmount = (conversion.is_exclusive_program && isEligibleForExclusive) ? 0.50 : 0.25;

          // Create the recurring commission record
          const { error: insertError } = await supabase
            .from('recurring_commissions')
            .insert({
              influencer_profile_id: conversion.influencer_links.influencer_profile_id,
              user_id: conversion.user_id,
              conversion_id: conversion.id,
              month_year: currentMonth,
              amount: commissionAmount,
              is_exclusive_program: conversion.is_exclusive_program && isEligibleForExclusive,
              status: 'pending'
            });

          if (insertError) {
            console.error(`Error inserting recurring commission:`, insertError);
            errorCount++;
          } else {
            console.log(`Created recurring commission for conversion ${conversion.id}: ${commissionAmount}€`);
            processedCount++;
          }

        } catch (error) {
          console.error(`Error processing conversion ${conversion.id}:`, error);
          errorCount++;
        }
      }
    }

    // Step 2: Update statistics
    const { error: statsError } = await supabase.rpc('calculate_monthly_recurring_commissions');
    
    if (statsError) {
      console.error('Error updating statistics:', statsError);
    }

    const result = {
      success: true,
      month: currentMonth,
      processed_conversions: processedCount,
      errors: errorCount,
      total_conversions_checked: conversions?.length || 0,
      timestamp: currentDate.toISOString()
    };

    console.log('Monthly commission calculation completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in calculate-monthly-commissions function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});