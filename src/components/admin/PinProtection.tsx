import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAdminSettings } from "@/hooks/useAdminSettings";

interface PinProtectionProps {
  children: React.ReactNode;
  onUnlock?: () => void;
}

const CORRECT_PIN = "557577";
const SESSION_STORAGE_KEY = "coffre_fort_access";

export const PinProtection = ({ children, onUnlock }: PinProtectionProps) => {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const { getAdminEmail, getSecuritySettings } = useAdminSettings();

  useEffect(() => {
    // Vérifier si l'accès est déjà autorisé dans cette session
    const sessionAccess = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionAccess) {
      const accessData = JSON.parse(sessionAccess);
      const now = Date.now();
      // Valide pour 30 minutes
      if (now - accessData.timestamp < 30 * 60 * 1000) {
        setIsUnlocked(true);
        onUnlock?.();
        return;
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    // Vérifier si bloqué temporairement
    const blockData = localStorage.getItem("coffre_fort_block");
    if (blockData) {
      const blockInfo = JSON.parse(blockData);
      const now = Date.now();
      if (now - blockInfo.timestamp < 15 * 60 * 1000) { // Bloqué 15 minutes
        setIsBlocked(true);
        setAttempts(blockInfo.attempts);
      } else {
        localStorage.removeItem("coffre_fort_block");
      }
    }
  }, [onUnlock]);

  const handlePinComplete = (value: string) => {
    if (isBlocked) {
      toast.error("Accès temporairement bloqué. Veuillez patienter.");
      return;
    }

    if (value === CORRECT_PIN) {
      setIsUnlocked(true);
      setPin("");
      setAttempts(0);
      localStorage.removeItem("coffre_fort_block");
      
      // Stocker l'accès en session
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        timestamp: Date.now()
      }));
      
      toast.success("Accès autorisé au coffre-fort");
      onUnlock?.();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      
      if (newAttempts >= 3) {
        setIsBlocked(true);
        localStorage.setItem("coffre_fort_block", JSON.stringify({
          attempts: newAttempts,
          timestamp: Date.now()
        }));
        toast.error("Trop de tentatives incorrectes. Accès bloqué pendant 15 minutes.");
      } else {
        toast.error(`Code incorrect. ${3 - newAttempts} tentative(s) restante(s).`);
      }
    }
  };

  const handleRequestReset = () => {
    const adminEmail = getAdminEmail();
    const subject = encodeURIComponent("Demande de réinitialisation - Code Coffre-Fort Vybbi");
    const body = encodeURIComponent(`Bonjour,

Je souhaite faire une demande de réinitialisation du code d'accès au coffre-fort administrateur.

Merci de me fournir le nouveau code d'accès.

Cordialement.`);
    
    window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`, '_blank');
    toast.info("Email de demande ouvert. Contactez l'administrateur pour obtenir le code.");
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Accès Sécurisé</CardTitle>
            <CardDescription>
              Saisissez le code PIN à 6 chiffres pour accéder au coffre-fort
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isBlocked ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Accès temporairement bloqué</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Trop de tentatives incorrectes. Veuillez patienter 15 minutes ou demander une réinitialisation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  value={pin}
                  onChange={setPin}
                  onComplete={handlePinComplete}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              {attempts > 0 && (
                <div className="text-center">
                  <p className="text-sm text-destructive">
                    {attempts} tentative(s) incorrecte(s) - {3 - attempts} restante(s)
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Code perdu ?
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleRequestReset}
              className="w-full"
              size="sm"
            >
              <Mail className="mr-2 h-4 w-4" />
              Demander la réinitialisation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};