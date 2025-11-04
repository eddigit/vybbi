import { Check, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

interface Feature {
  name: string;
  freemium: boolean | string;
  solo: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
}

interface ComparisonTableProps {
  profileType: "artist" | "agent" | "venue";
}

interface SubscriptionButtonProps {
  tier: SubscriptionTier;
  profileType: "artist" | "agent" | "venue";
  variant?: "default" | "outline" | "secondary";
  label: string;
}

function SubscriptionButton({ tier, profileType, variant = "secondary", label }: SubscriptionButtonProps) {
  const { user } = useAuth();
  const { createCheckoutSession, subscription, loading: subLoading } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour souscrire à un abonnement", {
        action: {
          label: "Se connecter",
          onClick: () => window.location.href = "/auth",
        },
      });
      return;
    }

    if (tier === 'freemium') {
      toast.info("Vous utilisez déjà le plan gratuit");
      return;
    }

    if (tier === 'elite') {
      toast.info("Pour l'offre Elite, veuillez nous contacter directement", {
        action: {
          label: "Nous contacter",
          onClick: () => window.location.href = "/contact",
        },
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà ce plan
    if (subscription?.tier === tier) {
      toast.info(`Vous êtes déjà abonné au plan ${tier}`);
      return;
    }

    setLoading(true);
    try {
      await createCheckoutSession(tier, profileType);
      toast.success("Redirection vers le paiement...");
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Erreur lors de la création de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = subscription?.tier === tier;

  return (
    <Button
      variant={isCurrentPlan ? "outline" : variant}
      size="sm"
      className="w-full"
      onClick={handleSubscribe}
      disabled={loading || subLoading || isCurrentPlan}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Chargement...
        </>
      ) : isCurrentPlan ? (
        "Plan actuel"
      ) : (
        label
      )}
    </Button>
  );
}

const artistFeatures: Feature[] = [
  { name: "Profil public complet", freemium: true, solo: true, pro: true, elite: true },
  { name: "Portfolio photos/vidéos", freemium: "10 max", solo: "Illimité", pro: "Illimité", elite: "Illimité" },
  { name: "Réponses aux offres", freemium: "5/mois", solo: "Illimité", pro: "Illimité", elite: "Illimité" },
  { name: "Messagerie", freemium: "10 conv/mois", solo: "Illimité", pro: "Illimité", elite: "Illimité" },
  { name: "Radio Vybbi - Soumissions", freemium: "1/mois", solo: "3/mois", pro: "10/mois", elite: "Illimité" },
  { name: "Mise en avant profil", freemium: false, solo: "2 jours/mois", pro: "7 jours/mois", elite: "Permanent VIP" },
  { name: "Statistiques détaillées", freemium: "Basiques", solo: "Détaillées", pro: "Analytics IA", elite: "Prédictifs IA" },
  { name: "Offres confidentielles premium", freemium: false, solo: false, pro: true, elite: true },
  { name: "Certification blockchain", freemium: false, solo: false, pro: "5/mois", elite: "Illimité" },
  { name: "Gestion contrats intelligente", freemium: false, solo: false, pro: true, elite: true },
  { name: "Smart Contracts automatisés", freemium: false, solo: false, pro: false, elite: true },
  { name: "Billetterie NFT", freemium: false, solo: false, pro: false, elite: true },
  { name: "Manager de compte personnel", freemium: false, solo: false, pro: false, elite: true },
  { name: "Support", freemium: "72h", solo: "24h", pro: "12h", elite: "24/7 VIP" },
];

const agentFeatures: Feature[] = [
  { name: "Gestion artistes", freemium: "-", solo: "5 max", pro: "Illimité", elite: "Illimité" },
  { name: "Accès base artistes", freemium: "-", solo: true, pro: true, elite: true },
  { name: "CRM", freemium: "-", solo: "Basique", pro: "Complet + IA", elite: "Complet + IA" },
  { name: "Workflows d'automatisation", freemium: "-", solo: false, pro: true, elite: true },
  { name: "Détection prospects chauds IA", freemium: "-", solo: false, pro: true, elite: true },
  { name: "Suivi commissions", freemium: "-", solo: "Manuel", pro: "Automatique", elite: "Automatique" },
  { name: "Facturation intégrée", freemium: "-", solo: false, pro: true, elite: true },
  { name: "Smart Contracts agence/artiste", freemium: "-", solo: false, pro: true, elite: true },
  { name: "Multi-bureaux/équipes", freemium: "-", solo: false, pro: false, elite: true },
  { name: "BI et analytics prédictifs", freemium: "-", solo: false, pro: "Standard", elite: "Avancés" },
  { name: "API personnalisée", freemium: "-", solo: false, pro: false, elite: true },
  { name: "Account manager dédié", freemium: "-", solo: false, pro: false, elite: true },
];

const venueFeatures: Feature[] = [
  { name: "Profil lieu complet", freemium: "-", solo: true, pro: true, elite: true },
  { name: "Événements publiés", freemium: "-", solo: "10/mois", pro: "Illimité", elite: "Illimité" },
  { name: "Galerie photos", freemium: "-", solo: "20 max", pro: "Illimité", elite: "Illimité" },
  { name: "Appels d'offres privés", freemium: "-", solo: false, pro: "Illimité", elite: "Illimité" },
  { name: "Artistes vérifiés premium", freemium: "-", solo: false, pro: true, elite: true },
  { name: "Gestion projet événementiel", freemium: "-", solo: "Basique", pro: "Complète", elite: "Complète" },
  { name: "Analytics d'impact", freemium: "-", solo: false, pro: true, elite: "Prédictifs" },
  { name: "Intégration billetterie", freemium: "-", solo: false, pro: "Liens", elite: "NFT natif" },
  { name: "Gestion sponsors", freemium: "-", solo: false, pro: true, elite: true },
  { name: "Multi-sites", freemium: "-", solo: false, pro: false, elite: true },
  { name: "Smart Contracts paiements", freemium: "-", solo: false, pro: false, elite: true },
  { name: "Web TV diffusion live", freemium: "-", solo: false, pro: false, elite: true },
];

export function ComparisonTable({ profileType }: ComparisonTableProps) {
  const features = profileType === "artist" ? artistFeatures : profileType === "agent" ? agentFeatures : venueFeatures;
  
  const renderCell = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-primary mx-auto" />;
    }
    if (value === false || value === "-") {
      return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
    }
    return <span className="text-xs text-foreground/90">{value}</span>;
  };

  return (
    <Card className="overflow-hidden border-border/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border/50">
            <tr className="bg-muted/30">
              <th className="text-left p-4 text-sm font-semibold min-w-[200px]">Fonctionnalité</th>
              {profileType === "artist" && <th className="text-center p-4 text-sm font-semibold min-w-[100px]">Gratuit</th>}
              <th className="text-center p-4 text-sm font-semibold min-w-[100px]">Solo</th>
              <th className="text-center p-4 text-sm font-semibold min-w-[100px]">Pro ⭐</th>
              <th className="text-center p-4 text-sm font-semibold min-w-[100px]">Elite</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr key={idx} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="p-4 text-sm line-clamp-2">{feature.name}</td>
                {profileType === "artist" && <td className="text-center p-4 min-w-[100px]">{renderCell(feature.freemium)}</td>}
                <td className="text-center p-4 min-w-[100px]">{renderCell(feature.solo)}</td>
                <td className="text-center p-4 bg-primary/5 min-w-[100px]">{renderCell(feature.pro)}</td>
                <td className="text-center p-4 min-w-[100px]">{renderCell(feature.elite)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-border/50 bg-muted/20">
            <tr>
              <td className="p-4 font-semibold">Prix</td>
              {profileType === "artist" && <td className="text-center p-4 font-bold text-primary">Gratuit</td>}
              <td className="text-center p-4 font-bold text-primary">
                {profileType === "artist" ? "9,90€" : "19,90€"}/mois
              </td>
              <td className="text-center p-4 font-bold text-primary bg-primary/5">
                {profileType === "artist" ? "29,90€" : "49,90€"}/mois
              </td>
              <td className="text-center p-4 font-bold text-primary">
                {profileType === "artist" ? "99,90€" : "149,90€"}/mois
              </td>
            </tr>
            <tr>
              <td></td>
              {profileType === "artist" && (
                <td className="text-center p-4">
                  <SubscriptionButton
                    tier="freemium"
                    profileType={profileType}
                    variant="outline"
                    label="Commencer"
                  />
                </td>
              )}
              <td className="text-center p-4">
                <SubscriptionButton
                  tier="solo"
                  profileType={profileType}
                  variant="secondary"
                  label="Choisir Solo"
                />
              </td>
              <td className="text-center p-4 bg-primary/5">
                <SubscriptionButton
                  tier="pro"
                  profileType={profileType}
                  variant="default"
                  label="Choisir Pro"
                />
              </td>
              <td className="text-center p-4">
                <SubscriptionButton
                  tier="elite"
                  profileType={profileType}
                  variant="secondary"
                  label="Contacter"
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
