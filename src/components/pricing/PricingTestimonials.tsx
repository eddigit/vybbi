import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  plan: string;
  image?: string;
  quote: string;
  rating: number;
}

interface PricingTestimonialsProps {
  profileType: "artist" | "agent" | "venue";
}

export function PricingTestimonials({ profileType }: PricingTestimonialsProps) {
  const artistTestimonials: Testimonial[] = [
    {
      name: "Sophie Laurent",
      role: "DJ & Productrice",
      plan: "Plan Pro",
      quote: "Depuis que je suis passée au plan Pro, j'ai triplé mes bookings. Les analytics IA m'ont aidée à cibler les bons lieux et le ROI est dingue. 29,90€ c'est rien comparé à ce que je gagne maintenant.",
      rating: 5,
    },
    {
      name: "Marcus Dubois",
      role: "Artiste Hip-Hop",
      plan: "Plan Solo",
      quote: "Le plan Solo est parfait pour commencer. J'ai enfin un profil pro complet, je peux répondre à toutes les offres sans limite, et ça m'a coûté que 10€. Best investissement de ma carrière.",
      rating: 5,
    },
    {
      name: "Luna Chen",
      role: "Chanteuse Live",
      plan: "Plan Elite",
      quote: "Mon manager personnel Vybbi m'a aidée à structurer ma stratégie de tournée. Les Smart Contracts automatisent tout, je suis payée directement. Le plan Elite vaut chaque centime pour quelqu'un de sérieux.",
      rating: 5,
    },
  ];

  const agentTestimonials: Testimonial[] = [
    {
      name: "Jean-Michel Petit",
      role: "Agent indépendant",
      plan: "Plan Pro",
      quote: "Le CRM avec scoring IA est une tuerie. Je détecte les prospects chauds instantanément et les workflows d'automatisation me font gagner 10h/semaine. Mon taux de conversion a explosé.",
      rating: 5,
    },
    {
      name: "Clara Martinez",
      role: "Manager d'artistes",
      plan: "Plan Elite",
      quote: "Gérer 15 artistes sur différents bureaux sans le plan Elite serait impossible. La BI prédictive me permet de projeter les revenus et d'optimiser les stratégies. Indispensable pour une agence pro.",
      rating: 5,
    },
    {
      name: "Thomas Roy",
      role: "Booking Agent",
      plan: "Plan Solo",
      quote: "Parfait pour démarrer mon activité d'agent. Je gère mes 5 premiers artistes efficacement et le CRM basique suffit largement. Quand je scalerai, je passerai Pro.",
      rating: 4,
    },
  ];

  const venueTestimonials: Testimonial[] = [
    {
      name: "David Leroy",
      role: "Propriétaire club parisien",
      plan: "Plan Pro",
      quote: "La gestion d'événements illimitée et les appels d'offres privés m'ont permis de trouver des talents incroyables. Les analytics d'impact prouvent le ROI à mes sponsors. Game changer.",
      rating: 5,
    },
    {
      name: "Amélie Blanchard",
      role: "Organisatrice festivals",
      plan: "Plan Elite",
      quote: "Multi-sites, billetterie NFT, Smart Contracts pour payer les artistes automatiquement... Le plan Elite gère mes 3 festivals sans effort. La Web TV diffuse nos lives, c'est fou.",
      rating: 5,
    },
    {
      name: "Pierre Morel",
      role: "Gérant bar musical",
      plan: "Plan Solo",
      quote: "10 événements/mois c'est parfait pour mon bar. Je trouve des artistes locaux rapidement et le calendrier événementiel simplifie tout. Excellent rapport qualité-prix.",
      rating: 5,
    },
  ];

  const testimonials =
    profileType === "artist"
      ? artistTestimonials
      : profileType === "agent"
      ? agentTestimonials
      : venueTestimonials;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
          <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={testimonial.image} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              "{testimonial.quote}"
            </p>

            <div className="text-xs text-primary font-medium bg-primary/10 rounded-full px-3 py-1 inline-block">
              {testimonial.plan}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
