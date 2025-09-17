import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MusicPlayer } from '@/components/MusicPlayer';
import { RadioSubmissionDialog } from '@/components/RadioSubmissionDialog';
import { MusicReleaseWidget } from '@/components/MusicReleaseWidget';
import { AdaptiveReleaseImage } from '@/components/AdaptiveReleaseImage';
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
  Video,
  Radio,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';
import { useMusicReleases, MusicRelease, useDeleteMusicRelease, useUpdateMusicRelease } from '@/hooks/useMusicReleases';
import { useRadioSubmissions } from '@/hooks/useRadioSubmissions';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MusicDiscographyProps {
  profileId: string;
  isOwner?: boolean;
  compactMode?: boolean;
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
  isOwner = false,
  compactMode = false
}) => {
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [radioSubmissionOpen, setRadioSubmissionOpen] = useState(false);
  const [selectedTrackForRadio, setSelectedTrackForRadio] = useState<any | null>(null);
  const [editingRelease, setEditingRelease] = useState<any | null>(null);

  const { data: releases = [], isLoading, error } = useMusicReleases(
    profileId, 
    isOwner ? 'all' : 'published'
  );

  const { hasAnySubmission, refreshSubmissions } = useRadioSubmissions(profileId);
  const deleteReleaseMutation = useDeleteMusicRelease();
  const updateReleaseMutation = useUpdateMusicRelease();
  const { toast } = useToast();

  const publishedReleases = releases?.filter(r => r.status === 'published') || [];
  const draftReleases = releases?.filter(r => r.status === 'draft') || [];

  const playTrack = (track: any, playlist: any[] = []) => {
    setSelectedTrack(track);
    const trackIndex = playlist.findIndex((t: any) => t.id === track.id);
    setCurrentPlaylistIndex(trackIndex >= 0 ? trackIndex : 0);
    setIsPlayerOpen(true);
  };

  const openRadioSubmission = (track: any) => {
    setSelectedTrackForRadio(track);
    setRadioSubmissionOpen(true);
  };

  const handleRadioSubmissionSuccess = () => {
    refreshSubmissions();
  };

  const handleEditRelease = (release: any) => {
    setEditingRelease(release);
  };

  const handlePublishRelease = async (releaseId: string) => {
    try {
      await updateReleaseMutation.mutateAsync({
        releaseId,
        data: { status: 'published' }
      });
    } catch (error) {
      console.error('Error publishing release:', error);
    }
  };

  const handleDeleteRelease = async (releaseId: string) => {
    try {
      await deleteReleaseMutation.mutateAsync(releaseId);
    } catch (error) {
      console.error('Error deleting release:', error);
    }
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
    showActions?: boolean;
    compactMode?: boolean;
    onClick?: () => void;
  }> = ({ release, showStatus = false, showActions = false, compactMode = false, onClick }) => {
    const submissionStatus = hasAnySubmission(release.media_assets || []);
    const hasAudioFile = release.media_assets?.some((asset: any) => asset.media_type === 'audio');

    return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md group",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className={cn("p-4", compactMode && "p-2")}>
        <div className={cn("flex items-start gap-4", compactMode && "gap-2")}>
            <div className="relative group">
            <AdaptiveReleaseImage 
              src={release.cover_image_url} 
              alt={release.title} 
              compactMode={compactMode}
            />
            
            {/* Video indicator */}
            {release.youtube_url && (
              <div className={cn(
                "absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1",
                compactMode && "px-1 py-0.5"
              )}>
                <Video className={cn("h-3 w-3", compactMode && "h-2 w-2")} />
              </div>
            )}
            
            {!compactMode && (
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
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className={cn(
                  "font-semibold text-lg truncate", 
                  compactMode && "text-sm"
                )}>{release.title}</h3>
                <p className={cn(
                  "text-muted-foreground truncate", 
                  compactMode && "text-xs"
                )}>{release.artist_name}</p>
                {release.album_name && (
                  <p className={cn(
                    "text-sm text-muted-foreground truncate", 
                    compactMode && "text-xs"
                  )}>{release.album_name}</p>
                )}
              </div>

              {showStatus && (
                <Badge 
                  variant={
                    release.status === 'published' ? 'default' : 
                    release.status === 'draft' ? 'secondary' : 
                    'outline'
                  }
                  className={compactMode ? "text-xs px-1" : ""}
                >
                  {release.status === 'published' ? 'Publié' : 
                   release.status === 'draft' ? 'Brouillon' : 
                   'Privé'}
                </Badge>
              )}
            </div>

            {!compactMode && (
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
            )}

            <div className={cn(
              "flex items-center gap-2 mt-2 flex-wrap",
              compactMode && "gap-1 mt-1"
            )}>
              {release.genre && <Badge variant="secondary" className={compactMode ? "text-xs px-1" : ""}>{release.genre}</Badge>}
              {release.explicit_content && <Badge variant="destructive" className={compactMode ? "text-xs px-1" : ""}>Explicit</Badge>}
              {release.youtube_url && (
                <Badge variant="outline" className={cn(
                  "bg-red-50 text-red-700 border-red-200",
                  compactMode && "text-xs px-1"
                )}>
                  <Video className={cn("h-3 w-3 mr-1", compactMode && "h-2 w-2 mr-0.5")} />
                  Vidéo
                </Badge>
              )}
              {release.is_original_composition && (
                <Badge variant="outline" className={compactMode ? "text-xs px-1" : ""}>
                  <Award className={cn("h-3 w-3 mr-1", compactMode && "h-2 w-2 mr-0.5")} />
                  Original
                </Badge>
              )}
              {submissionStatus && (
                <Badge 
                  variant={submissionStatus.status === 'approved' ? 'default' : 'secondary'}
                  className={cn(
                    submissionStatus.status === 'approved' 
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-orange-100 text-orange-800 border-orange-300',
                    compactMode && "text-xs px-1"
                  )}
                >
                  <Radio className={cn("h-3 w-3 mr-1", compactMode && "h-2 w-2 mr-0.5")} />
                  {submissionStatus.status === 'approved' ? 'En Radio' : 'En attente'}
                </Badge>
              )}
            </div>

            {/* Action buttons for owners */}
            {showActions && (
              <div className={cn("flex items-center gap-1", compactMode && "mt-1")}>
                <Button
                  size={compactMode ? "sm" : "sm"}
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRelease(release);
                  }}
                  className={cn("h-8 px-2", compactMode && "h-6 px-1")}
                >
                  <Edit className={cn("h-3 w-3", compactMode && "h-2 w-2")} />
                </Button>
                
                {release.status === 'draft' && (
                  <Button
                    size={compactMode ? "sm" : "sm"}
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePublishRelease(release.id);
                    }}
                    className={cn("h-8 px-2", compactMode && "h-6 px-1")}
                  >
                    <Upload className={cn("h-3 w-3", compactMode && "h-2 w-2")} />
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size={compactMode ? "sm" : "sm"}
                      variant="destructive"
                      onClick={(e) => e.stopPropagation()}
                      className={cn("h-8 px-2", compactMode && "h-6 px-1")}
                    >
                      <Trash2 className={cn("h-3 w-3", compactMode && "h-2 w-2")} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer "{release.title}" ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteRelease(release.id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Radio submission button for owners */}
            {isOwner && release.status === 'published' && hasAudioFile && !submissionStatus && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRadioSubmission(release);
                  }}
                  className="flex items-center gap-2"
                >
                  <Radio className="h-4 w-4" />
                  Soumettre à la Radio
                </Button>
              </div>
            )}

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
  };

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
        <CardHeader className={cn(compactMode && "pb-3")}>
          <CardTitle className={cn(
            "flex items-center gap-2",
            compactMode ? "text-base" : "text-lg"
          )}>
            <Music className={compactMode ? "h-4 w-4" : "h-5 w-5"} />
            Discographie
            <Badge variant="secondary" className={compactMode ? "text-xs" : ""}>{releases.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(compactMode && "px-4 py-2")}>
          {isOwner ? (
            <Tabs defaultValue="published" className="w-full">
              <TabsList className={cn(compactMode && "h-8")}>
                <TabsTrigger value="published" className={cn(compactMode && "text-xs px-2")}>
                  Publié ({publishedReleases.length})
                </TabsTrigger>
                <TabsTrigger value="drafts" className={cn(compactMode && "text-xs px-2")}>
                  Brouillons ({draftReleases.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="published" className={cn("space-y-4 mt-4", compactMode && "space-y-2 mt-2")}>
                {publishedReleases.map((release) => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    showActions={isOwner}
                    compactMode={compactMode}
                    onClick={() => {
                      setSelectedTrack(release);
                      setIsPlayerOpen(true);
                    }}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="drafts" className={cn("space-y-4 mt-4", compactMode && "space-y-2 mt-2")}>
                {draftReleases.map((release) => (
                  <ReleaseCard
                    key={release.id}
                    release={release}
                    showStatus
                    showActions={isOwner}
                    compactMode={compactMode}
                    onClick={() => {
                      setSelectedTrack(release);
                      setIsPlayerOpen(true);
                    }}
                  />
                ))}
              </TabsContent>
            </Tabs>
          ) : (
            <div className={cn("space-y-4", compactMode && "space-y-2")}>
              {publishedReleases.map((release) => (
                <ReleaseCard
                  key={release.id}
                  release={release}
                  compactMode={compactMode}
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

      {/* Radio Submission Dialog */}
      {selectedTrackForRadio && (
        <RadioSubmissionDialog
          open={radioSubmissionOpen}
          onOpenChange={setRadioSubmissionOpen}
          musicRelease={selectedTrackForRadio}
          onSubmissionSuccess={handleRadioSubmissionSuccess}
        />
      )}
      
      {/* Edit Release Dialog */}
      {editingRelease && (
        <Dialog open={!!editingRelease} onOpenChange={() => setEditingRelease(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la sortie musicale</DialogTitle>
            </DialogHeader>
            <MusicReleaseWidget
              profileId={profileId}
              editRelease={editingRelease}
              onSuccess={() => setEditingRelease(null)}
              onCancel={() => setEditingRelease(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};