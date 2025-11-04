import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function PricingFAQ() {
  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, absolument ! Vous pouvez upgrader ou downgrader votre plan à tout moment. En cas d'upgrade, vous ne payez que la différence au prorata. En cas de downgrade, le changement prend effet au prochain cycle de facturation.",
    },
    {
      question: "Y a-t-il une période d'essai gratuite ?",
      answer: "Oui, tous les plans payants bénéficient d'une période d'essai gratuite de 30 jours. Aucune carte bancaire n'est requise pour commencer. Vous pouvez annuler à tout moment pendant la période d'essai sans frais.",
    },
    {
      question: "Que se passe-t-il si j'annule mon abonnement ?",
      answer: "Vous conservez l'accès à toutes les fonctionnalités premium jusqu'à la fin de votre période payée. Ensuite, votre compte repasse automatiquement au plan Freemium (artistes) ou est mis en pause (agents/lieux). Toutes vos données sont conservées.",
    },
    {
      question: "Les tarifs incluent-ils la TVA ?",
      answer: "Les prix affichés sont HT. La TVA applicable (20% en France) sera ajoutée lors du paiement selon votre pays de résidence. Les factures sont générées automatiquement chaque mois.",
    },
    {
      question: "Proposez-vous des réductions pour les paiements annuels ?",
      answer: "Oui ! En choisissant un engagement annuel, vous bénéficiez de 20% de réduction sur tous les plans. Cela représente plus de 2 mois gratuits sur l'année.",
    },
    {
      question: "Comment fonctionnent les Vybbi Tokens ?",
      answer: "Les Vybbi Tokens sont notre monnaie interne qui permet des micro-transactions (boosts, tips, NFT). Ils sont inclus dans les plans payants sous forme de récompenses quotidiennes, et peuvent être achetés séparément.",
    },
    {
      question: "Le plan Elite inclut-il un account manager dédié ?",
      answer: "Oui, avec le plan Elite, vous bénéficiez d'un account manager personnel qui vous accompagne stratégiquement, vous forme aux best practices, et répond à vos questions en priorité (réponse sous 2h, hotline dédiée).",
    },
    {
      question: "Puis-je gérer plusieurs profils avec un seul abonnement ?",
      answer: "Pour les artistes : 1 abonnement = 1 profil artiste. Pour les agents : le plan Solo permet 5 artistes, Pro et Elite sont illimités. Pour les lieux : le plan Elite permet la gestion multi-sites.",
    },
    {
      question: "Les Smart Contracts sont-ils vraiment automatiques ?",
      answer: "Oui, avec les plans Pro et Elite, les Smart Contracts sur la blockchain Solana permettent l'automatisation des paiements, des royalties et des splits de revenus. Une fois configurés, ils s'exécutent automatiquement sans intervention humaine.",
    },
    {
      question: "Que signifie 'Programme Exclusif jusqu'au 31/01/2026' ?",
      answer: "C'est notre offre de lancement. Les tarifs affichés et les conditions avantageuses (notamment le programme influenceur) sont garantis jusqu'au 31 janvier 2026 pour tous ceux qui s'inscrivent avant cette date. Après, les tarifs pourront évoluer pour les nouveaux membres.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Questions Fréquentes sur la Tarification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
