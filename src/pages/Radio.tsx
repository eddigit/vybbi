import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Radio, 
  Music, 
  Users, 
  Clock, 
  Headphones,
  Mic,
  Volume2,
  Signal
} from 'lucide-react';
import { RadioControls } from '@/components/RadioControls';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { useRadioRequests } from '@/hooks/useRadioRequests';

export default function RadioPage() {
  const { currentTrack, isPlaying } = useRadioPlayer();
  const { queue, requests } = useRadioRequests();

  const liveStats = {
    listeners: 1247, // Simulation - à remplacer par de vraies données
    uptime: '12h 34m',
    quality: '320 kbps',
    status: 'live'
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <Radio className="h-12 w-12 text-primary" />
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Radio Vybbi
            </h1>
            <p className="text-muted-foreground">
              La radio des artistes indépendants
            </p>
          </div>
        </div>

        {/* Status en direct */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={isPlaying ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
              {isPlaying ? 'EN DIRECT' : 'HORS LIGNE'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            {liveStats.listeners.toLocaleString()} auditeurs
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Volume2 className="h-4 w-4" />
            {liveStats.quality}
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {liveStats.uptime}
          </div>
        </div>
      </div>

      {/* Morceau en cours */}
      {currentTrack && (
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              En cours de diffusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                <AvatarImage
                  src={currentTrack.artist.avatar_url || ''}
                  alt={`Avatar ${currentTrack.artist.display_name}`}
                />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-lg">
                  {currentTrack.artist.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-lg text-muted-foreground truncate">
                  {currentTrack.artist.display_name}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="bg-primary/10">
                    <Music className="h-3 w-3 mr-1" />
                    Radio Vybbi
                  </Badge>
                  
                  {isPlaying && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Signal className="h-4 w-4 text-green-500" />
                      Diffusion en cours
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En file d'attente</p>
                <p className="text-2xl font-bold">{queue.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Demandes actives</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Mic className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auditeurs</p>
                <p className="text-2xl font-bold">{liveStats.listeners.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles et demandes */}
      <RadioControls />

      {/* Informations sur la radio */}
      <Card>
        <CardHeader>
          <CardTitle>À propos de Radio Vybbi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Radio Vybbi est la première radio dédiée aux artistes indépendants. 
            Découvrez de nouveaux talents, soutenez vos artistes préférés et 
            participez à la programmation en demandant vos morceaux favoris.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Comment ça marche ?</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Demandez vos morceaux préférés</li>
                <li>• Votez pour prioriser les demandes</li>
                <li>• Découvrez de nouveaux artistes</li>
                <li>• Soutenez la scène indépendante</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Fonctionnalités</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Diffusion 24h/24, 7j/7</li>
                <li>• Qualité audio haute définition</li>
                <li>• File d'attente interactive</li>
                <li>• Système de votes communautaire</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}