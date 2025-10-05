import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Users, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

type ProfileType = 'artist' | 'agent' | 'lieu';

const PROFILE_MESSAGES = {
  artist: {
    title: 'Bienvenue chez les artistes',
    subtitle: 'Créez votre carte de visite digitale professionnelle',
    benefits: [
      'Portfolio multimédia et showcase mondial',
      'Diffusion sur Radio Vybbi 24h/24',
      'Certification blockchain de vos œuvres',
      'Gestion de vos contrats et disponibilités',
      'Classement dans le Top 50 artistes',
      'Statistiques d\'écoute en temps réel'
    ]
  },
  agent: {
    title: 'Bienvenue chez les pros',
    subtitle: 'Votre réseau d\'artistes en un seul endroit',
    benefits: [
      'Gestion centralisée de vos artistes',
      'Outils de prospection intelligents',
      'Matching automatique avec les lieux',
      'Suivi des contrats et commissions',
      'Calendrier synchronisé des tournées',
      'Statistiques de performance détaillées'
    ]
  },
  lieu: {
    title: 'Bienvenue chez les établissements',
    subtitle: 'Trouvez les talents parfaits pour vos événements',
    benefits: [
      'Accès à des milliers d\'artistes vérifiés',
      'Matching IA selon votre ambiance',
      'Gestion simplifiée de vos événements',
      'Calendrier de disponibilités en temps réel',
      'Contrats et riders centralisés',
      'Historique et avis des performances'
    ]
  }
};

export default function GetStarted() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('artist');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    // Clear any stored data when component mounts
    localStorage.removeItem('signup_email');
    localStorage.removeItem('signup_profile_type');
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Veuillez entrer une adresse email valide');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleContinue = () => {
    if (!validateEmail(email)) {
      setEmailError('Veuillez entrer une adresse email valide');
      return;
    }

    // Store data in localStorage for next step
    localStorage.setItem('signup_email', email);
    localStorage.setItem('signup_profile_type', selectedProfile);

    // Navigate to account setup
    navigate('/account-setup');
  };

  const profileOptions = [
    {
      type: 'artist' as ProfileType,
      icon: Music,
      label: 'Artiste',
      description: 'DJ, Musicien, Groupe'
    },
    {
      type: 'agent' as ProfileType,
      icon: Users,
      label: 'Manager / Agent',
      description: 'Gestion d\'artistes'
    },
    {
      type: 'lieu' as ProfileType,
      icon: Building2,
      label: 'Lieu / Établissement',
      description: 'Club, Salle, Festival'
    }
  ];

  const currentMessage = PROFILE_MESSAGES[selectedProfile];

  return (
    <>
      <SEOHead 
        title="Commencer - Créez votre profil professionnel | Vybbi"
        description="Rejoignez Vybbi et créez votre carte de visite digitale professionnelle. Artistes, agents, managers et lieux se connectent ici."
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-6">
              {/* Profile Selection */}
              <div className="text-center space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Commencez votre aventure
                </h1>
                <p className="text-muted-foreground">
                  Sélectionnez votre profil
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {profileOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card
                      key={option.type}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-glow ${
                        selectedProfile === option.type
                          ? 'border-primary shadow-glow bg-primary/5'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedProfile(option.type)}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                          selectedProfile === option.type ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            selectedProfile === option.type ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Benefits */}
              <Card className="bg-gradient-card border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground">
                      {currentMessage.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentMessage.subtitle}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {currentMessage.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-card-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Email Form */}
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Votre email professionnel
                    </label>
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={`mobile-input ${emailError ? 'border-destructive' : ''}`}
                      autoComplete="email"
                    />
                    {emailError && (
                      <p className="text-sm text-destructive">{emailError}</p>
                    )}
                  </div>

                  <Button 
                    className="w-full mobile-button"
                    onClick={handleContinue}
                    disabled={!email || !!emailError}
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    En continuant, vous acceptez nos{' '}
                    <Link to="/conditions" className="text-primary hover:underline">
                      conditions d'utilisation
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8">
              {/* Left Side - Form */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-foreground">
                    Commencez votre aventure
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Rejoignez la communauté mondiale de la nuit
                  </p>
                </div>

                {/* Profile Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Je suis...
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {profileOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Card
                          key={option.type}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-glow ${
                            selectedProfile === option.type
                              ? 'border-primary shadow-glow bg-primary/5'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedProfile(option.type)}
                        >
                          <CardContent className="p-4 text-center space-y-2">
                            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                              selectedProfile === option.type ? 'bg-primary/20' : 'bg-muted'
                            }`}>
                              <Icon className={`w-6 h-6 ${
                                selectedProfile === option.type ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-sm">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Email Form */}
                <Card className="bg-card border-border">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Votre email professionnel
                      </label>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        className={`h-12 ${emailError ? 'border-destructive' : ''}`}
                        autoComplete="email"
                      />
                      {emailError && (
                        <p className="text-sm text-destructive">{emailError}</p>
                      )}
                    </div>

                    <Button 
                      className="w-full h-12"
                      onClick={handleContinue}
                      disabled={!email || !!emailError}
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      En continuant, vous acceptez nos{' '}
                      <Link to="/conditions" className="text-primary hover:underline">
                        conditions d'utilisation
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Benefits */}
              <div className="space-y-6">
                <Card className="bg-gradient-card border-border">
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-foreground">
                        {currentMessage.title}
                      </h2>
                      <p className="text-muted-foreground">
                        {currentMessage.subtitle}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {currentMessage.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-card-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
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
