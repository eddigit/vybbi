import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle, XCircle, Upload, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { toast } from 'sonner';

export default function InscriptionInfluenceur() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('signup_email');
    const storedProfileType = localStorage.getItem('signup_profile_type');

    if (!storedEmail || storedProfileType !== 'influenceur') {
      navigate('/get-started?type=influenceur');
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordChecks).every(check => check);
  };

  const isFormValid = () => {
    return (
      email &&
      displayName.trim() &&
      isPasswordValid() &&
      password === confirmPassword &&
      acceptTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error('Veuillez remplir tous les champs correctement');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName, 'influenceur');
      
      localStorage.removeItem('signup_email');
      localStorage.removeItem('signup_profile_type');
      
      toast.success('Compte créé avec succès !');
      navigate('/affiliation');
    } catch (error: any) {
      console.error('Inscription error:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/get-started?type=influenceur');
  };

  const StrengthIndicator = ({ check, label }: { check: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {check ? (
        <CheckCircle className="w-3 h-3 text-green-500" />
      ) : (
        <XCircle className="w-3 h-3 text-muted-foreground" />
      )}
      <span className={check ? 'text-green-500' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  );

  return (
    <>
      <SEOHead
        title="Inscription Influenceur - Vybbi"
        description="Rejoignez le programme d'affiliation Vybbi et gagnez des commissions"
      />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Programme Influenceur</h1>
              </div>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>

            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Message du CEO</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  "Bienvenue dans notre programme d'affiliation exclusif ! En tant qu'influenceur Vybbi, 
                  vous allez contribuer à démocratiser l'accès à la musique et gagner des revenus récurrents. 
                  Créez votre compte en quelques secondes et commencez à partager !"
                </p>
                <p className="text-sm font-semibold mt-3">— Gilles K., CEO Vybbi</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'affichage *</Label>
                    <Input
                      id="displayName"
                      placeholder="Comment voulez-vous être appelé ?"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <StrengthIndicator check={passwordChecks.length} label="8 caractères min" />
                      <StrengthIndicator check={passwordChecks.uppercase} label="1 majuscule" />
                      <StrengthIndicator check={passwordChecks.lowercase} label="1 minuscule" />
                      <StrengthIndicator check={passwordChecks.number} label="1 chiffre" />
                      <StrengthIndicator check={passwordChecks.special} label="1 caractère spécial" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Photo de profil (optionnel)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('avatar')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {avatar ? 'Changer' : 'Ajouter'}
                      </Button>
                      {avatarPreview && (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-border"
                        />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAvatar(null);
                          setAvatarPreview('');
                        }}
                      >
                        Passer
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      required
                    />
                    <Label htmlFor="terms" className="text-xs leading-tight cursor-pointer">
                      J'accepte les{' '}
                      <Link to="/conditions" className="text-primary hover:underline" target="_blank">
                        conditions générales
                      </Link>{' '}
                      et la{' '}
                      <Link to="/confidentialite" className="text-primary hover:underline" target="_blank">
                        politique de confidentialité
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? 'Création en cours...' : 'Créer mon compte'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl font-bold">Programme Influenceur</h1>
                </div>
                <p className="text-muted-foreground">{email}</p>
              </div>

              <Card className="bg-gradient-card border-border">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email-desktop">Email</Label>
                      <Input
                        id="email-desktop"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName-desktop">Nom d'affichage *</Label>
                      <Input
                        id="displayName-desktop"
                        placeholder="Comment voulez-vous être appelé ?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-desktop">Mot de passe *</Label>
                      <PasswordInput
                        id="password-desktop"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <StrengthIndicator check={passwordChecks.length} label="8 caractères min" />
                        <StrengthIndicator check={passwordChecks.uppercase} label="1 majuscule" />
                        <StrengthIndicator check={passwordChecks.lowercase} label="1 minuscule" />
                        <StrengthIndicator check={passwordChecks.number} label="1 chiffre" />
                        <StrengthIndicator check={passwordChecks.special} label="1 caractère spécial" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword-desktop">Confirmer le mot de passe *</Label>
                      <PasswordInput
                        id="confirmPassword-desktop"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatar-desktop">Photo de profil (optionnel)</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="avatar-desktop"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('avatar-desktop')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {avatar ? 'Changer' : 'Ajouter'}
                        </Button>
                        {avatarPreview && (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-12 h-12 rounded-full object-cover border-2 border-border"
                          />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAvatar(null);
                            setAvatarPreview('');
                          }}
                        >
                          Passer
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms-desktop"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        required
                      />
                      <Label htmlFor="terms-desktop" className="text-sm leading-tight cursor-pointer">
                        J'accepte les{' '}
                        <Link to="/conditions" className="text-primary hover:underline" target="_blank">
                          conditions générales
                        </Link>{' '}
                        et la{' '}
                        <Link to="/confidentialite" className="text-primary hover:underline" target="_blank">
                          politique de confidentialité
                        </Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!isFormValid() || loading}
                    >
                      {loading ? 'Création en cours...' : 'Créer mon compte'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border h-fit sticky top-24">
              <CardHeader>
                <CardTitle>Message du CEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground italic">
                  "Bienvenue dans notre programme d'affiliation exclusif ! En tant qu'influenceur Vybbi, 
                  vous allez contribuer à démocratiser l'accès à la musique et gagner des revenus récurrents."
                </p>
                <p className="text-muted-foreground italic">
                  "Créez votre compte en quelques secondes, générez votre lien unique, et commencez à partager 
                  Vybbi avec votre communauté. Chaque inscription vous rapporte 2€ + 0,50€/mois tant que l'utilisateur 
                  reste actif."
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold">— Gilles K.</p>
                  <p className="text-sm text-muted-foreground">CEO & Co-fondateur Vybbi</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
