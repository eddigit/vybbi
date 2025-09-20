import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Radio, 
  Music, 
  Plus, 
  Clock, 
  Users, 
  TrendingUp,
  ListMusic,
  MessageSquare
} from 'lucide-react';
import { RadioQueue } from '@/components/RadioQueue';
import { RadioRequestDialog } from '@/components/RadioRequestDialog';
import { useRadioRequests } from '@/hooks/useRadioRequests';
import { useAuth } from '@/hooks/useAuth';

interface RadioControlsProps {
  className?: string;
}

export function RadioControls({ className = '' }: RadioControlsProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const { queue, requests, loading } = useRadioRequests();
  const { user } = useAuth();

  const stats = {
    totalRequests: requests.length,
    queueLength: queue.length,
    averageWaitTime: queue.length * 3.5, // minutes
    activeUsers: new Set(requests.map(r => r.requester_id)).size
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header avec stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Radio Vybbi - Demandes
            </div>
            <Button 
              onClick={() => setShowRequestDialog(true)}
              className="bg-gradient-primary hover:opacity-90"
              disabled={!user}
            >
              <Plus className="h-4 w-4 mr-2" />
              Faire une demande
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ListMusic className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{stats.queueLength}</span>
              </div>
              <p className="text-xs text-muted-foreground">En file d'attente</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.totalRequests}</span>
              </div>
              <p className="text-xs text-muted-foreground">Demandes totales</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">
                  {stats.averageWaitTime < 60 
                    ? `${Math.round(stats.averageWaitTime)}m`
                    : `${Math.round(stats.averageWaitTime / 60)}h`
                  }
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Temps d'attente</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.activeUsers}</span>
              </div>
              <p className="text-xs text-muted-foreground">Utilisateurs actifs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" />
            File d'attente
            {queue.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {queue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Demandes populaires
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-6">
          <RadioQueue 
            showVoting={true}
            maxItems={15}
            className="border-0 shadow-none"
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Demandes les plus populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="w-16 h-6 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune demande pour le moment</p>
                  <p className="text-xs mt-1">
                    Soyez le premier à faire une demande !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests
                    .sort((a, b) => b.votes_count - a.votes_count)
                    .slice(0, 10)
                    .map((request) => (
                      <div key={request.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {request.media_asset?.file_name?.replace(/\.[^/.]+$/, '') || 'Titre inconnu'}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {request.artist?.display_name || 'Artiste inconnu'}
                          </p>
                          {request.message && (
                            <p className="text-xs text-muted-foreground italic mt-1 truncate">
                              "{request.message}"
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {request.votes_count} vote{request.votes_count > 1 ? 's' : ''}
                          </Badge>
                          {request.is_priority && (
                            <Badge variant="destructive" className="text-xs ml-1">
                              Priorité
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de demande */}
      <RadioRequestDialog 
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
      />
    </div>
  );
}