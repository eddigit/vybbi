import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MusicPlayer } from '@/components/MusicPlayer';
import { 
  Music, 
  Play, 
  Calendar, 
  Clock, 
  Eye,
  Heart,
  Users,
  ExternalLink,
  Award,
  Video
} from 'lucide-react';
import { useMusicReleases, MusicRelease } from '@/hooks/useMusicReleases';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MusicDiscographyProps {
  profileId: string;
  isOwner?: boolean;
}

interface MusicReleaseWithAssets extends Omit<MusicRelease, 'featured_artists'> {
  featured_artists: any[] | any;
  media_assets?: Array<{
    id: string;
    file_url: string;
    file_name: string;
    preview_url?: string;
    duration_seconds?: number;
  }>;
  music_collaborators?: Array<{
    id: string;
    collaborator_name: string;
    role: string;
    royalty_percentage: number;
  }>;
}

export const MusicDiscography: React.FC<MusicDiscographyProps> = ({
  profileId,
  isOwner = false
}) => {
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

  const { data: releases = [], isLoading, error } = useMusicReleases(
    profileId, 
    isOwner ? 'all' : 'published'
  );

  const publishedReleases = releases?.filter(r => r.status === 'published') || [];
  const draftReleases = releases?.filter(r => r.status === 'draft') || [];

  const playTrack = (track: any, playlist: any[] = []) => {
    setSelectedTrack(track);
    const trackIndex = playlist.findIndex((t: any) => t.id === track.id);
    setCurrentPlaylistIndex(trackIndex >= 0 ? trackIndex : 0);
    setIsPlayerOpen(true);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ReleaseCard: React.FC<{ 
    release: any; 
    showStatus?: boolean;
    onClick?: () => void;
  }> = ({ release, showStatus = false, onClick }) => (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md group",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
            <div className="relative">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage src={release.cover_image_url} alt={release.title} />
              <AvatarFallback className="rounded-lg">
                <Music className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            {/* Video indicator */}
            {release.youtube_url && (
              <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Video className="h-3 w-3" />
              </div>
            )}
            
            <Button
              size="sm"
              className="absolute inset-0 m-auto h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                playTrack(release, publishedReleases);
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">{release.title}</h3>
                <p className="text-muted-foreground truncate">{release.artist_name}</p>
                {release.album_name && (
                  <p className="text-sm text-muted-foreground truncate">{release.album_name}</p>
                )}
              </div>

              {showStatus && (
                <Badge 
                  variant={
                    release.status === 'published' ? 'default' : 
                    release.status === 'draft' ? 'secondary' : 
                    'outline'
                  }
                >
                  {release.status === 'published' ? 'Publié' : 
                   release.status === 'draft' ? 'Brouillon' : 
                   'Privé'}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {release.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(release.release_date), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </div>
              )}
              
              {release.duration_seconds && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(release.duration_seconds)}
                </div>
              )}

              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {release.plays_count}
              </div>

              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {release.likes_count}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {release.genre && <Badge variant="secondary">{release.genre}</Badge>}
              {release.explicit_content && <Badge variant="destructive">Explicit</Badge>}
              {release.youtube_url && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Video className="h-3 w-3 mr-1" />
                  Vidéo
                </Badge>
              )}
              {release.is_original_composition && (
                <Badge variant="outline">
                  <Award className="h-3 w-3 mr-1" />
                  Original
                </Badge>
              )}
            </div>

            {release.music_collaborators && release.music_collaborators.length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {release.music_collaborators.map(c => c.collaborator_name).join(', ')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TrackDetail: React.FC<{ release: any }> = ({ release }) => (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <Avatar className="h-32 w-32 rounded-lg">
          <AvatarImage src={release.cover_image_url} alt={release.title} />
          <AvatarFallback className="rounded-lg">
            <Music className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{release.title}</h2>
            <p className="text-xl text-muted-foreground">{release.artist_name}</p>
            {release.album_name && (
              <p className="text-muted-foreground">Album: {release.album_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {release.release_date && (
              <div>
                <p className="font-medium">Sortie</p>
                <p className="text-muted-foreground">
                  {new Date(release.release_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
            {release.genre && (
              <div>
                <p className="font-medium">Genre</p>
                <p className="text-muted-foreground">{release.genre}</p>
              </div>
            )}
            {release.bpm && (
              <div>
                <p className="font-medium">BPM</p>
                <p className="text-muted-foreground">{release.bpm}</p>
              </div>
            )}
            {release.key_signature && (
              <div>
                <p className="font-medium">Tonalité</p>
                <p className="text-muted-foreground">{release.key_signature}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => playTrack(release, publishedReleases)}>
              <Play className="h-4 w-4 mr-2" />
              Écouter
            </Button>
            
            {(release.spotify_url || release.apple_music_url || release.soundcloud_url) && (
              <div className="flex gap-2">
                {release.spotify_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={release.spotify_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Spotify
                    </a>
                  </Button>
                )}
                {release.apple_music_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={release.apple_music_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apple Music
                    </a>
                  </Button>
                )}
                {release.soundcloud_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={release.soundcloud_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      SoundCloud
                    </a>
                  </Button>
                )}
                {release.youtube_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={release.youtube_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      YouTube
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright Information */}
      {(release.copyright_owner || release.isrc_code || release.label) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations légales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {release.copyright_owner && (
              <div>
                <p className="font-medium">Propriétaire des droits</p>
                <p className="text-muted-foreground">{release.copyright_owner}</p>
              </div>
            )}
            {release.isrc_code && (
              <div>
                <p className="font-medium">Code ISRC</p>
                <p className="text-muted-foreground">{release.isrc_code}</p>
              </div>
            )}
            {release.label && (
              <div>
                <p className="font-medium">Label</p>
                <p className="text-muted-foreground">{release.label}</p>
              </div>
            )}
            {release.distribution_service && (
              <div>
                <p className="font-medium">Distribution</p>
                <p className="text-muted-foreground">{release.distribution_service}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Collaborators */}
      {release.music_collaborators && release.music_collaborators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Collaborateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {release.music_collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{collaborator.collaborator_name}</p>
                    <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                  </div>
                  {collaborator.royalty_percentage > 0 && (
                    <Badge variant="outline">
                      {collaborator.royalty_percentage}% royalties
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lyrics */}
      {release.lyrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paroles</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {release.lyrics}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Music className="h-8 w-8 mx-auto mb-2" />
            <p>Erreur lors du chargement de la discographie</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (releases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Music className="h-8 w-8 mx-auto mb-2" />
            <p>Aucune sortie musicale pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Discographie
            <Badge variant="secondary">{releases.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <Tabs defaultValue="published" className="w-full">
              <TabsList>
                <TabsTrigger value="published">
                  Publié ({publishedReleases.length})
                </TabsTrigger>
                <TabsTrigger value="drafts">
                  Brouillons ({draftReleases.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="published" className="space-y-4 mt-4">
                {publishedReleases.map((release) => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    onClick={() => {
                      setSelectedTrack(release);
                      setIsPlayerOpen(true);
                    }}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="drafts" className="space-y-4 mt-4">
                {draftReleases.map((release) => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    showStatus
                    onClick={() => {
                      setSelectedTrack(release);
                      setIsPlayerOpen(true);
                    }}
                  />
                ))}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {publishedReleases.map((release) => (
                <ReleaseCard
                  key={release.id}
                  release={release}
                  onClick={() => {
                    setSelectedTrack(release);
                    setIsPlayerOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Track Detail Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la piste</DialogTitle>
          </DialogHeader>
          
          {selectedTrack && (
            <div className="space-y-6">
              <TrackDetail release={selectedTrack} />
              
              <MusicPlayer
                track={selectedTrack as any}
                playlist={publishedReleases as any}
                currentIndex={currentPlaylistIndex}
                onTrackChange={(index) => {
                  setCurrentPlaylistIndex(index);
                  setSelectedTrack(publishedReleases[index]);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};