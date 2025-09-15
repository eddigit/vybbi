import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface SiretFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function SiretField({ value, onChange, required = false, className }: SiretFieldProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");

  // Validation SIRET (algorithme de Luhn simplifié)
  const validateSiret = (siret: string): boolean => {
    // Supprimer les espaces et vérifier la longueur
    const cleanSiret = siret.replace(/\s/g, '');
    if (cleanSiret.length !== 14 || !/^\d{14}$/.test(cleanSiret)) {
      return false;
    }

    // Algorithme de Luhn pour SIRET
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(cleanSiret[i]);
      if (i % 2 === 1) { // Positions impaires (1, 3, 5, ...)
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }
    
    return sum % 10 === 0;
  };

  // Formater le SIRET avec des espaces
  const formatSiret = (input: string): string => {
    const cleaned = input.replace(/\s/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
    if (cleaned.length <= 9) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
    if (cleaned.length <= 14) return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 9) + ' ' + cleaned.slice(9);
    return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 9) + ' ' + cleaned.slice(9, 14);
  };

  useEffect(() => {
    if (value.length === 0) {
      setIsValid(null);
      setError("");
      return;
    }

    const cleanSiret = value.replace(/\s/g, '');
    
    if (cleanSiret.length < 14) {
      setIsValid(null);
      setError("");
      return;
    }

    if (cleanSiret.length === 14) {
      const valid = validateSiret(cleanSiret);
      setIsValid(valid);
      setError(valid ? "" : "Ce numéro SIRET n'est pas valide");
    } else {
      setIsValid(false);
      setError("Le SIRET doit contenir exactement 14 chiffres");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleanInput = input.replace(/[^\d\s]/g, ''); // Garder seulement les chiffres et espaces
    const formatted = formatSiret(cleanInput);
    onChange(formatted);
  };

  return (
    <div className={className}>
      <Label htmlFor="siret" className="text-sm font-medium text-foreground">
        Numéro SIRET {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative mt-1">
        <Input
          id="siret"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="123 456 789 01234"
          maxLength={17} // 14 chiffres + 3 espaces
          required={required}
          className={`pr-10 ${
            isValid === true ? 'border-success' : 
            isValid === false ? 'border-destructive' : ''
          }`}
        />
        {isValid === true && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
        )}
        {isValid === false && (
          <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
      </div>
      
      {error && (
        <Alert className="mt-2" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      <Alert className="mt-2">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Le numéro SIRET est obligatoire pour percevoir des commissions en France. 
          Il doit correspondre à votre activité d'influence/apport d'affaires déclarée.
        </AlertDescription>
      </Alert>
    </div>
  );
}