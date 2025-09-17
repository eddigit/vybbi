import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { 
  UserCheck, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Users,
  ArrowRight 
} from 'lucide-react';

export function QuickTestActions() {
  const { user, profile } = useAuth();

  const testScenarios = [
    {
      title: "Inscription Artiste",
      description: "Tester le processus complet d'inscription pour un artiste",
      action: "/auth?tab=signup",
      icon: <UserCheck className="h-4 w-4" />,
      status: !user ? 'available' : 'completed'
    },
    {
      title: "Inscription Lieu",
      description: "Tester l'inscription et l'onboarding d'un lieu",
      action: "/auth?tab=signup",
      icon: <Settings className="h-4 w-4" />,
      status: !user ? 'available' : 'completed'
    },
    {
      title: "Messagerie",
      description: "Tester l'envoi et la réception de messages",
      action: "/messages",
      icon: <MessageSquare className="h-4 w-4" />,
      status: user ? 'available' : 'requires-auth'
    },
    {
      title: "Dashboard",
      description: "Vérifier l'affichage du tableau de bord",
      action: "/dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      status: user ? 'available' : 'requires-auth'
    },
    {
      title: "Recherche Profils",
      description: "Tester la recherche et la découverte d'autres utilisateurs",
      action: "/profiles",
      icon: <Users className="h-4 w-4" />,
      status: 'available'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'requires-auth': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'completed': return 'Déjà fait';
      case 'requires-auth': return 'Auth requise';
      default: return 'Inconnu';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tests Rapides
          {user && <Badge variant="outline">{profile?.profile_type} - {profile?.display_name}</Badge>}
        </CardTitle>
        <CardDescription>
          Actions rapides pour tester les fonctionnalités critiques de l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testScenarios.map((scenario, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {scenario.icon}
                  <h3 className="font-semibold">{scenario.title}</h3>
                </div>
                <Badge className={getStatusColor(scenario.status)}>
                  {getStatusText(scenario.status)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {scenario.description}
              </p>
              
              <Button 
                asChild
                variant={scenario.status === 'available' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                disabled={scenario.status === 'completed'}
              >
                <a href={scenario.action} className="flex items-center justify-center gap-2">
                  {scenario.status === 'completed' ? 'Déjà testé' : 'Tester'}
                  {scenario.status !== 'completed' && <ArrowRight className="h-3 w-3" />}
                </a>
              </Button>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">📝 Test d'inscription recommandé</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Pour tester complètement l'application, créez un compte test avec chaque type de profil :
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span>• Artiste (DJ, Musicien, etc.)</span>
              <span>• Agent/Manager</span>
              <span>• Lieu/Établissement</span>
              <span>• Influenceur</span>
            </div>
          </div>
        )}

        {user && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ Utilisateur connecté</h4>
            <p className="text-sm text-green-700">
              Vous êtes connecté comme <strong>{profile?.display_name}</strong> 
              ({profile?.profile_type}). Testez maintenant la messagerie et les interactions !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}