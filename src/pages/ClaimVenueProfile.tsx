import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const ClaimVenueProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'claim' | 'delete' | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!token) {
      setError('Token de réclamation manquant');
      setLoading(false);
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('claim-venue-profile', {
        body: {
          claimToken: token,
          action: 'verify'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Token invalide');
      }

      setProfileInfo(data.profile);
      setError(null);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Token invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "❌ Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "❌ Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-venue-profile', {
        body: {
          claimToken: token,
          action: 'claim',
          email: formData.email,
          password: formData.password
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Échec de la réclamation');
      }

      toast({
        title: "✅ Compte créé !",
        description: "Votre compte a été créé avec succès. Connectez-vous maintenant.",
      });

      // Redirect to login
      setTimeout(() => {
        navigate('/auth?email=' + encodeURIComponent(formData.email));
      }, 2000);

    } catch (err: any) {
      console.error('Claim error:', err);
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible de créer le compte",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche ? Cette action est irréversible.')) {
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-venue-profile', {
        body: {
          claimToken: token,
          action: 'delete'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Échec de la suppression');
      }

      toast({
        title: "✅ Fiche supprimée",
        description: "La fiche a été supprimée avec succès.",
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      console.error('Delete error:', err);
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible de supprimer la fiche",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SEOHead 
          title="Erreur - Réclamation de Profil"
          description="Erreur lors de la réclamation du profil"
        />
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full mt-4"
              variant="outline"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <SEOHead 
        title={`Réclamez votre profil - ${profileInfo?.displayName || 'Vybbi'}`}
        description="Créez votre compte et gérez votre profil d'établissement sur Vybbi"
      />
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Réclamez Votre Profil Vybbi
          </CardTitle>
          <CardDescription>
            Suite à notre visite, nous avons créé une page pour votre établissement
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Info */}
          {profileInfo && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>{profileInfo.displayName}</strong>
                {profileInfo.city && ` • ${profileInfo.city}`}
                {profileInfo.venueCategory && ` • ${profileInfo.venueCategory}`}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Selection */}
          {!action && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vous pouvez créer votre compte pour gérer cette page ou la supprimer si vous ne souhaitez pas être référencé.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setAction('claim')}
                  className="h-auto py-4 flex-col items-start gap-2"
                  variant="default"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Créer Mon Compte</div>
                    <div className="text-xs font-normal opacity-80">
                      Gérez votre profil et événements
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => setAction('delete')}
                  className="h-auto py-4 flex-col items-start gap-2"
                  variant="destructive"
                >
                  <XCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Supprimer la Fiche</div>
                    <div className="text-xs font-normal opacity-80">
                      Retirer votre profil de Vybbi
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Claim Form */}
          {action === 'claim' && (
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe * (min. 8 caractères)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAction(null)}
                  disabled={verifying}
                >
                  Retour
                </Button>
                <Button type="submit" disabled={verifying} className="flex-1">
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer Mon Compte
                </Button>
              </div>
            </form>
          )}

          {/* Delete Confirmation */}
          {action === 'delete' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Attention : Cette action supprimera définitivement votre profil et ne pourra pas être annulée.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAction(null)}
                  disabled={verifying}
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={verifying}
                  className="flex-1"
                >
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmer la Suppression
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimVenueProfile;