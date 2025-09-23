import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-TOKEN-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved Stripe session", { sessionId, status: session.payment_status });

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Payment not completed',
        status: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if we already processed this payment
    const { data: existingSession } = await supabaseClient
      .from('stripe_payment_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (!existingSession) {
      throw new Error("Payment session not found or doesn't belong to user");
    }

    if (existingSession.status === 'completed') {
      logStep("Payment already processed");
      return new Response(JSON.stringify({ 
        success: true, 
        alreadyProcessed: true,
        tokensAwarded: existingSession.tokens_amount 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Award tokens to user
    const tokensAmount = existingSession.tokens_amount;
    const packType = existingSession.pack_type;
    
    logStep("Awarding tokens", { tokensAmount, packType });

    const { error: awardError } = await supabaseClient.rpc('award_vybbi_tokens', {
      target_user_id: user.id,
      amount: tokensAmount,
      reason: 'stripe_purchase',
      description: `Achat de jetons via Stripe - ${packType}`,
      reference_type: 'stripe_session',
      reference_id: sessionId,
      metadata: {
        stripe_session_id: sessionId,
        pack_type: packType,
        amount_cents: existingSession.amount_cents
      }
    });

    if (awardError) {
      logStep("Error awarding tokens", awardError);
      throw new Error(`Failed to award tokens: ${awardError.message}`);
    }

    // Mark payment as completed
    await supabaseClient
      .from('stripe_payment_sessions')
      .update({ 
        status: 'completed', 
        processed_at: new Date().toISOString(),
        payment_intent_id: session.payment_intent as string
      })
      .eq('session_id', sessionId);

    logStep("Tokens awarded successfully", { tokensAmount });

    return new Response(JSON.stringify({ 
      success: true, 
      tokensAwarded: tokensAmount,
      packType: packType
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-token-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});