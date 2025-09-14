import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function InscriptionConfirmation() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    document.title = "Merci pour votre inscription | Vybbi";
  }, []);

  const resendConfirmation = async () => {
    if (!email) {
      toast.error("Entrez votre adresse email");
      return;
    }
    setIsSending(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) throw error;
      toast.success("Email de confirmation renvoyé ✉️");
    } catch (err: any) {
      toast.error(err?.message || "Impossible d'envoyer l'email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Card className="max-w-lg w-full bg-card/95 border-border/50 shadow-glow">
        <CardHeader className="text-center space-y-3">
          <MailCheck className="w-10 h-10 mx-auto text-primary" />
          <CardTitle>Merci pour votre inscription</CardTitle>
          <p className="text-muted-foreground mt-1">
            Veuillez confirmer l'ouverture de votre compte en consultant votre email et en cliquant sur le lien de validation.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2 font-medium">Prochaine étape :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vérifiez votre boîte de réception et votre dossier spam.</li>
              <li>Ouvrez l'email de confirmation envoyé par Vybbi.</li>
              <li>Cliquez sur le lien pour activer votre compte.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Pas reçu d'email ? Renseignez votre adresse pour renvoyer le lien :</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="adresse@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={resendConfirmation} disabled={isSending}>
                {isSending ? "Envoi..." : "Renvoyer"}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/auth?tab=signin">Aller à la connexion</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
