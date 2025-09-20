import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  Clock, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Star,
  Play,
  Radio,
  Timer
} from 'lucide-react';
import { useRadioRequests, RadioQueue as RadioQueueType } from '@/hooks/useRadioRequests';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RadioQueueProps {
  className?: string;
  showVoting?: boolean;
  maxItems?: number;
}

export function RadioQueue({ 
  className = '', 
  showVoting = true, 
  maxItems = 10 
}: RadioQueueProps) {
  const { queue, loading, voteForRequest, getUserVote } = useRadioRequests();
  const [userVotes, setUserVotes] = useState<Record<string, string | null>>({});

  // Load user votes for visible requests
  useEffect(() => {
    const loadUserVotes = async () => {
      const votes: Record<string, string | null> = {};
      for (const item of queue.slice(0, maxItems)) {
        if (item.request_id) {
          const vote = await getUserVote(item.request_id);
          votes[item.request_id] = vote;
        }
      }
      setUserVotes(votes);
    };

    if (queue.length > 0) {
      loadUserVotes();
    }
  }, [queue, getUserVote, maxItems]);

  const handleVote = async (requestId: string, voteType: 'up' | 'down') => {
    const success = await voteForRequest(requestId, voteType);
    if (success) {
      // Update local vote state
      const currentVote = userVotes[requestId];
      const newVote = currentVote === voteType ? null : voteType;
      setUserVotes(prev => ({ ...prev, [requestId]: newVote }));
    }
  };

  const getEstimatedWaitTime = (position: number) => {
    // Estimate 3-4 minutes per song
    const avgSongDuration = 3.5; // minutes
    const waitMinutes = position * avgSongDuration;
    
    if (waitMinutes < 60) {
      return `~${Math.round(waitMinutes)} min`;
    } else {
      const hours = Math.floor(waitMinutes / 60);
      const minutes = Math.round(waitMinutes % 60);
      return `~${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
  };

  const getPriorityBadge = (isPriority: boolean, votesCount: number) => {
    if (isPriority) {
      return <Badge variant="destructive" className="text-xs">Priorité</Badge>;
    }
    if (votesCount > 5) {
      return <Badge variant="default" className="text-xs">Populaire</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            File d'attente Radio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayQueue = queue.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            File d'attente Radio
          </div>
          <Badge variant="outline" className="text-xs">
            {queue.length} demande{queue.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {displayQueue.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune demande en attente</p>
              <p className="text-xs mt-1">
                Soyez le premier à demander un morceau !
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {displayQueue.map((item, index) => (
                <div key={item.queue_id}>
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Position */}
                      <div className="flex flex-col items-center gap-1 min-w-[40px]">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${index === 0 
                            ? 'bg-gradient-primary text-white' 
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          {index === 0 ? <Play className="h-4 w-4" /> : index + 1}
                        </div>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs px-1">
                            En cours
                          </Badge>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-12 w-12 rounded-lg">
                              <AvatarImage 
                                src={item.artist_avatar} 
                                alt={item.artist_name}
                                className="rounded-lg"
                              />
                              <AvatarFallback className="rounded-lg">
                                <Music className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">
                                {item.file_name?.replace(/\.[^/.]+$/, '') || 'Titre inconnu'}
                              </h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.artist_name}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-1">
                                {getPriorityBadge(item.is_priority, item.votes_count)}
                                
                                {item.requester_name && (
                                  <span className="text-xs text-muted-foreground">
                                    Demandé par {item.requester_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Wait Time */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Timer className="h-3 w-3" />
                              {getEstimatedWaitTime(index)}
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        {item.message && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            <div className="flex items-start gap-1">
                              <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground" />
                              <span className="text-muted-foreground italic">
                                "{item.message}"
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Voting */}
                        {showVoting && item.request_id && (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={userVotes[item.request_id] === 'up' ? 'default' : 'outline'}
                                onClick={() => handleVote(item.request_id!, 'up')}
                                className="h-7 px-2"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              
                              <span className="text-sm font-medium min-w-[20px] text-center">
                                {item.votes_count}
                              </span>
                              
                              <Button
                                size="sm"
                                variant={userVotes[item.request_id] === 'down' ? 'destructive' : 'outline'}
                                onClick={() => handleVote(item.request_id!, 'down')}
                                className="h-7 px-2"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              Votez pour prioriser
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < displayQueue.length - 1 && (
                    <Separator className="mx-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {queue.length > maxItems && (
          <div className="p-4 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground text-center">
              Et {queue.length - maxItems} autre{queue.length - maxItems > 1 ? 's' : ''} demande{queue.length - maxItems > 1 ? 's' : ''} en attente...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}