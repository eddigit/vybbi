import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Token pack configuration
const TOKEN_PACKS = {
  starter: {
    priceId: "price_1SAQ17Dr83jHtyPk5CD20eSy",
    tokens: 100,
    name: "Pack de 100 jetons VYBBI",
    price: 1000 // cents (10,00 €)
  },
  standard: {
    priceId: "price_1SAQ17Dr83jHtyPkiL842Z7D",
    tokens: 500,
    name: "Pack de 500 jetons VYBBI",
    price: 5000 // cents (50,00 €)
  },
  premium: {
    priceId: "price_1SAQ17Dr83jHtyPk0Bqmktsy",
    tokens: 1000,
    name: "Pack de 1 000 jetons VYBBI",
    price: 10000 // cents (100,00 €)
  },
  vip: {
    priceId: "price_1SAQ17Dr83jHtyPkmXN11VaU",
    tokens: 5000,
    name: "Pack de 5 000 jetons VYBBI",
    price: 50000 // cents (500,00 €)
  }
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TOKEN-PAYMENT] ${step}${detailsStr}`);
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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { packType } = await req.json();
    if (!packType || !TOKEN_PACKS[packType as keyof typeof TOKEN_PACKS]) {
      throw new Error("Invalid pack type");
    }

    const pack = TOKEN_PACKS[packType as keyof typeof TOKEN_PACKS];
    logStep("Selected pack", { packType, pack });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/vybbi-tokens?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/vybbi-tokens?payment=cancelled`,
      metadata: {
        userId: user.id,
        packType: packType,
        tokensAmount: pack.tokens.toString()
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Store payment session for tracking
    await supabaseClient
      .from('stripe_payment_sessions')
      .insert({
        user_id: user.id,
        session_id: session.id,
        amount_cents: pack.price,
        tokens_amount: pack.tokens,
        pack_type: packType,
        status: 'pending'
      });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-token-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});