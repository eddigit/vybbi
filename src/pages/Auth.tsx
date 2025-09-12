import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Music, Users, MapPin, Briefcase } from 'lucide-react';
import wolfLogo from '@/assets/wolf-logo.png';

export default function Auth() {
  const { user, loading, signUp, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileType, setProfileType] = useState('');
  const [roleDetail, setRoleDetail] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signin' ? 'signin' : 'signup';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
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
      default: return <Music className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/341ddf13-d369-435e-afa6-45e70902ebf8.png" alt="Vybbi Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Vybbi
          </h1>
          <p className="text-muted-foreground mt-2">
            La plateforme qui connecte les talents
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Accéder à votre compte</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous ou créez votre profil artistique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={initialTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
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
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
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
                      </SelectContent>
                    </Select>
                  </div>

                  {profileType === 'artist' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Spécialité</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez votre spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DJ">DJ</SelectItem>
                          <SelectItem value="musicien">Musicien</SelectItem>
                          <SelectItem value="danseur">Danseur</SelectItem>
                          <SelectItem value="chanteur">Chanteur</SelectItem>
                          <SelectItem value="producteur">Producteur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'agent' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Type de partenaire</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez votre type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="manager_cherchant_artistes">Manager recherchant des artistes</SelectItem>
                          <SelectItem value="autre_partenaire">Autre partenaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'manager' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Type de partenaire</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez votre type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="agent_cherchant_managers">Agent recherchant des managers</SelectItem>
                          <SelectItem value="autre_partenaire">Autre partenaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {profileType === 'lieu' && (
                    <div className="space-y-2">
                      <Label htmlFor="role-detail">Catégorie du lieu</Label>
                      <Select value={roleDetail} onValueChange={setRoleDetail} required>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="club">Club</SelectItem>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="salle_concert">Salle de concert</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
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
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200" 
                    disabled={isLoading || !profileType || ((profileType === 'artist' || profileType === 'agent' || profileType === 'manager' || profileType === 'lieu') && !roleDetail)}
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