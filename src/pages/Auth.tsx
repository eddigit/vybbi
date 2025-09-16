import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';
import { Loader2, Music, Users, MapPin, Briefcase, Star, GraduationCap, Coins, Camera, Building2 } from 'lucide-react';
import { TALENTS } from '@/lib/talents';
import { SiretField } from '@/components/SiretField';

export default function Auth() {
  const { user, loading, signUp, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signin' ? 'signin' : 'signup';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileType, setProfileType] = useState('');
  const [roleDetail, setRoleDetail] = useState('');

  // Reset roleDetail when profileType changes
  useEffect(() => {
    setRoleDetail('');
  }, [profileType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(email, password, displayName, profileType, roleDetail || undefined);
      navigate('/inscription/confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'artist': return <Music className="h-4 w-4" />;
      case 'agent': return <Briefcase className="h-4 w-4" />;
      case 'manager': return <Users className="h-4 w-4" />;
      case 'lieu': return <MapPin className="h-4 w-4" />;
      case 'influenceur': return <Star className="h-4 w-4" />;
      case 'academie': return <GraduationCap className="h-4 w-4" />;
      case 'sponsors': return <Coins className="h-4 w-4" />;
      case 'media': return <Camera className="h-4 w-4" />;
      case 'agence': return <Building2 className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer">
              <img src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi Logo" className="w-12 h-12 sm:w-16 sm:h-16" />
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
            Vybbi
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            La plateforme qui connecte les talents
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95 mobile-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {activeTab === 'signin' ? 'Accéder à votre compte' : 'Créer votre compte'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'signin' ? 'Connectez-vous à votre profil artistique' : 'Rejoignez notre communauté de talents'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={initialTab} className="space-y-4" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 gap-0">
                <TabsTrigger value="signin" className="w-full">Connexion</TabsTrigger>
                <TabsTrigger value="signup" className="w-full">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <PasswordInput
                      id="signin-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="text-right">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom d'affichage</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Votre nom artistique"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-type">Type de profil</Label>
                    <Select value={profileType} onValueChange={setProfileType} required>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Choisissez votre profil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="artist">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('artist')}
                            <span>Artiste</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="agent">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('agent')}
                            <span>Partenaire (Agent)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="manager">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('manager')}
                            <span>Partenaire (Manager)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="lieu">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('lieu')}
                            <span>Lieu & Établissement</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="influenceur">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('influenceur')}
                            <span>Influenceur</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="academie">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('academie')}
                            <span>Académie</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="sponsors">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('sponsors')}
                            <span>Sponsors</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="media">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('media')}
                            <span>Média</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="agence">
                          <div className="flex items-center space-x-2">
                            {getProfileIcon('agence')}
                            <span>Agence</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {profileType === 'artist' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Talent principal</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez votre talent principal" />
                        </SelectTrigger>
                        <SelectContent>
                          {TALENTS.map((talent) => (
                            <SelectItem key={talent.id} value={talent.id}>
                              <div className="flex items-center space-x-2">
                                <span>{talent.icon}</span>
                                <span>{talent.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'agent' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Spécialité</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez votre spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent_artistique">Agent artistique</SelectItem>
                          <SelectItem value="booker">Booker</SelectItem>
                          <SelectItem value="promoteur">Promoteur</SelectItem>
                          <SelectItem value="tourneur">Tourneur</SelectItem>
                          <SelectItem value="autre_agent">Autre agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'manager' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Spécialité</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez votre spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager_artiste">Manager d'artiste</SelectItem>
                          <SelectItem value="directeur_artistique">Directeur artistique</SelectItem>
                          <SelectItem value="producteur_executif">Producteur exécutif</SelectItem>
                          <SelectItem value="consultant_musical">Consultant musical</SelectItem>
                          <SelectItem value="autre_manager">Autre manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'lieu' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Type d'établissement</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="club">Club</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="salle_concert">Salle de concert</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="hotel">Hôtel</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'influenceur' && (
                    <SiretField
                      value={roleDetail}
                      onChange={setRoleDetail}
                      required
                      className="space-y-2"
                    />
                  )}

                  {profileType === 'academie' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Spécialité</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez votre spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formation_musicale">Formation musicale</SelectItem>
                          <SelectItem value="formation_technique">Formation technique</SelectItem>
                          <SelectItem value="formation_business">Formation business</SelectItem>
                          <SelectItem value="ecole_musique">École de musique</SelectItem>
                          <SelectItem value="conservatoire">Conservatoire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'sponsors' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Type de sponsoring</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="evenementiel">Sponsoring événementiel</SelectItem>
                          <SelectItem value="artistique">Sponsoring artistique</SelectItem>
                          <SelectItem value="equipement">Sponsoring équipement</SelectItem>
                          <SelectItem value="festival">Sponsoring festival</SelectItem>
                          <SelectItem value="tournee">Sponsoring tournée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'media' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Type de média</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="magazine">Magazine</SelectItem>
                          <SelectItem value="radio">Radio</SelectItem>
                          <SelectItem value="podcast">Podcast</SelectItem>
                          <SelectItem value="television">Télévision</SelectItem>
                          <SelectItem value="presse_en_ligne">Presse en ligne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'agence' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Spécialité d'agence</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez une spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking">Agence de booking</SelectItem>
                          <SelectItem value="communication">Agence de communication</SelectItem>
                          <SelectItem value="production">Agence de production</SelectItem>
                          <SelectItem value="evenementiel">Agence événementiel</SelectItem>
                          <SelectItem value="marketing">Agence marketing musical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <PasswordInput
                      id="signup-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 6 caractères
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200" 
                    disabled={isLoading || !profileType || ((profileType === 'artist' || profileType === 'agent' || profileType === 'manager' || profileType === 'lieu' || profileType === 'influenceur' || profileType === 'academie' || profileType === 'sponsors' || profileType === 'media' || profileType === 'agence') && !roleDetail)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            En vous inscrivant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}