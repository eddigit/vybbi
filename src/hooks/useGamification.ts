import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'prospect' | 'conversion' | 'activity' | 'teamwork';
  achievedAt: Date;
}

export interface UserStats {
  userId: string;
  displayName: string;
  avatar?: string;
  totalPoints: number;
  level: number;
  rank: number;
  badges: Badge[];
  achievements: Achievement[];
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  progress: number;
  reward: number;
  expiresAt: Date;
  completed: boolean;
}

export function useGamification() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  const predefinedBadges: Badge[] = [
    {
      id: 'hot-prospect-hunter',
      name: 'Hot Prospect Hunter',
      description: 'Identifié 10 prospects chauds ce mois',
      icon: '🔥',
      rarity: 'common',
      target: 10
    },
    {
      id: 'conversion-king',
      name: 'Conversion King',
      description: 'Converti 5 prospects en clients',
      icon: '👑',
      rarity: 'rare',
      target: 5
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Répondu à 50 prospects en moins de 2h',
      icon: '⚡',
      rarity: 'epic',
      target: 50
    },
    {
      id: 'ai-whisperer',
      name: 'AI Whisperer',
      description: 'Suivi 95% des recommandations IA',
      icon: '🤖',
      rarity: 'legendary',
      target: 95
    },
    {
      id: 'team-player',
      name: 'Team Player',
      description: 'Aidé 3 collègues ce mois',
      icon: '🤝',
      rarity: 'common',
      target: 3
    },
    {
      id: 'marathon-runner',
      name: 'Marathon Runner',
      description: '30 jours de suite d\'activité',
      icon: '🏃‍♂️',
      rarity: 'epic',
      target: 30
    }
  ];

  const calculateLevel = (points: number): number => {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  };

  const generateDailyChallenges = (): Challenge[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      {
        id: `daily-contacts-${today.toDateString()}`,
        title: 'Contact Master',
        description: 'Contacter 5 nouveaux prospects',
        type: 'daily',
        target: 5,
        progress: Math.floor(Math.random() * 3),
        reward: 50,
        expiresAt: tomorrow,
        completed: false
      },
      {
        id: `daily-follow-up-${today.toDateString()}`,
        title: 'Follow-up Hero',
        description: 'Effectuer 3 relances',
        type: 'daily',
        target: 3,
        progress: Math.floor(Math.random() * 2),
        reward: 30,
        expiresAt: tomorrow,
        completed: false
      }
    ];
  };

  const generateWeeklyChallenges = (): Challenge[] => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: `weekly-conversion-${Date.now()}`,
        title: 'Conversion Champion',
        description: 'Convertir 2 prospects cette semaine',
        type: 'weekly',
        target: 2,
        progress: Math.floor(Math.random() * 2),
        reward: 200,
        expiresAt: nextWeek,
        completed: false
      },
      {
        id: `weekly-ai-adoption-${Date.now()}`,
        title: 'AI Adopter',
        description: 'Suivre 10 recommandations IA',
        type: 'weekly',
        target: 10,
        progress: Math.floor(Math.random() * 7),
        reward: 150,
        expiresAt: nextWeek,
        completed: false
      }
    ];
  };

  const fetchUserStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Simuler les stats utilisateur avec données réelles
      const { data: prospects } = await supabase
        .from('prospects')
        .select('*')
        .eq('assigned_agent_id', user.id);

      const { data: conversions } = await supabase
        .from('conversion_tracking')
        .select('*')
        .eq('agent_id', user.id);

      const prospectsCount = prospects?.length || 0;
      const conversionsCount = conversions?.length || 0;
      
      const totalPoints = (prospectsCount * 10) + (conversionsCount * 100) + Math.floor(Math.random() * 500);
      const level = calculateLevel(totalPoints);
      
      // Calculer les badges débloqués
      const unlockedBadges = predefinedBadges.map(badge => ({
        ...badge,
        progress: Math.floor(Math.random() * (badge.target || 100)),
        unlockedAt: Math.random() > 0.7 ? new Date() : undefined
      }));

      const stats: UserStats = {
        userId: user.id,
        displayName: user.email?.split('@')[0] || 'Agent',
        totalPoints,
        level,
        rank: Math.floor(Math.random() * 10) + 1,
        badges: unlockedBadges,
        achievements: [],
        streak: Math.floor(Math.random() * 15) + 1,
        weeklyGoal: 100,
        weeklyProgress: Math.floor(Math.random() * 100),
        monthlyGoal: 500,
        monthlyProgress: Math.floor(Math.random() * 500)
      };

      setUserStats(stats);

      // Générer challenges
      const dailyChallenges = generateDailyChallenges();
      const weeklyChallenges = generateWeeklyChallenges();
      setChallenges([...dailyChallenges, ...weeklyChallenges]);

    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLeaderboard = async () => {
    try {
      // Générer un leaderboard simulé
      const mockUsers = [
        { name: 'Marie Dupont', points: 2450, level: 15 },
        { name: 'Pierre Martin', points: 2200, level: 14 },
        { name: 'Sophie Lefebvre', points: 1980, level: 13 },
        { name: 'Jean Moreau', points: 1750, level: 12 },
        { name: 'Emma Bernard', points: 1650, level: 12 }
      ];

      const leaderboardData: UserStats[] = mockUsers.map((mockUser, index) => ({
        userId: `user-${index}`,
        displayName: mockUser.name,
        totalPoints: mockUser.points,
        level: mockUser.level,
        rank: index + 1,
        badges: [],
        achievements: [],
        streak: Math.floor(Math.random() * 20),
        weeklyGoal: 100,
        weeklyProgress: Math.floor(Math.random() * 100),
        monthlyGoal: 500,
        monthlyProgress: Math.floor(Math.random() * 500)
      }));

      // Insérer l'utilisateur actuel s'il n'est pas dans le top 5
      if (userStats && !leaderboardData.find(u => u.userId === userStats.userId)) {
        leaderboardData.push({
          ...userStats,
          rank: leaderboardData.length + 1
        });
      }

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error generating leaderboard:', error);
    }
  };

  const completeChallenge = async (challengeId: string) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completed: true, progress: challenge.target }
          : challenge
      )
    );

    // Ajouter les points à l'utilisateur
    if (userStats) {
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        setUserStats(prev => prev ? {
          ...prev,
          totalPoints: prev.totalPoints + challenge.reward,
          level: calculateLevel(prev.totalPoints + challenge.reward)
        } : null);
      }
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (userStats) {
      setUserStats(prev => prev ? {
        ...prev,
        badges: prev.badges.map(badge => 
          badge.id === badgeId 
            ? { ...badge, unlockedAt: new Date() }
            : badge
        )
      } : null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserStats();
      generateLeaderboard();
    }
  }, [user]);

  return {
    userStats,
    leaderboard,
    challenges,
    loading,
    refetch: fetchUserStats,
    completeChallenge,
    unlockBadge
  };
}