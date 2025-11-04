import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Webhook event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (!metadata?.supabase_user_id || !metadata?.profile_id || !metadata?.tier) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Récupérer la subscription Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

        // Mettre à jour le profil avec le nouveau tier
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .update({
            subscription_tier: metadata.tier,
            subscription_status: "active",
            subscription_started_at: new Date().toISOString(),
            subscription_expires_at: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", metadata.profile_id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          break;
        }

        // Enregistrer l'abonnement dans la table subscriptions
        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .insert({
            user_id: metadata.supabase_user_id,
            profile_id: metadata.profile_id,
            stripe_subscription_id: stripeSubscription.id,
            stripe_customer_id: stripeSubscription.customer as string,
            tier: metadata.tier,
            status: "active",
            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          });

        if (subError) {
          console.error("Error creating subscription record:", subError);
        }

        console.log(`Subscription activated for user ${metadata.supabase_user_id} with tier ${metadata.tier}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;

        if (!metadata?.profile_id) {
          console.error("Missing profile_id in subscription metadata");
          break;
        }

        // Mettre à jour le statut de l'abonnement
        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .update({
            status: subscription.status === "active" ? "active" : 
                    subscription.status === "canceled" ? "cancelled" :
                    subscription.status === "past_due" ? "past_due" : "expired",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (subError) {
          console.error("Error updating subscription:", subError);
        }

        // Mettre à jour le profil si le statut a changé
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .update({
            subscription_status: subscription.status === "active" ? "active" : 
                                subscription.status === "canceled" ? "cancelled" :
                                subscription.status === "past_due" ? "active" : "expired",
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", metadata.profile_id);

        if (profileError) {
          console.error("Error updating profile status:", profileError);
        }

        console.log(`Subscription updated for profile ${metadata.profile_id}: ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;

        if (!metadata?.profile_id) {
          console.error("Missing profile_id in subscription metadata");
          break;
        }

        // Rétrograder le profil en freemium
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .update({
            subscription_tier: "freemium",
            subscription_status: "cancelled",
          })
          .eq("id", metadata.profile_id);

        if (profileError) {
          console.error("Error downgrading profile:", profileError);
        }

        // Mettre à jour la table subscriptions
        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (subError) {
          console.error("Error updating subscription record:", subError);
        }

        console.log(`Subscription cancelled for profile ${metadata.profile_id}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
