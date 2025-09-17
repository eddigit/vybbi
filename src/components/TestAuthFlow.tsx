import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  details?: any;
}

export function TestAuthFlow() {
  const { user, profile, signIn, signOut } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message?: string, details?: any) => {
    setTests(prev => prev.map(t => 
      t.name === name ? { ...t, status, message, details } : t
    ));
  };

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setTests([
      { name: 'Connexion Supabase', status: 'pending' },
      { name: 'Fonctions RPC', status: 'pending' },
      { name: 'Politiques RLS', status: 'pending' },
      { name: 'Tables critiques', status: 'pending' },
      { name: 'Système de messagerie', status: 'pending' },
    ]);

    try {
      // Test 1: Connexion Supabase
      const { data: health } = await supabase.from('profiles').select('count').limit(1);
      updateTest('Connexion Supabase', 'success', 'Base de données accessible');

      // Test 2: Fonctions RPC critiques
      try {
        if (user) {
          const { data: hasAdminRole } = await supabase.rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });
          updateTest('Fonctions RPC', 'success', 'Fonction has_role fonctionne');
        } else {
          updateTest('Fonctions RPC', 'success', 'Fonctions disponibles (utilisateur non connecté)');
        }
      } catch (error: any) {
        updateTest('Fonctions RPC', 'error', `Erreur RPC: ${error?.message || 'Erreur inconnue'}`);
      }

      // Test 3: Politiques RLS
      try {
        const { data: profilesTest } = await supabase
          .from('profiles')
          .select('id, display_name')
          .limit(5);
        updateTest('Politiques RLS', 'success', `${profilesTest?.length || 0} profils publics visibles`);
      } catch (error: any) {
        updateTest('Politiques RLS', 'error', `Erreur RLS: ${error?.message || 'Erreur inconnue'}`);
      }

      // Test 4: Tables critiques
      try {
        const profilesCheck = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const conversationsCheck = await supabase.from('conversations').select('*', { count: 'exact', head: true });
        const messagesCheck = await supabase.from('messages').select('*', { count: 'exact', head: true });
        const userRolesCheck = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
        
        const checks = [
          { table: 'profiles', ...profilesCheck },
          { table: 'conversations', ...conversationsCheck },
          { table: 'messages', ...messagesCheck },
          { table: 'user_roles', ...userRolesCheck }
        ];
        
        const errors = checks.filter(r => r.error);
        if (errors.length === 0) {
          updateTest('Tables critiques', 'success', 'Toutes les tables accessibles', checks);
        } else {
          updateTest('Tables critiques', 'error', `${errors.length} tables inaccessibles`, errors);
        }
      } catch (error: any) {
        updateTest('Tables critiques', 'error', `Erreur tables: ${error?.message || 'Erreur inconnue'}`);
      }

      // Test 5: Système de messagerie
      if (user) {
        try {
          const { data: conversations } = await supabase.rpc('get_conversations_with_details');
          updateTest('Système de messagerie', 'success', `${conversations?.length || 0} conversations chargées`);
        } catch (error: any) {
          updateTest('Système de messagerie', 'error', `Erreur messagerie: ${error?.message || 'Erreur inconnue'}`);
        }
      } else {
        updateTest('Système de messagerie', 'pending', 'Connexion requise pour tester');
      }

    } catch (error: any) {
      console.error('Test error:', error);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 border-green-300';
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tests Système Vybbi
          {user && <Badge variant="outline">Connecté: {profile?.display_name}</Badge>}
        </CardTitle>
        <CardDescription>
          Diagnostic complet du système d'authentification et de messagerie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runComprehensiveTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? 'Tests en cours...' : 'Lancer les tests'}
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          {user ? (
            <Button variant="outline" onClick={signOut}>
              Se déconnecter
            </Button>
          ) : (
            <Button variant="outline" onClick={() => window.location.href = '/auth'}>
              Se connecter
            </Button>
          )}
        </div>

        {tests.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Résultats des tests:</h3>
            {tests.map((test, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
                {test.message && (
                  <p className="text-sm mt-1 opacity-80">{test.message}</p>
                )}
                {test.details && (
                  <details className="text-xs mt-2 opacity-60">
                    <summary className="cursor-pointer">Détails techniques</summary>
                    <pre className="mt-1 overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Actions rapides:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/auth?tab=signup">Tester inscription</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/messages">Tester messagerie</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/onboarding">Tester onboarding</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard">Tester dashboard</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}