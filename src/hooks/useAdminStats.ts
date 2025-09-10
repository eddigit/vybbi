import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  usersByType: Record<string, number>;
  messagesLastWeek: number;
  publishedEvents: number;
  publishedAnnonces: number;
  blogPosts: number;
  pendingModeration: number;
  systemHealth: {
    database: 'ok' | 'warning' | 'error';
    security: 'ok' | 'warning' | 'error';
    performance: 'ok' | 'warning' | 'error';
  };
}

// Cache optimisé avec ReactQuery pour les statistiques admin
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Fetch toutes les données en parallèle pour optimiser les performances
      const [
        profilesResult,
        messagesResult,
        eventsResult,
        annoncesResult,
        blogResult
      ] = await Promise.allSettled([
        supabase.from('profiles').select('profile_type'),
        supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('status', 'published'),
        supabase
          .from('annonces')
          .select('id', { count: 'exact' })
          .eq('status', 'published'),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact' })
      ]);

      // Traitement des résultats avec gestion d'erreurs
      const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : [];
      const messagesCount = messagesResult.status === 'fulfilled' ? messagesResult.value.count || 0 : 0;
      const eventsCount = eventsResult.status === 'fulfilled' ? eventsResult.value.count || 0 : 0;
      const annoncesCount = annoncesResult.status === 'fulfilled' ? annoncesResult.value.count || 0 : 0;
      const blogCount = blogResult.status === 'fulfilled' ? blogResult.value.count || 0 : 0;

      // Agrégation optimisée des types d'utilisateurs
      const usersByType = profiles.reduce((acc, profile) => {
        acc[profile.profile_type] = (acc[profile.profile_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Évaluation de la santé du système (simplifié)
      const systemHealth = {
        database: 'ok' as const,
        security: 'warning' as const, // À cause des alertes Supabase
        performance: 'warning' as const // À optimiser
      };

      return {
        totalUsers: profiles.length,
        usersByType,
        messagesLastWeek: messagesCount,
        publishedEvents: eventsCount,
        publishedAnnonces: annoncesCount,
        blogPosts: blogCount,
        pendingModeration: 0, // TODO: Implémenter le calcul
        systemHealth
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook pour les métriques en temps réel (plus fréquentes)
export function useRealtimeMetrics() {
  return useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      const { count: recentMessages } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { count: onlineUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      return {
        recentMessages: recentMessages || 0,
        onlineUsers: onlineUsers || 0,
        systemLoad: Math.random() * 100, // Simulation
        lastUpdate: new Date().toISOString()
      };
    },
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 60 * 1000, // Refresh toutes les minutes
    retry: 1
  });
}

// Hook pour l'activité récente (optimisé)
export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const [messages, events, annonces] = await Promise.all([
        supabase
          .from('messages')
          .select('id, content, created_at, sender_id')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('events')
          .select('id, title, created_at, status')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('annonces')
          .select('id, title, created_at, status')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      return {
        messages: messages.data || [],
        events: events.data || [],
        annonces: annonces.data || []
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
}