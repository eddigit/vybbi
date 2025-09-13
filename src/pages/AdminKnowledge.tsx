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
  Settings,
  Radio,
  Share2,
  Bot,
  Mail,
  CreditCard,
  User
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
    },
    
    "Radio & Web TV": {
      title: "Radio & Web TV Vybbi",
      icon: Radio,
      sections: [
        {
          title: "Radio Vybbi",
          items: [
            {
              question: "Comment fonctionne la Radio Vybbi ?",
              answer: "La Radio Vybbi diffuse en continu des morceaux d'artistes inscrits. Les artistes peuvent soumettre leurs morceaux via leur profil, et les morceaux approuvés sont intégrés dans les playlists automatiques."
            },
            {
              question: "Comment un artiste peut-il soumettre un morceau ?",
              answer: "Dans le profil artiste, section 'Médias', upload d'un fichier audio. Le morceau passe en modération admin avant diffusion. Les abonnés premium ont une priorité de diffusion."
            },
            {
              question: "Qu'est-ce que l'abonnement radio premium ?",
              answer: "Abonnement payant donnant aux artistes : priorité de diffusion, boost dans les playlists, statistiques détaillées d'écoute, et approbation automatique des morceaux."
            }
          ]
        },
        {
          title: "Web TV",
          items: [
            {
              question: "À quoi sert la Web TV Vybbi ?",
              answer: "Plateforme de streaming vidéo pour interviews d'artistes, reportages événementiels, concerts live et contenus exclusifs. Accessible depuis l'onglet Web TV du menu principal."
            },
            {
              question: "Comment programmer un live sur la Web TV ?",
              answer: "Via l'interface admin, section 'Contenu', planifier un événement live avec date/heure. Le studio live intégré permet la diffusion en direct depuis la plateforme."
            }
          ]
        }
      ]
    },

    "Système d'Affiliation": {
      title: "Affiliation (Influenceurs)",
      icon: Share2,
      sections: [
        {
          title: "Gestion des Influenceurs",
          items: [
            {
              question: "Comment créer un lien d'affiliation ?",
              answer: "Dans Admin > Influenceurs, sélectionner un profil influenceur et cliquer 'Générer Lien'. Le code unique est automatiquement créé et peut être personnalisé."
            },
            {
              question: "Comment suivre les conversions d'affiliation ?",
              answer: "Le système track automatiquement les visites via ?ref=CODE. Les conversions sont enregistrées lors d'inscriptions, abonnements ou achats. Tableau de bord disponible dans Admin > Influenceurs."
            },
            {
              question: "Comment sont calculées les commissions ?",
              answer: "5% par défaut sur la valeur de conversion. Commission payée après confirmation de la conversion (inscription validée, paiement confirmé). Historique dans Admin > Commissions."
            }
          ]
        },
        {
          title: "Tracking & Analytics",
          items: [
            {
              question: "Quelles métriques sont trackées ?",
              answer: "Clicks sur liens, conversions, taux de conversion, revenue généré, géolocalisation des visiteurs. Dashboard temps réel pour chaque influenceur."
            },
            {
              question: "Comment générer un QR Code d'affiliation ?",
              answer: "Dans la fiche influenceur, bouton 'QR Code' génère automatiquement un QR code contenant le lien d'affiliation. Téléchargeable en PNG haute résolution."
            }
          ]
        }
      ]
    },

    "Prospection & IA": {
      title: "Système de Prospection IA",
      icon: Bot,
      sections: [
        {
          title: "Prospection Automatisée",
          items: [
            {
              question: "Comment fonctionne la prospection IA ?",
              answer: "L'IA analyse les réseaux sociaux (Instagram, TikTok, YouTube) pour identifier de nouveaux talents. Scoring automatique basé sur engagement, croissance d'audience et qualité du contenu."
            },
            {
              question: "Comment lancer une campagne de prospection ?",
              answer: "Admin > Prospection > Nouvelle Campagne. Définir critères (genre musical, zone géographique, taille d'audience). L'IA génère une liste de prospects avec scoring."
            },
            {
              question: "Comment contacter un prospect identifié ?",
              answer: "Via l'outil d'emailing intégré. Templates automatiques personnalisés selon le profil du prospect. Suivi des ouvertures, clicks et réponses dans le dashboard."
            }
          ]
        },
        {
          title: "Gestion des Leads",
          items: [
            {
              question: "Comment qualifier un lead ?",
              answer: "Système de scoring automatique (A, B, C) + évaluation manuelle. Statuts : prospect > contacté > intéressé > converti > client. Workflow automatisé de suivi."
            },
            {
              question: "Que faire si un prospect s'inscrit ?",
              answer: "Conversion automatiquement trackée. Attribution à l'agent ayant initié le contact. Commission calculée selon grille tarifaire. Notification aux équipes commerciales."
            }
          ]
        }
      ]
    },

    "Système d'Emailing": {
      title: "Gestion des Emailings",
      icon: Mail,
      sections: [
        {
          title: "Templates & Campagnes",
          items: [
            {
              question: "Comment créer un template email ?",
              answer: "Admin > Communication > Templates. Éditeur visuel avec variables dynamiques ({nom}, {genre}, {ville}). Preview temps réel et test d'envoi avant publication."
            },
            {
              question: "Comment envoyer une campagne email ?",
              answer: "Admin > Communication > Nouvelles Campagnes. Sélection du template, audience cible (par profil/genre/localisation), programmation d'envoi. Suivi temps réel des métriques."
            },
            {
              question: "Quelles variables dynamiques sont disponibles ?",
              answer: "Variables profil : {nom}, {prenom}, {ville}, {genre_musical}, {type_profil}. Variables système : {lien_profil}, {date}, {plateforme}. Personnalisation automatique par destinataire."
            }
          ]
        },
        {
          title: "Analytics & Performance",
          items: [
            {
              question: "Comment suivre les performances d'une campagne ?",
              answer: "Dashboard avec taux d'ouverture, clicks, conversions, bounces. Segmentation par audience. A/B testing automatique pour optimiser les subject lines."
            },
            {
              question: "Comment éviter le spam ?",
              answer: "Validation DNS (SPF, DKIM), respect RGPD, lien de désabonnement obligatoire. Monitoring réputation IP. Limitation envois par heure pour préserver delivrability."
            }
          ]
        }
      ]
    },

    "Monétisation & Abonnements": {
      title: "Système de Monétisation",
      icon: CreditCard,
      sections: [
        {
          title: "Abonnements Premium",
          items: [
            {
              question: "Quels sont les types d'abonnements ?",
              answer: "Basic (gratuit), Premium (29€/mois), Pro (99€/mois). Chaque niveau débloque : boost radio, priorité booking, analytics avancés, support priority."
            },
            {
              question: "Comment un artiste souscrit un abonnement ?",
              answer: "Dashboard artiste > Abonnement > Upgrade. Paiement Stripe sécurisé. Activation immédiate des fonctionnalités premium. Gestion auto-renouvellement."
            },
            {
              question: "Comment gérer les commissions agents ?",
              answer: "Système automatisé : 5-15% selon niveau agent. Calcul sur conversions confirmées. Paiement mensuel via virement. Dashboard dédié pour suivi commissions."
            }
          ]
        }
      ]
    },

    "Communautés & Chat": {
      title: "Système de Communautés",
      icon: User,
      sections: [
        {
          title: "Gestion des Communautés",
          items: [
            {
              question: "Comment créer une nouvelle communauté ?",
              answer: "Admin > Dashboard > Communautés > Nouvelle Communauté. Choisir type (public/privé/invitation), catégorie (genre/radio/professionnel), et configurer les canaux de discussion."
            },
            {
              question: "Comment modérer une communauté ?",
              answer: "Système de rôles : owner > admin > moderator > member. Les modérateurs peuvent épingler messages, supprimer contenu inapproprié, et muter des utilisateurs temporairement."
            },
            {
              question: "Quelles sont les communautés par défaut ?",
              answer: "Radio Vybbi Live (chat en direct), Artistes Hip-Hop, Agents & Managers, Lieux & Événements, Salon Influenceurs (privé). Chaque communauté a ses canaux spécialisés."
            }
          ]
        },
        {
          title: "Chat en Temps Réel",
          items: [
            {
              question: "Comment fonctionne le chat live radio ?",
              answer: "Canal dédié 'Radio Vybbi Live' avec type 'live_radio'. Messages en temps réel pendant les diffusions. Intégration avec le player radio pour synchroniser discussions et morceaux."
            },
            {
              question: "Comment rejoindre une communauté ?",
              answer: "Page /communities > Parcourir les communautés publiques > Bouton 'Rejoindre'. Pour les communautés privées, nécessite invitation d'un admin/owner."
            },
            {
              question: "Notifications et mentions",
              answer: "Système de notifications push pour nouveaux messages, mentions @username, et messages épinglés. Paramétrable par utilisateur dans les réglages de profil."
            }
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