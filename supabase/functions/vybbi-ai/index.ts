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

## Capacités selon le type d'utilisateur :
### Artistes :
- Trouver des opportunités de concerts et collaborations
- Analyser leur performance et visibilité
- Optimiser leur profil et portfolio
- Conseils sur les tarifs et négociations

### Agents/Managers :
- Découvrir de nouveaux talents
- Matcher leurs artistes avec des événements
- Analyser le marché et les tendances
- Optimiser les stratégies de booking

### Lieux/Événements :
- Trouver des artistes pour leurs événements
- Analyser leur audience et programmation
- Optimiser leur offre et tarification
- Suggestions de line-up

## Réponses :
- Toujours en français
- Structure claire avec listes à puces quand pertinent
- Mentionne le nombre de résultats trouvés
- Propose des alternatives si pas de match exact
- Sois proactif dans tes suggestions
- Adapte ton ton selon le contexte (professionnel mais accessible)

Tu peux accéder à toutes les tables de la base de données pour analyser et croiser les informations.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, action, filters, context } = await req.json();
    console.log(`Vybbi request: ${action || 'chat'} - Context: ${context?.page || 'general'} - ${message}`);

    let contextData = "";
    let searchResults = null;

    // Enrichir le contexte selon l'action
    if (action === 'search' || action === 'match' || action === 'recommend' || action === 'assistant') {
      // Déterminer mot-clés potentiels pour une recherche côté serveur
      const rawMsg = (message || '').toLowerCase();
      const hintedSearch = (filters?.q || '').toString().trim();
      const tokens = rawMsg
        .replace(/\b(recherche(r)?|chercher|trouve(r)?|trouver|dj|artiste|profil|profil(s)?|événement(s)?|annonce(s)?):?/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const keyword = (hintedSearch || tokens).slice(0, 64);
      const wantsSearch = action === 'search' || /\b(recherche|chercher|trouve|search|find)\b/.test(rawMsg);
      const mentionsDJ = /\bdj\b/.test(rawMsg);

      let profilesPromise;
      let eventsPromise;
      let annoncesPromise;
      let availabilityPromise;

      if (wantsSearch && keyword) {
        // Requêtes filtrées par mot-clé
        const profileNameQ = supabase
          .from('profiles')
          .select('id, display_name, profile_type, location, genres, slug')
          .eq('is_public', true)
          .ilike('display_name', `%${keyword}%`);

        const profileDjQ = mentionsDJ
          ? supabase
              .from('profiles')
              .select('id, display_name, profile_type, location, genres, slug')
              .eq('is_public', true)
              .or(`genres.cs.{dj},talents.cs.{dj}`)
          : null;

        profilesPromise = (async () => {
          const [byName, byDj] = await Promise.all([
            profileNameQ,
            profileDjQ ?? Promise.resolve({ data: [], error: null })
          ]);
          const list = [...(byName.data || []), ...((byDj as any).data || [])];
          // dédup
          const map = new Map(list.map((p: any) => [p.id, p]));
          return { data: Array.from(map.values()), error: byName.error || (byDj as any).error };
        })();

        eventsPromise = supabase
          .from('events')
          .select('id, title, event_date, location, genres')
          .eq('status', 'published')
          .ilike('title', `%${keyword}%`);

        annoncesPromise = supabase
          .from('annonces')
          .select('id, title, budget_max, location, genres')
          .eq('status', 'published')
          .ilike('title', `%${keyword}%`);

        availabilityPromise = supabase
          .from('availability_slots')
          .select('*, profiles!inner(display_name, profile_type, genres)')
          .eq('status', 'available');
      } else {
        // Récupérer les données pertinentes de la base (général)
        profilesPromise = supabase.from('profiles').select('*').eq('is_public', true);
        eventsPromise = supabase.from('events').select('*').eq('status', 'published');
        annoncesPromise = supabase.from('annonces').select('*').eq('status', 'published');
        availabilityPromise = supabase.from('availability_slots').select('*, profiles!inner(display_name, profile_type, genres)').eq('status', 'available');
      }

      const [profiles, events, annonces, availability] = await Promise.all([
        profilesPromise,
        eventsPromise,
        annoncesPromise,
        availabilityPromise
      ]);

      const contextInfo = {
        profiles_count: profiles.data?.length || 0,
        events_count: events.data?.length || 0,
        annonces_count: annonces.data?.length || 0,
        availability_count: availability.data?.length || 0,
        profiles: profiles.data?.slice(0, 50), // Limiter pour éviter trop de tokens
        events: events.data?.slice(0, 20),
        annonces: annonces.data?.slice(0, 20),
        availability: availability.data?.slice(0, 30)
      };

      contextData = `\n\nDONNÉES ACTUELLES DE LA PLATEFORME :\n${JSON.stringify(contextInfo, null, 2)}`;

      // Résultats de recherche prétraités si applicable
      if (wantsSearch) {
        searchResults = {
          profiles: profiles.data || [],
          events: events.data || [],
          annonces: annonces.data || [],
          availability: availability.data || []
        };
      }
    }

    // Enrichir le prompt avec le contexte utilisateur
    let userContextPrompt = "";
    if (context) {
      userContextPrompt = `\n\nCONTEXTE UTILISATEUR :
- Page actuelle: ${context.page || 'général'}
- Type de profil: ${context.userType || 'non spécifié'}
- ID utilisateur: ${context.userId || 'non spécifié'}

Adapte tes réponses à ce contexte spécifique.`;
    }

    // Appel à OpenAI avec cascade de modèles et tolérance aux erreurs
    const systemMessage = { role: 'system', content: VYBBI_SYSTEM_PROMPT + contextData + userContextPrompt };
    const userMessage = { role: 'user', content: message };

    async function callOpenAI(payload: any) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return res;
    }

    let response = await callOpenAI({
      model: 'gpt-5-mini-2025-08-07',
      messages: [systemMessage, userMessage],
      // Nouveau paramètre requis pour les modèles récents
      max_completion_tokens: 800,
    });

    // Fallback si rate-limit/erreur
    if (!response.ok) {
      console.warn(`Primary model failed (${response.status}). Falling back to gpt-4o-mini`);
      // Petit backoff pour 429
      if (response.status === 429) {
        await new Promise((r) => setTimeout(r, 600));
      }
      response = await callOpenAI({
        model: 'gpt-4o-mini',
        messages: [systemMessage, userMessage],
        // Ancien paramètre pour modèles legacy
        max_tokens: 800,
        temperature: 0.7,
      });
    }

    let reply = '';
    if (response.ok) {
      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || '';
    } else {
      // Dernier repli côté serveur: fournir un résumé pertinent basé sur la base de données
      const counts = searchResults ? {
        p: searchResults.profiles?.length || 0,
        e: searchResults.events?.length || 0,
        a: searchResults.annonces?.length || 0
      } : { p: 0, e: 0, a: 0 };

      const topProfiles = (searchResults?.profiles || []).slice(0, 5).map((p: any) => `• ${p.display_name}${p.location ? ` — ${p.location}` : ''}`).join('\n');
      const topEvents = (searchResults?.events || []).slice(0, 3).map((e: any) => `• ${e.title}${e.event_date ? ` — ${e.event_date}` : ''}`).join('\n');
      const topAnnonces = (searchResults?.annonces || []).slice(0, 3).map((a: any) => `• ${a.title}${a.budget_max ? ` — budget ${a.budget_max}€` : ''}`).join('\n');

      if (counts.p + counts.e + counts.a > 0) {
        reply = `Voici des résultats trouvés directement dans la base de données (mode secours):\n\n` +
          (counts.p ? `Profils (${counts.p}):\n${topProfiles}\n\n` : '') +
          (counts.e ? `Événements (${counts.e}):\n${topEvents}\n\n` : '') +
          (counts.a ? `Annonces (${counts.a}):\n${topAnnonces}\n\n` : '') +
          `Tu peux affiner avec des filtres (ex: ville, genre, date).`;
      } else {
        reply = `Je rencontre un pic de charge sur le service d'IA. Voici un état de la plateforme pour t'aider:\n\n` +
          (contextData || '').slice(0, 1800) + `\n\nReformule ta demande ou précise des filtres (genre, ville, date) et je réessaierai.`;
      }
    }

    // Log de l'interaction (seulement si utilisateur connecté)
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      // Extraire l'ID utilisateur du token JWT si possible
      // Pour l'instant on log sans user_id, juste pour les admins
      try {
        await supabase.from('vybbi_interactions').insert({
          message,
          response: reply,
          action,
          filters: JSON.stringify(context || filters || {}),
          created_at: new Date().toISOString()
        });
      } catch (logError) {
        console.warn('Could not log interaction:', logError);
      }
    }

    return new Response(JSON.stringify({ 
      reply, 
      searchResults,
      action,
      context: context?.page,
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