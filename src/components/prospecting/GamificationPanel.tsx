import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGamification } from '@/hooks/useGamification';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Medal,
  TrendingUp,
  Calendar,
  Users,
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export function GamificationPanel() {
  const { userStats, leaderboard, challenges, loading, completeChallenge } = useGamification();
  const [selectedTab, setSelectedTab] = useState('dashboard');

  if (loading || !userStats) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="h-32 bg-muted/50" />
        <Card className="h-64 bg-muted/50" />
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
      case 'epic': return 'text-purple-500 border-purple-500/30 bg-purple-500/5';
      case 'rare': return 'text-blue-500 border-blue-500/30 bg-blue-500/5';
      default: return 'text-green-500 border-green-500/30 bg-green-500/5';
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && challenge.progress >= challenge.target) {
      await completeChallenge(challengeId);
      toast.success(`Défi "${challenge.title}" terminé ! +${challenge.reward} points 🎉`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats utilisateur globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{userStats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Points Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/20">
                <Star className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">Niveau {userStats.level}</div>
                <div className="text-sm text-muted-foreground">Rang #{userStats.rank}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/20">
                <Flame className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{userStats.streak}</div>
                <div className="text-sm text-muted-foreground">Jours de Suite</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/20">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {userStats.badges.filter(b => b.unlockedAt).length}
                </div>
                <div className="text-sm text-muted-foreground">Badges Débloqués</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Objectifs
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Medal className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Défis
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Classement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Objectifs de la Semaine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Prospects contactés</span>
                    <span>{userStats.weeklyProgress}/{userStats.weeklyGoal}</span>
                  </div>
                  <Progress value={(userStats.weeklyProgress / userStats.weeklyGoal) * 100} />
                </div>
                
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-sm font-medium">Prochain palier</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Plus que {userStats.weeklyGoal - userStats.weeklyProgress} prospects pour débloquer un bonus !
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Objectifs du Mois
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Performance mensuelle</span>
                    <span>{userStats.monthlyProgress}/{userStats.monthlyGoal}</span>
                  </div>
                  <Progress value={(userStats.monthlyProgress / userStats.monthlyGoal) * 100} />
                </div>
                
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-sm font-medium text-primary">Excellent rythme !</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Vous êtes en avance sur vos objectifs mensuels de {Math.round(((userStats.monthlyProgress / userStats.monthlyGoal) - 0.5) * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collection de Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userStats.badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      badge.unlockedAt 
                        ? `${getRarityColor(badge.rarity)} shadow-sm` 
                        : 'bg-muted/30 border-muted opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {badge.description}
                      </div>
                      
                      {badge.unlockedAt ? (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Débloqué le {badge.unlockedAt.toLocaleDateString()}
                        </Badge>
                      ) : (
                        <div className="mt-3">
                          <Progress 
                            value={((badge.progress || 0) / (badge.target || 100)) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {badge.progress || 0} / {badge.target || 100}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-4">
            {challenges.map((challenge, index) => (
              <Card 
                key={index} 
                className={`transition-all duration-300 ${
                  challenge.completed 
                    ? 'bg-success/5 border-success/20' 
                    : challenge.progress >= challenge.target
                    ? 'bg-warning/5 border-warning/20'
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        challenge.type === 'daily' ? 'bg-primary/20' :
                        challenge.type === 'weekly' ? 'bg-secondary/20' :
                        'bg-accent/20'
                      }`}>
                        {challenge.type === 'daily' && <Calendar className="w-4 h-4 text-primary" />}
                        {challenge.type === 'weekly' && <Target className="w-4 h-4 text-secondary" />}
                        {challenge.type === 'monthly' && <Trophy className="w-4 h-4 text-accent" />}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {challenge.title}
                          {challenge.completed && <CheckCircle2 className="w-4 h-4 text-success" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {challenge.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {challenge.type === 'daily' ? 'Quotidien' :
                             challenge.type === 'weekly' ? 'Hebdomadaire' :
                             'Mensuel'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            +{challenge.reward} points
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {challenge.progress} / {challenge.target}
                      </div>
                      <Progress 
                        value={(challenge.progress / challenge.target) * 100} 
                        className="w-24 h-2 mt-1"
                      />
                      {challenge.progress >= challenge.target && !challenge.completed && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteChallenge(challenge.id)}
                          className="mt-2"
                        >
                          Réclamer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Classement de l'Équipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.userId}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                      user.userId === userStats.userId 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index < 3 ? (
                          index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                        ) : (
                          user.rank
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          Niveau {user.level} • Série: {user.streak} jours
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-primary">{user.totalPoints}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}