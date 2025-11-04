import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign } from "lucide-react";

interface ROICalculatorProps {
  profileType: "artist" | "agent" | "venue";
}

export function ROICalculator({ profileType }: ROICalculatorProps) {
  const [bookingsPerMonth, setBookingsPerMonth] = useState(2);
  const [avgBookingPrice, setAvgBookingPrice] = useState(500);

  const planPrices = {
    artist: { solo: 9.9, pro: 29.9, elite: 99.9 },
    agent: { solo: 19.9, pro: 49.9, elite: 149.9 },
    venue: { solo: 19.9, pro: 49.9, elite: 149.9 },
  };

  const monthlyRevenue = bookingsPerMonth * avgBookingPrice;
  const proPlanPrice = planPrices[profileType].pro;
  const roiMultiplier = monthlyRevenue / proPlanPrice;
  const breakEvenHours = (proPlanPrice / avgBookingPrice) * (profileType === "artist" ? 2 : 4);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Calculateur de Retour sur Investissement
        </CardTitle>
        <CardDescription>
          Découvrez combien vous pourriez économiser et gagner avec le plan Pro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bookings par mois : {bookingsPerMonth}</Label>
            <Slider
              value={[bookingsPerMonth]}
              onValueChange={(v) => setBookingsPerMonth(v[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Prix moyen par booking : {avgBookingPrice}€</Label>
            <Slider
              value={[avgBookingPrice]}
              onValueChange={(v) => setAvgBookingPrice(v[0])}
              min={100}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{monthlyRevenue.toLocaleString()}€</div>
            <div className="text-xs text-muted-foreground">Revenus mensuels estimés</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">x{roiMultiplier.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Retour sur investissement</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-primary">{breakEvenHours.toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">Temps pour rentabiliser</div>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-center">
          <p className="text-sm text-foreground/80">
            Avec <span className="font-bold text-primary">{bookingsPerMonth} bookings/mois</span> à{" "}
            <span className="font-bold text-primary">{avgBookingPrice}€</span>, votre abonnement Pro à{" "}
            <span className="font-bold text-primary">{proPlanPrice}€/mois</span> est rentabilisé en{" "}
            <span className="font-bold text-primary">{breakEvenHours.toFixed(1)} heures</span> de travail.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Soit un ROI de <span className="font-bold text-primary">{roiMultiplier.toFixed(0)}x</span> votre investissement mensuel !
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
