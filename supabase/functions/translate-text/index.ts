import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  text: string;
  targetLanguage?: string;
  sourceLanguage?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    let payload: Partial<TranslateRequest> = {};
    if (bodyText) {
      try { payload = JSON.parse(bodyText); } catch { /* ignore bad JSON */ }
    }

    const text = (payload.text ?? '').toString();
    const targetLanguage = (payload.targetLanguage ?? 'auto').toString();
    const sourceLanguage = payload.sourceLanguage?.toString();

    if (!text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing text', translatedText: '', detectedSourceLanguage: sourceLanguage ?? 'auto', targetLanguage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Google Translate has been fully disabled. We return the original text as-is.
    console.log('translate-text: Google Translate disabled; returning original text.');

    return new Response(
      JSON.stringify({
        translatedText: text,
        detectedSourceLanguage: sourceLanguage ?? 'auto',
        originalText: text,
        targetLanguage,
        provider: 'disabled'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('translate-text error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
