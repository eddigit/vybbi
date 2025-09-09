import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function NosArtistes() {
  const { user, loading: authLoading } = useAuth();
  const [artists, setArtists] = useState<Profile[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [venues, setVenues] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Redirect authenticated users to dashboard (after all hooks are called)
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchProfiles = async () => {
    try {
      // Fetch 5 artists
      const { data: artistsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .eq('profile_type', 'artist')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch 2 agents/managers
      const { data: agentsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .in('profile_type', ['agent', 'manager'])
        .order('created_at', { ascending: false })
        .limit(2);

      // Fetch 3 venues
      const { data: venuesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .eq('profile_type', 'lieu')
        .order('created_at', { ascending: false })
        .limit(3);

      setArtists(artistsData || []);
      setAgents(agentsData || []);
      setVenues(venuesData || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'artist': return <Users className="w-4 h-4" />;
      case 'agent': return <Users className="w-4 h-4" />;
      case 'manager': return <Briefcase className="w-4 h-4" />;
      case 'lieu': return <Calendar className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getProfileTypeLabel = (type: string) => {
    switch (type) {
      case 'artist': return 'Artiste';
      case 'agent': return 'Agent';
      case 'manager': return 'Manager';
      case 'lieu': return 'Lieu';
      default: return 'Profil';
    }
  };

  const getProfileLink = (profile: Profile) => {
    switch (profile.profile_type) {
      case 'artist': return `/artists/${profile.id}`;
      case 'agent':
      case 'manager': return `/partners/${profile.id}`;
      case 'lieu': return `/lieux/${profile.id}`;
      default: return `/profiles`;
    }
  };

  const ProfileCard = ({ profile }: { profile: Profile }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-16 h-16 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white text-lg font-bold">
              {profile.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2 flex-1">
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {profile.display_name}
              </h3>
              <Badge variant="outline" className="mt-1">
                {getProfileIcon(profile.profile_type)}
                <span className="ml-1">{getProfileTypeLabel(profile.profile_type)}</span>
              </Badge>
            </div>
            
            {profile.location && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            
            {profile.genres && profile.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {profile.genres.slice(0, 2).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {profile.genres.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.genres.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col w-full gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={getProfileLink(profile)}>
                Voir le profil
              </Link>
            </Button>
            
            <Button asChild size="sm" className="w-full">
              <Link to="/auth">
                Créer un compte pour contacter
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProfileSection = ({ 
    title, 
    profiles, 
    description 
  }: { 
    title: string; 
    profiles: Profile[]; 
    description: string;
  }) => (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: profiles.length || 3 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2 text-center w-full">
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                  </div>
                  <div className="flex flex-col w-full gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/voir-plus">
                En voir plus
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun profil disponible pour le moment.</p>
        </div>
      )}
    </section>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Nos Artistes
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez notre communauté d'artistes, agents et lieux exceptionnels
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 max-w-4xl mx-auto">
          <p className="text-lg text-foreground font-medium mb-4">
            ✨ Inscription gratuite • 30 jours d'essai offerts
          </p>
          <p className="text-muted-foreground">
            Rejoignez gratuitement notre plateforme et connectez-vous avec les meilleurs professionnels de l'industrie musicale.
          </p>
        </div>
      </section>

      {/* Artists Section */}
      <ProfileSection
        title="Artistes Talentueux"
        profiles={artists}
        description="Découvrez des artistes exceptionnels de tous styles musicaux, prêts à enflammer la scène."
      />

      {/* Agents/Managers Section */}
      <ProfileSection
        title="Agents & Managers"
        profiles={agents}
        description="Des professionnels expérimentés pour accompagner et développer les carrières artistiques."
      />

      {/* Venues Section */}
      <ProfileSection
        title="Lieux & Événements"
        profiles={venues}
        description="Des lieux d'exception pour accueillir vos événements et concerts mémorables."
      />

      {/* CTA Section */}
      <section className="text-center py-16">
        <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Créez votre compte gratuitement et accédez à tous nos services : mise en relation, gestion d'annonces, messagerie sécurisée et bien plus encore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl">
              <Link to="/auth">
                Créer mon compte gratuit
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
              <Link to="/annonces">
                Voir les annonces
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}