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
      // Récupérer les données pertinentes de la base
      const [profiles, events, annonces, availability] = await Promise.all([
        supabase.from('profiles').select('*').eq('is_public', true),
        supabase.from('events').select('*').eq('status', 'published'),
        supabase.from('annonces').select('*').eq('status', 'published'),
        supabase.from('availability_slots').select('*, profiles!inner(display_name, profile_type, genres)').eq('status', 'available')
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

    // Enrichir le prompt avec le contexte utilisateur
    let userContextPrompt = "";
    if (context) {
      userContextPrompt = `\n\nCONTEXTE UTILISATEUR :
- Page actuelle: ${context.page || 'général'}
- Type de profil: ${context.userType || 'non spécifié'}
- ID utilisateur: ${context.userId || 'non spécifié'}

Adapte tes réponses à ce contexte spécifique.`;
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
          { role: 'system', content: VYBBI_SYSTEM_PROMPT + contextData + userContextPrompt },
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