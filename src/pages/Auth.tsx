import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';
import { Loader2, Music, Users, MapPin, Briefcase, Star, GraduationCap, Coins, Camera, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { TALENTS } from '@/lib/talents';
import { SiretField } from '@/components/SiretField';
import { HelpTooltip, HELP_MESSAGES } from '@/components/HelpTooltips';
import { LoadingOverlay } from '@/components/LoadingStates';
import vybbiLogo from '@/assets/vybbi-wolf-logo.png';
import { EmailConfirmationDialog } from '@/components/EmailConfirmationDialog';

export default function Auth() {
  const { user, loading, signUp, signIn, hasRole, showEmailConfirmation, confirmationEmail, setShowEmailConfirmation } = useAuth();
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
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    hasLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
  }>({
    isValid: false,
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // Load remembered email and remember me preference
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('vybbi_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Reset roleDetail when profileType changes
  useEffect(() => {
    setRoleDetail('');
  }, [profileType]);

  // Sync active tab with URL
  useEffect(() => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', newUrl.toString());
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={hasRole('admin') ? "/dashboard" : "/"} replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password, rememberMe);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(email, password, displayName, profileType, roleDetail || undefined);
      // The user will be redirected automatically by useAuth after email confirmation
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (pwd: string) => {
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const isValid = hasLength && hasUpper && hasLower && hasNumber;
    
    setPasswordStrength({ isValid, hasLength, hasUpper, hasLower, hasNumber });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(email ? emailRegex.test(email) : null);
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
    <>
      <EmailConfirmationDialog
        isOpen={showEmailConfirmation}
        onClose={() => setShowEmailConfirmation(false)}
        email={confirmationEmail}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer">
              <img src={vybbiLogo} alt="Vybbi Logo" className="w-12 h-12 sm:w-16 sm:h-16" />
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Checkbox 
                        id="remember-me" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        size="xxs"
                        className="scale-[0.6] origin-left"
                      />
                      <Label htmlFor="remember-me" className="text-xs text-muted-foreground cursor-pointer">
                        Se souvenir de moi
                      </Label>
                    </div>
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
                    <Label htmlFor="signup-name">
                      {profileType === 'artist' ? 'Nom d\'artiste' : 'Nom d\'affichage'}
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={profileType === 'artist' ? 'DJ Aaron, MC Solaar...' : 'Votre nom'}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                    {profileType === 'artist' && displayName && (
                      <div className="mt-2 p-2 bg-muted/50 rounded-md">
                        <p className="text-xs font-medium text-muted-foreground">Aperçu de votre URL :</p>
                        <p className="text-xs font-mono text-primary mt-0.5 break-all">
                          vybbi.app/artistes/{displayName.toLowerCase()
                            .replace(/^(dj|mc|mr|mrs|ms|dr)\s+/gi, '')
                            .split(/\s+/)[0]
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9]/g, '-')
                            .substring(0, 20)
                            .replace(/-+$/, '')}
                        </p>
                      </div>
                    )}
                    {profileType === 'artist' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Choisissez un nom court et mémorable pour votre URL publique
                      </p>
                    )}
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
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="text"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateEmail(e.target.value);
                        }}
                        required
                        className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-10 ${
                          emailValid === false ? "border-destructive" : emailValid === true ? "border-green-500" : ""
                        }`}
                      />
                      {emailValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {emailValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <PasswordInput
                      id="signup-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      required
                      minLength={8}
                      className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                        password && !passwordStrength.isValid ? "border-destructive" : password && passwordStrength.isValid ? "border-green-500" : ""
                      }`}
                    />
                    {password && (
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-1.5 ${passwordStrength.hasLength ? "text-green-600" : "text-muted-foreground"}`}>
                          {passwordStrength.hasLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Au moins 8 caractères</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordStrength.hasUpper ? "text-green-600" : "text-muted-foreground"}`}>
                          {passwordStrength.hasUpper ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Une majuscule</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordStrength.hasLower ? "text-green-600" : "text-muted-foreground"}`}>
                          {passwordStrength.hasLower ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Une minuscule</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordStrength.hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                          {passwordStrength.hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Un chiffre</span>
                        </div>
                      </div>
                    )}
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
    </>
  );
}