import React, { useState, useEffect } from 'react';
import { YouTubePlayer, extractYouTubeVideoId, getYouTubeThumbnail } from '@/components/YouTubePlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Play, Users, MessageSquare, Share2, Radio } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { AutoTranslate } from '@/components/AutoTranslate';
import { useTranslate } from '@/hooks/useTranslate';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WebTVChat } from '@/components/WebTVChat';
import { WebTVScheduler } from '@/components/WebTVScheduler';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WebTVEvent {
  id: string;
  title: string;
  description?: string;
  youtube_video_id?: string;
  scheduled_for: string;
  is_live: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function WebTV() {
  const [currentEvent, setCurrentEvent] = useState<WebTVEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<WebTVEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<WebTVEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [showChat, setShowChat] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { translatedText: pageTitle } = useTranslate("Vybbi Web TV");
  const { translatedText: pageDescription } = useTranslate("Découvrez les talents émergents en direct sur Vybbi Web TV");

  useEffect(() => {
    fetchEvents();
    
    // Simulate viewer count updates
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 10) - 4));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('webtv_events' as any)
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      const now = new Date();
      const events = (data as any[]) || [];
      
      // Find current live event
      const live = events.find((event: any) => 
        event.is_live && new Date(event.scheduled_for) <= now
      );
      
      // Filter upcoming and past events
      const upcoming = events.filter((event: any) => 
        !event.is_live && new Date(event.scheduled_for) > now
      );
      
      const past = events.filter((event: any) => 
        new Date(event.scheduled_for) < now && !event.is_live
      );

      setCurrentEvent(live as WebTVEvent || null);
      setUpcomingEvents(upcoming.slice(0, 5) as WebTVEvent[]);
      setPastEvents(past.slice(0, 10) as WebTVEvent[]);
      setViewerCount(Math.floor(Math.random() * 50) + 20);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Vybbi Web TV',
        text: 'Découvrez les talents émergents en direct !',
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "L'URL a été copiée dans le presse-papiers"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="aspect-video bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={pageTitle}
        description={pageDescription}
        keywords="web tv, streaming, talents, musique, live"
      />
      
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-full">
              <Radio className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                <AutoTranslate text="Vybbi Web TV" />
              </h1>
              <p className="text-muted-foreground">
                <AutoTranslate text="Découvrez les talents émergents en direct" />
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              <AutoTranslate text="Partager" />
            </Button>
            {profile?.profile_type === 'artist' && (
              <WebTVScheduler onEventCreated={fetchEvents} />
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-3">
            {currentEvent ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <YouTubePlayer
                    videoId={currentEvent.youtube_video_id || ''}
                    className="w-full"
                    autoplay={true}
                    onPlay={() => console.log('Video started')}
                  />
                  
                  {/* Live Event Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="animate-pulse">
                          🔴 <AutoTranslate text="EN DIRECT" />
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{viewerCount}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChat(!showChat)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <AutoTranslate text="Chat" />
                      </Button>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold">{currentEvent.title}</h2>
                      <p className="text-muted-foreground text-sm">
                        <AutoTranslate text="Événement Web TV" />
                      </p>
                      {currentEvent.description && (
                        <p className="text-sm mt-2">{currentEvent.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="bg-muted rounded-full p-4 w-fit mx-auto mb-4">
                    <Radio className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    <AutoTranslate text="Aucun événement en direct" />
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    <AutoTranslate text="Consultez la programmation ci-dessous pour les prochains événements" />
                  </p>
                  {upcomingEvents.length > 0 && (
                    <p className="text-sm">
                      <AutoTranslate text="Prochain événement" />: {' '}
                      <span className="font-medium">{upcomingEvents[0].title}</span>
                      {' '}
                      <AutoTranslate text="dans" /> {formatDistanceToNow(new Date(upcomingEvents[0].scheduled_for), { locale: fr })}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Programming Tabs */}
            <Tabs defaultValue="upcoming" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">
                  <AutoTranslate text="À venir" />
                </TabsTrigger>
                <TabsTrigger value="past">
                  <AutoTranslate text="Replays" />
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4 mt-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-24 h-16 bg-muted rounded overflow-hidden">
                            {event.youtube_video_id ? (
                              <img 
                                src={getYouTubeThumbnail(event.youtube_video_id, 'medium')} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              <AutoTranslate text="Web TV Event" />
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.scheduled_for).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(event.scheduled_for).toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        <AutoTranslate text="Aucun événement programmé pour le moment" />
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="past" className="space-y-4 mt-4">
                {pastEvents.length > 0 ? (
                  pastEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-24 h-16 bg-muted rounded overflow-hidden">
                            {event.youtube_video_id && (
                              <img 
                                src={getYouTubeThumbnail(event.youtube_video_id, 'medium')}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              <AutoTranslate text="Web TV Event" />
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.scheduled_for).toLocaleDateString('fr-FR')}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                <AutoTranslate text="Replay" />
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        <AutoTranslate text="Aucun replay disponible" />
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            {showChat && currentEvent && (
              <WebTVChat 
                eventId={currentEvent.id}
                eventTitle={currentEvent.title}
                isLive={currentEvent.is_live}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}