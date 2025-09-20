import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Filter, MapPin, Mail, Phone, Globe, Building2, Megaphone, Camera, TrendingUp, UserCheck, Crown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Profile, ProfileType } from '@/lib/types';
import { getProfileUrl } from '@/hooks/useProfileResolver';

import { SEOHead } from '@/components/SEOHead';

const partnerTypes: ProfileType[] = ['manager', 'agent', 'academie', 'sponsors', 'media', 'influenceur', 'agence'];

const getPartnerIcon = (type: ProfileType) => {
  switch (type) {
    case 'manager': return UserCheck;
    case 'agent': return Crown;
    case 'academie': return Building2;
    case 'sponsors': return TrendingUp;
    case 'media': return Camera;
    case 'influenceur': return Megaphone;
    case 'agence': return Users;
    default: return Users;
  }
};

const getPartnerColor = (type: ProfileType) => {
  switch (type) {
    case 'manager': return "bg-blue-500/20 text-blue-700 border-blue-500/30";
    case 'agent': return "bg-purple-500/20 text-purple-700 border-purple-500/30";
    case 'academie': return "bg-green-500/20 text-green-700 border-green-500/30";
    case 'sponsors': return "bg-orange-500/20 text-orange-700 border-orange-500/30";
    case 'media': return "bg-red-500/20 text-red-700 border-red-500/30";
    case 'influenceur': return "bg-pink-500/20 text-pink-700 border-pink-500/30";
    case 'agence': return "bg-indigo-500/20 text-indigo-700 border-indigo-500/30";
    default: return "bg-gray-500/20 text-gray-700 border-gray-500/30";
  }
};

const getPartnerLabel = (type: ProfileType) => {
  switch (type) {
    case 'manager': return 'Manager';
    case 'agent': return 'Agent';
    case 'academie': return 'Académie';
    case 'sponsors': return 'Sponsor';
    case 'media': return 'Média';
    case 'influenceur': return 'Influenceur';
    case 'agence': return 'Agence';
    default: return type;
  }
};

export default function Partners() {
  const [partners, setPartners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .in('profile_type', partnerTypes)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
      partner.profile_type === selectedType ||
      partner.secondary_profile_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Stats calculation
  const stats = {
    total: partners.length,
    manager: partners.filter(p => p.profile_type === 'manager').length,
    agent: partners.filter(p => p.profile_type === 'agent').length,
    others: partners.filter(p => !['manager', 'agent'].includes(p.profile_type)).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des partenaires...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Nos Partenaires - Managers, Agents & Professionnels de la Musique"
        description="Découvrez nos partenaires : managers d'artistes, agents, académies, sponsors, médias et agences. Trouvez les professionnels qui vous accompagneront dans votre carrière musicale."
      />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Nos Partenaires</h1>
          <p className="text-muted-foreground mb-6">
            Découvrez nos managers, agents, et autres professionnels de la musique
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{stats.manager}</div>
                <div className="text-sm text-muted-foreground">Managers</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">{stats.agent}</div>
                <div className="text-sm text-muted-foreground">Agents</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{stats.others}</div>
                <div className="text-sm text-muted-foreground">Autres</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un partenaire, ville, spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les partenaires</SelectItem>
                {partnerTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getPartnerLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPartners.map((partner) => {
            const Icon = getPartnerIcon(partner.profile_type);
            return (
              <Link key={partner.id} to={getProfileUrl(partner)}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm border border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        <AvatarImage src={partner.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-lg">
                          {partner.display_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {partner.display_name}
                      </h3>
                      
                      <Badge className={`mb-3 ${getPartnerColor(partner.profile_type)}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {getPartnerLabel(partner.profile_type)}
                      </Badge>
                      
                      {partner.location && (
                        <div className="flex items-center text-muted-foreground text-sm mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          {partner.location}
                        </div>
                      )}
                      
                      {partner.bio && (
                        <p className="text-sm text-muted-foreground text-center line-clamp-2 mb-3">
                          {partner.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {partner.email && <Mail className="h-3 w-3" />}
                        {partner.phone && <Phone className="h-3 w-3" />}
                        {partner.website && <Globe className="h-3 w-3" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun partenaire trouvé</h3>
            <p className="text-muted-foreground">
              Essayez d'ajuster vos critères de recherche
            </p>
          </div>
        )}
      </div>
      
    </>
  );
}