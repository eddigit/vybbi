import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration des prix Stripe pour chaque tier et profile_type
const PRICING_CONFIG: Record<string, Record<string, { priceId: string; name: string }>> = {
  artist: {
    solo: { priceId: "price_vybbi_artist_solo", name: "Artiste Solo" },
    pro: { priceId: "price_vybbi_artist_pro", name: "Artiste Pro" },
    elite: { priceId: "price_vybbi_artist_elite", name: "Artiste Elite" },
  },
  agent: {
    solo: { priceId: "price_vybbi_agent_solo", name: "Agent Solo" },
    pro: { priceId: "price_vybbi_agent_pro", name: "Agent Pro" },
    elite: { priceId: "price_vybbi_agent_elite", name: "Agent Elite" },
  },
  manager: {
    solo: { priceId: "price_vybbi_manager_solo", name: "Manager Solo" },
    pro: { priceId: "price_vybbi_manager_pro", name: "Manager Pro" },
    elite: { priceId: "price_vybbi_manager_elite", name: "Manager Elite" },
  },
  lieu: {
    solo: { priceId: "price_vybbi_venue_solo", name: "Lieu Solo" },
    pro: { priceId: "price_vybbi_venue_pro", name: "Lieu Pro" },
    elite: { priceId: "price_vybbi_venue_elite", name: "Lieu Elite" },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { tier, profileType } = await req.json();

    if (!tier || !profileType) {
      throw new Error("Missing tier or profileType");
    }

    // Récupérer la configuration de prix
    const pricing = PRICING_CONFIG[profileType]?.[tier];
    if (!pricing) {
      throw new Error(`Invalid tier/profileType combination: ${profileType}/${tier}`);
    }

    // Récupérer le profil de l'utilisateur
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, display_name, email")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Vérifier si le client Stripe existe déjà
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    });

    let customerId = customers.data[0]?.id;

    if (!customerId) {
      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile.display_name || undefined,
        metadata: {
          supabase_user_id: user.id,
          profile_id: profile.id,
          profile_type: profileType,
        },
      });
      customerId = customer.id;
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: pricing.priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/tarification-specifique?subscription=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        profile_id: profile.id,
        tier,
        profile_type: profileType,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          profile_id: profile.id,
          tier,
          profile_type: profileType,
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
