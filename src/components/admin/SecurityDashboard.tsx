import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Users, Lock, Eye, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

interface SecurityEvent {
  id: string;
  user_id: string | null;
  action: string;
  metadata: any;
  created_at: string;
  table_name: string;
  record_id: string;
  ip_address: unknown;
  user_agent: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  attempt_time: string;
  success: boolean;
  failure_reason: string | null;
  blocked_until: string | null;
}

export const SecurityDashboard = () => {
  const { hasRole } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Only allow admins to access
  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous devez être administrateur pour accéder au tableau de bord de sécurité.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent security events
      const { data: events, error: eventsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) {
        console.error('Error fetching security events:', eventsError);
      } else {
        // Transform the data to match our interface
        const transformedEvents = (events || []).map(event => ({
          id: event.id,
          user_id: event.user_id,
          action: event.action,
          metadata: (event as any).metadata || {},
          created_at: event.created_at,
          table_name: event.table_name || '',
          record_id: event.record_id || '',
          ip_address: (event as any).ip_address || null,
          user_agent: (event as any).user_agent || ''
        }));
        setSecurityEvents(transformedEvents);
      }

      // Fetch recent login attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(100);

      if (attemptsError) {
        console.error('Error fetching login attempts:', attemptsError);
      } else {
        setLoginAttempts(attempts || []);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Erreur lors du chargement des données de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const cleanupOldData = async () => {
    try {
      // Clean up old login attempts
      await supabase.rpc('cleanup_old_login_attempts');
      
      // Clean up old notifications
      await supabase.rpc('cleanup_old_notifications');
      
      toast.success('Nettoyage effectué avec succès');
      fetchSecurityData();
    } catch (error) {
      console.error('Error cleaning up data:', error);
      toast.error('Erreur lors du nettoyage');
    }
  };

  const getEventIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'successful_login':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'login_error':
      case 'blocked_login_attempt':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'account_blocked':
        return <Lock className="h-4 w-4 text-orange-500" />;
      case 'sensitive_profile_access':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventBadge = (action: string) => {
    const isSecurityCritical = ['account_blocked', 'blocked_login_attempt', 'sensitive_profile_access'].includes(action.toLowerCase());
    const isError = action.toLowerCase().includes('error') || action.toLowerCase().includes('blocked');
    
    return (
      <Badge variant={isSecurityCritical ? 'destructive' : isError ? 'secondary' : 'default'}>
        {action.replace(/_/g, ' ').toLowerCase()}
      </Badge>
    );
  };

  const failedLogins = loginAttempts.filter(attempt => !attempt.success);
  const blockedAccounts = loginAttempts.filter(attempt => attempt.blocked_until && new Date(attempt.blocked_until) > new Date());
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p>Chargement des données de sécurité...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de Bord Sécurité</h2>
          <p className="text-muted-foreground">
            Surveillance et audit des événements de sécurité
          </p>
        </div>
        <Button onClick={cleanupOldData} variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Nettoyer les anciennes données
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Connexions réussies (24h)</p>
                <p className="text-2xl font-bold">
                  {loginAttempts.filter(a => a.success && new Date(a.attempt_time) > new Date(Date.now() - 24*60*60*1000)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Échecs de connexion (24h)</p>
                <p className="text-2xl font-bold">
                  {failedLogins.filter(a => new Date(a.attempt_time) > new Date(Date.now() - 24*60*60*1000)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Comptes bloqués</p>
                <p className="text-2xl font-bold">{blockedAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Événements de sécurité (24h)</p>
                <p className="text-2xl font-bold">
                  {securityEvents.filter(e => new Date(e.created_at) > new Date(Date.now() - 24*60*60*1000)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Événements de sécurité récents</span>
          </CardTitle>
          <CardDescription>
            Derniers événements de sécurité enregistrés dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getEventIcon(event.action)}
                  <div>
                    <div className="flex items-center space-x-2">
                      {getEventBadge(event.action)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    {event.metadata?.email && (
                      <p className="text-sm font-mono mt-1">{event.metadata.email}</p>
                    )}
                    {event.metadata?.error && (
                      <p className="text-sm text-red-600 mt-1">{event.metadata.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Login Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Tentatives de connexion récentes</CardTitle>
          <CardDescription>
            Historique des tentatives de connexion (réussies et échouées)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loginAttempts.slice(0, 50).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  {attempt.success ? (
                    <Shield className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-mono text-sm">{attempt.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.attempt_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={attempt.success ? 'default' : 'destructive'}>
                    {attempt.success ? 'Succès' : 'Échec'}
                  </Badge>
                  {attempt.blocked_until && (
                    <p className="text-xs text-orange-600 mt-1">
                      Bloqué jusqu'à {new Date(attempt.blocked_until).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};