import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  Calendar,
  FileText,
  Music,
  Target,
  TrendingUp,
  Shield,
  Link as LinkIcon,
  Search,
  Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminKnowledge() {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  if (!hasRole('admin')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Accès Refusé</h2>
            <p className="text-muted-foreground">
              Vous devez être administrateur pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const knowledgeBase = {
    users: {
      title: "Gestion des Utilisateurs",
      icon: Users,
      sections: [
        {
          title: "Types de Profils",
          items: [
            { question: "Comment créer un profil artiste ?", answer: "Aller sur /auth puis choisir 'Artiste' lors de l'inscription. Le profil sera créé automatiquement." },
            { question: "Comment gérer les agents ?", answer: "Les agents peuvent être vus dans Admin Dashboard > Utilisateurs. Filtrer par type 'agent'." },
            { question: "Où voir les managers ?", answer: "Admin Dashboard > Utilisateurs, filtrer par 'manager'. Ils peuvent gérer plusieurs artistes." },
            { question: "Comment modérer les profils ?", answer: "Aller dans Admin > Modération pour approuver/rejeter les profils et contenus." }
          ]
        },
        {
          title: "Authentification", 
          items: [
            { question: "Réinitialiser un mot de passe", answer: "Via Supabase Auth Dashboard ou fonction 'Reset Password' dans l'interface admin." },
            { question: "Désactiver un compte", answer: "Dans Admin > Modération, possibilité de suspendre temporairement un utilisateur." }
          ]
        }
      ]
    },
    messaging: {
      title: "Système de Messagerie",
      icon: MessageSquare,
      sections: [
        {
          title: "Fonctionnalités",
          items: [
            { question: "Où gérer les conversations ?", answer: "Page /messages pour voir toutes les conversations. Les admins peuvent voir toutes les conversations dans Admin Dashboard." },
            { question: "Politique de messaging", answer: "Les agents/managers ne peuvent envoyer qu'1 message initial aux artistes jusqu'à réponse. Bypass possible pour les admins." },
            { question: "Messages administrateur", answer: "Fonction send_admin_message permet d'envoyer des messages officiels avec préfixe spécial." }
          ]
        }
      ]
    },
    events: {
      title: "Événements & Annonces", 
      icon: Calendar,
      sections: [
        {
          title: "Gestion",
          items: [
            { question: "Créer un événement", answer: "Page /events (pour les lieux) ou via le dashboard du lieu. Status draft/published." },
            { question: "Gérer les annonces", answer: "Page /annonces/manager pour créer, /annonces pour voir le mur public." },
            { question: "Applications", answer: "Les artistes peuvent postuler aux annonces. Statut gérable par le créateur de l'annonce." }
          ]
        }
      ]
    },
    content: {
      title: "Contenu & Blog",
      icon: FileText, 
      sections: [
        {
          title: "Articles",
          items: [
            { question: "Créer un article", answer: "Admin Dashboard > Communication > Créer un article. Support de markdown et images." },
            { question: "Publier un article", answer: "Changer le status de 'draft' à 'published' dans l'interface d'édition." }
          ]
        }
      ]
    },
    radio: {
      title: "Radio Vybbi",
      icon: Music,
      sections: [
        {
          title: "Gestion",
          items: [
            { question: "Approuver des morceaux", answer: "Admin Dashboard > Radio > Liste des morceaux en attente d'approbation." },
            { question: "Gérer les playlists", answer: "Admin Dashboard > Radio > Gestion des playlists et poids des morceaux." },
            { question: "Abonnements artistes", answer: "Système de priorité et boost pour les artistes avec abonnement premium." }
          ]
        }
      ]
    },
    affiliate: {
      title: "Affiliation (Influenceurs)",
      icon: TrendingUp,
      sections: [
        {
          title: "Gestion des Influenceurs",
          items: [
            { question: "Créer un profil influenceur", answer: "Lors de l'inscription, choisir le type 'Influenceur'. Accès automatique au dashboard d'affiliation." },
            { question: "Gérer les liens d'affiliation", answer: "Page /dashboard pour les influenceurs. Possibilité de créer des liens avec codes personnalisés." },
            { question: "Voir les statistiques", answer: "Admin > Influenceurs pour vue d'ensemble. Chaque influenceur voit ses stats dans son dashboard." },
            { question: "Tracking des conversions", answer: "Automatique via ?ref=CODE dans les URL. Conversions trackées lors des inscriptions/abonnements." }
          ]
        },
        {
          title: "Codes d'Affiliation", 
          items: [
            { question: "Format des codes", answer: "Codes générés automatiquement (6 chars) ou personnalisés par l'influenceur." },
            { question: "QR Codes", answer: "Génération automatique de QR codes pour chaque lien d'affiliation, téléchargeables." },
            { question: "Suivi des clics", answer: "Compteur automatique de clics et stockage des données de visite (IP, user-agent, référent)." }
          ]
        },
        {
          title: "Commissions",
          items: [
            { question: "Taux de commission", answer: "5% par défaut sur les conversions (inscriptions premium, abonnements)." },
            { question: "Paiement des commissions", answer: "Système de tracking en base, paiement manuel via dashboard admin." },
            { question: "Statuts des conversions", answer: "pending, confirmed, paid - gestion dans Admin > Influenceurs." }
          ]
        }
      ]
    },
    ai: {
      title: "Intelligence Artificielle",
      icon: Target,
      sections: [
        {
          title: "Vybbi Assistant",
          items: [
            { question: "Configuration", answer: "Admin Dashboard > IA > Configuration pour ajuster les paramètres de l'assistant." },
            { question: "Base de connaissances", answer: "Admin Dashboard > IA > Base de Connaissances pour mettre à jour les informations." },
            { question: "Monitoring", answer: "Admin Dashboard > IA > Monitoring pour voir les performances et logs." }
          ]
        }
      ]
    },
    system: {
      title: "Administration Système",
      icon: Shield,
      sections: [
        {
          title: "Sécurité",
          items: [
            { question: "Row Level Security", answer: "Policies Supabase configurées pour chaque table. Vérification via Supabase Dashboard." },
            { question: "Rôles utilisateurs", answer: "Table user_roles avec enum app_role. Fonction has_role() pour vérifications." },
            { question: "Modération", answer: "Admin > Modération pour gérer les signalements et contenus suspects." }
          ]
        },
        {
          title: "Base de Données",
          items: [
            { question: "Migrations", answer: "Via Supabase CLI ou interface web. Toujours tester en dev avant production." },
            { question: "Backup", answer: "Backups automatiques Supabase. Possibilité d'export manuel via dashboard." },
            { question: "Performance", answer: "Monitoring dans Admin Dashboard > Système. Optimisations SQL recommandées." }
          ]
        }
      ]
    }
  };

  const filteredKnowledge = Object.entries(knowledgeBase).reduce((acc, [key, section]) => {
    const filteredSections = section.sections.map(subsection => ({
      ...subsection,
      items: subsection.items.filter(
        item => 
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(subsection => subsection.items.length > 0);

    if (filteredSections.length > 0) {
      acc[key] = { ...section, sections: filteredSections };
    }
    return acc;
  }, {} as typeof knowledgeBase);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de Connaissances</h1>
          <p className="text-muted-foreground">
            Guide complet des fonctionnalités et processus de la plateforme
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Documentation Complète
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans la base de connaissances..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(filteredKnowledge).map(([key, section]) => (
          <Card key={key} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="w-5 h-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {section.sections.map((subsection, idx) => (
                  <AccordionItem key={idx} value={`${key}-${idx}`}>
                    <AccordionTrigger>{subsection.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {subsection.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="border-l-2 border-primary/20 pl-3">
                            <h4 className="font-medium text-sm mb-1">{item.question}</h4>
                            <p className="text-sm text-muted-foreground">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(filteredKnowledge).length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-6 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
            <p className="text-muted-foreground">
              Aucune information ne correspond à votre recherche "{searchTerm}".
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}