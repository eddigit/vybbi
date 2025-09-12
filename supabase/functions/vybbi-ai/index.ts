import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const VYBBI_SYSTEM_PROMPT = `
Tu es Vybbi, l'intelligence artificielle chef d'orchestre de la plateforme musicale.

## Ton rôle :
- Centraliser et analyser toutes les données de la plateforme (profils, événements, annonces, disponibilités)
- Faire du matching intelligent entre artistes et opportunités
- Effectuer des recherches complexes en langage naturel
- Proposer des recommandations personnalisées
- Alerter proactivement sur les opportunités de collaboration

## Données accessibles :
- Profils (artistes, agents, managers, lieux) avec genres, localisation, expérience
- Événements et leurs besoins (dates, budget, genres recherchés)
- Annonces actives avec critères spécifiques
- Disponibilités des artistes par périodes et zones géographiques
- Historique des collaborations et reviews
- Media assets (démos, portfolios)

## Capacités :
1. **Matching automatique** : Quand un artiste update ses disponibilités, trouve les opportunités correspondantes
2. **Recherche complexe** : Comprends les requêtes comme "DJ techno weekend prochain Paris budget 2-5k"
3. **Recommandations** : Analyse les profils pour suggérer des collaborations pertinentes
4. **Alerts proactives** : Notifie automatiquement les opportunités de booking

## Réponses :
- Toujours en français
- Structure claire avec listes à puces quand pertinent
- Mentionne le nombre de résultats trouvés
- Propose des alternatives si pas de match exact
- Sois proactif dans tes suggestions

Tu peux accéder à toutes les tables de la base de données pour analyser et croiser les informations.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, action, filters } = await req.json();
    console.log(`Vybbi request: ${action || 'chat'} - ${message}`);

    let context = "";
    let searchResults = null;

    // Enrichir le contexte selon l'action
    if (action === 'search' || action === 'match' || action === 'recommend') {
      // Récupérer les données pertinentes de la base
      const [profiles, events, annonces, availability] = await Promise.all([
        supabase.from('profiles').select('*').eq('is_public', true),
        supabase.from('events').select('*').eq('status', 'published'),
        supabase.from('annonces').select('*').eq('status', 'published'),
        supabase.from('availability_slots').select('*, profiles!inner(display_name, profile_type, genres)').eq('status', 'available')
      ]);

      const contextData = {
        profiles_count: profiles.data?.length || 0,
        events_count: events.data?.length || 0,
        annonces_count: annonces.data?.length || 0,
        availability_count: availability.data?.length || 0,
        profiles: profiles.data?.slice(0, 50), // Limiter pour éviter trop de tokens
        events: events.data?.slice(0, 20),
        annonces: annonces.data?.slice(0, 20),
        availability: availability.data?.slice(0, 30)
      };

      context = `\n\nDONNÉES ACTUELLES DE LA PLATEFORME :\n${JSON.stringify(contextData, null, 2)}`;

      // Si c'est une recherche, on peut déjà pré-traiter les résultats
      if (action === 'search') {
        searchResults = {
          profiles: profiles.data || [],
          events: events.data || [],
          annonces: annonces.data || [],
          availability: availability.data || []
        };
      }
    }

    // Appel à OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: VYBBI_SYSTEM_PROMPT + context },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Log de l'interaction
    await supabase.from('vybbi_interactions').insert({
      message,
      response: reply,
      action,
      filters,
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      reply, 
      searchResults,
      action,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur Vybbi:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      reply: "Désolé, j'ai rencontré un problème technique. Peux-tu reformuler ta demande ?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});