import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, CheckCircle, X, Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import vybbiLogoMobile from "@/assets/vybbi-logo-mobile.png";
import gillesK from "@/assets/gilles-k.png";
import { toast } from 'sonner';

type ProfileType = 'artist' | 'agent' | 'lieu' | 'influenceur';

const CEO_MESSAGES = {
  artist: {
    message: "Bienvenue dans la famille Vybbi ! En tant qu'artiste, vous rejoignez une communauté mondiale qui valorise votre talent. Nous avons créé cette plateforme pour vous donner la visibilité que vous méritez.",
    author: "Gilles K.",
    role: "Fondateur"
  },
  agent: {
    message: "Félicitations ! Vous rejoignez les professionnels qui façonnent l'industrie. Vybbi vous donne les outils pour gérer efficacement vos artistes et développer votre réseau.",
    author: "Gilles K.",
    role: "Fondateur"
  },
  lieu: {
    message: "Merci de nous rejoindre ! Les établissements comme le vôtre sont au cœur de la scène musicale. Vybbi simplifie votre recherche de talents et la gestion de vos événements.",
    author: "Gilles K.",
    role: "Fondateur"
  },
  influenceur: {
    message: "Excellent choix ! En tant qu'influenceur, vous avez le pouvoir d'amplifier la musique et de connecter les artistes à leur audience. Vybbi vous offre les opportunités que vous recherchez.",
    author: "Gilles K.",
    role: "Fondateur"
  }
};

export default function AccountSetup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('artist');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });

  useEffect(() => {
    // Get stored data from previous step
    const storedEmail = localStorage.getItem('signup_email');
    const storedProfileType = localStorage.getItem('signup_profile_type') as ProfileType;

    if (!storedEmail || !storedProfileType) {
      // If no data, redirect back to get-started
      navigate('/get-started');
      return;
    }

    setEmail(storedEmail);
    setProfileType(storedProfileType);
  }, [navigate]);

  useEffect(() => {
    // Update password strength indicators
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    });
  }, [password]);

  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(v => v);
  };

  const isFormValid = () => {
    return isPasswordValid() && password === confirmPassword && confirmPassword.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    setLoading(true);

    try {
      // Map profile type to the format expected by signUp
      const profileTypeMap: Record<ProfileType, string> = {
        'artist': 'artist',
        'agent': 'agent',
        'lieu': 'lieu',
        'influenceur': 'influenceur'
      };

      await signUp(
        email,
        password,
        email.split('@')[0], // Use email prefix as temporary display name
        profileTypeMap[profileType]
      );

      // Clear localStorage
      localStorage.removeItem('signup_email');
      localStorage.removeItem('signup_profile_type');

      // Redirect to a confirmation page or auth callback
      toast.success('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      
      // Redirect to auth page with a confirmation message
      navigate('/auth?confirmed=true');
      
    } catch (error: unknown) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Erreur lors de la création du compte');
      } else {
        toast.error('Erreur lors de la création du compte');
      }
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/get-started');
  };

  const currentMessage = CEO_MESSAGES[profileType] || CEO_MESSAGES.artist;

  const StrengthIndicator = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle className="w-4 h-4 text-success" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={met ? 'text-success' : 'text-muted-foreground'}>{text}</span>
    </div>
  );

  return (
    <>
      <SEOHead 
        title="Configuration du compte | Vybbi"
        description="Finalisez la création de votre compte professionnel Vybbi"
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={vybbiLogoMobile} alt="Vybbi" className="w-10 h-10" />
              <span className="font-bold text-xl text-foreground">Vybbi</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Déjà un compte ?</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth?tab=signin">Connexion</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>

              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Créez votre mot de passe
                </h1>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>

              {/* CEO Message */}
              <Card className="bg-gradient-card border-border">
                <CardContent className="p-6">
                  <p className="text-sm text-card-foreground italic mb-4">
                    "{currentMessage.message}"
                  </p>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">
                      {currentMessage.author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentMessage.role}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Form */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Mot de passe
                      </label>
                      <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Créez un mot de passe sécurisé"
                        className="mobile-input"
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Confirmer le mot de passe
                      </label>
                      <PasswordInput
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez votre mot de passe"
                        className="mobile-input"
                        autoComplete="new-password"
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-destructive">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                    </div>

                    {password && (
                      <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                        <p className="text-xs font-medium text-foreground mb-2">
                          Sécurité du mot de passe :
                        </p>
                        <StrengthIndicator met={passwordStrength.minLength} text="Au moins 8 caractères" />
                        <StrengthIndicator met={passwordStrength.hasUpperCase} text="Une majuscule" />
                        <StrengthIndicator met={passwordStrength.hasLowerCase} text="Une minuscule" />
                        <StrengthIndicator met={passwordStrength.hasNumber} text="Un chiffre" />
                        <StrengthIndicator met={passwordStrength.hasSpecial} text="Un caractère spécial" />
                      </div>
                    )}

                    <Button 
                      type="submit"
                      className="w-full mobile-button"
                      disabled={!isFormValid() || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        'Créer mon compte'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8">
              {/* Left Side - Form */}
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>

                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-foreground">
                    Finalisez votre compte
                  </h1>
                  <p className="text-lg text-muted-foreground">{email}</p>
                </div>

                <Card className="bg-card border-border">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Mot de passe
                        </label>
                        <PasswordInput
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Créez un mot de passe sécurisé"
                          className="h-12"
                          autoComplete="new-password"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Confirmer le mot de passe
                        </label>
                        <PasswordInput
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmez votre mot de passe"
                          className="h-12"
                          autoComplete="new-password"
                        />
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-sm text-destructive">
                            Les mots de passe ne correspondent pas
                          </p>
                        )}
                      </div>

                      {password && (
                        <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                          <p className="text-sm font-medium text-foreground mb-3">
                            Sécurité du mot de passe :
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <StrengthIndicator met={passwordStrength.minLength} text="8+ caractères" />
                            <StrengthIndicator met={passwordStrength.hasUpperCase} text="Majuscule" />
                            <StrengthIndicator met={passwordStrength.hasLowerCase} text="Minuscule" />
                            <StrengthIndicator met={passwordStrength.hasNumber} text="Chiffre" />
                            <StrengthIndicator met={passwordStrength.hasSpecial} text="Spécial" />
                          </div>
                        </div>
                      )}

                      <Button 
                        type="submit"
                        className="w-full h-12"
                        disabled={!isFormValid() || loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Création en cours...
                          </>
                        ) : (
                          'Créer mon compte'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - CEO Message */}
              <div className="flex items-center">
                <Card className="bg-gradient-card border-border w-full">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto ring-2 ring-primary/20">
                        <img src={gillesK} alt="Gilles K." className="w-full h-full object-cover" />
                      </div>
                      
                      <p className="text-lg text-card-foreground italic leading-relaxed">
                        "{currentMessage.message}"
                      </p>
                      
                      <div className="text-center pt-4 border-t border-border">
                        <div className="text-base font-semibold text-foreground">
                          {currentMessage.author}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {currentMessage.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
