// Deno Edge Function: Admin manual email confirmation
// Confirms a user via service role. Protect with secret header.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-auth-hook-secret, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const sharedSecret = Deno.env.get("AUTH_EMAIL_HOOK_SECRET") || Deno.env.get("ADMIN_CONFIRM_SECRET");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const headerSecret = req.headers.get("x-auth-hook-secret") || req.headers.get("x-admin-secret");
    if (!sharedSecret || headerSecret !== sharedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { userId } = body as { userId?: string };

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    } as any);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, user: data?.user ?? null }),
      { headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  } catch (err) {
    console.error("[ADMIN-CONFIRM-USER] Error:", err);
    return new Response(JSON.stringify({ error: (err as any)?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});