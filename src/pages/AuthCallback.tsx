import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get parameters from URL
      const token = searchParams.get('token');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      console.log('Auth callback params:', { token, tokenHash, type, accessToken, refreshToken });

      // If we have access_token and refresh_token, set the session directly
      if (accessToken && refreshToken) {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (sessionError) throw sessionError;
        
        console.log('Session set successfully:', data);
        setSuccess(true);
        toast.success("Email confirmé avec succès !");
        
        // Wait a moment then redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        return;
      }

      // Otherwise, get the current session (should be available after email confirmation)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(sessionError.message);
      }

      if (session?.user) {
        console.log('User session found:', session.user);
        setSuccess(true);
        toast.success("Email confirmé avec succès !");
        
        // Wait a moment then redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        console.log('No session found, user may need to log in');
        setSuccess(false);
        setError("Veuillez vous connecter pour continuer.");
      }

    } catch (err: any) {
      console.error('Auth callback error:', err);
      setSuccess(false);
      setError(err.message || "Une erreur est survenue lors de la confirmation.");
      toast.error("Erreur lors de la confirmation de l'email");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToAuth = () => {
    navigate('/auth');
  };

  const handleResendConfirmation = () => {
    navigate('/inscription/confirmation');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Confirmation en cours...</h1>
            <p className="text-muted-foreground">
              Nous vérifions votre email, veuillez patienter.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          {success ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-green-600">Email confirmé !</h1>
              <p className="text-muted-foreground mb-6">
                Votre email a été confirmé avec succès. Vous allez être redirigé vers votre tableau de bord.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-destructive">Erreur de confirmation</h1>
              <p className="text-muted-foreground mb-6">
                {error || "Une erreur est survenue lors de la confirmation de votre email."}
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleReturnToAuth} className="w-full">
                  Retourner à la connexion
                </Button>
                <Button onClick={handleResendConfirmation} variant="outline" className="w-full">
                  Renvoyer l'email de confirmation
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
