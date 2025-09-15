import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Database, UserCheck, Clock, Globe, Mail } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function Confidentialite() {
  const sections = [
    {
      icon: Database,
      title: "Collecte des données",
      content: [
        "Nous collectons uniquement les données nécessaires au fonctionnement de nos services",
        "Informations de profil : nom, email, informations artistiques/professionnelles",
        "Données d'utilisation : interactions, préférences, statistiques d'écoute",
        "Données techniques : adresse IP, type de navigateur, système d'exploitation"
      ]
    },
    {
      icon: Lock,
      title: "Utilisation des données",
      content: [
        "Fournir et améliorer nos services de mise en relation professionnelle",
        "Personnaliser votre expérience sur la plateforme",
        "Diffuser votre contenu musical sur Radio Vybbi (avec votre consentement)",
        "Faciliter les communications entre professionnels de la musique",
        "Analyser l'utilisation pour améliorer nos fonctionnalités"
      ]
    },
    {
      icon: UserCheck,
      title: "Vos droits",
      content: [
        "Droit d'accès : consulter toutes vos données personnelles",
        "Droit de rectification : corriger vos informations inexactes",
        "Droit à l'effacement : supprimer votre compte et vos données",
        "Droit à la portabilité : récupérer vos données dans un format standard",
        "Droit d'opposition : refuser certains traitements de vos données"
      ]
    },
    {
      icon: Shield,
      title: "Sécurité",
      content: [
        "Chiffrement SSL/TLS pour toutes les communications",
        "Stockage sécurisé sur des serveurs européens certifiés",
        "Accès restreint aux données selon le principe du moindre privilège",
        "Audits de sécurité réguliers et tests de pénétration",
        "Sauvegdes automatiques et plan de continuité d'activité"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Politique de confidentialité" 
        description="Découvrez comment Vybbi protège vos données personnelles. Politique de confidentialité transparente conforme au RGPD pour tous les profils d'artistes, lieux et agents."
        canonicalUrl={`${window.location.origin}/confidentialite`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            <Shield className="w-4 h-4 mr-2" />
            RGPD Conforme
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Politique de confidentialité
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Chez Vybbi, nous nous engageons à protéger vos données personnelles et à respecter votre vie privée. 
            Cette politique détaille nos pratiques de collecte, utilisation et protection des données.
          </p>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6" />
                Informations légales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Responsable du traitement</h4>
                  <p className="text-muted-foreground">
                    Vybbi SAS<br />
                    102 avenue des Champs-Élysées<br />
                    75008 Paris, France
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Directeur de la publication</h4>
                  <p className="text-muted-foreground">
                    Gilles Korzec<br />
                    Gérant de Vybbi SAS
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Juridiction compétente</h4>
                  <p className="text-muted-foreground">
                    Tribunal de Commerce de Nanterre<br />
                    Droit français applicable
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact données personnelles</h4>
                  <p className="text-muted-foreground">
                    <Mail className="h-4 w-4 inline mr-2" />
                    privacy@vybbi.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Profile-Specific Sections */}
          <div className="mt-12 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6" />
                  Données spécifiques par type de profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Profils Artistes</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Nom de scène, biographie, genres musicaux</li>
                    <li>• Photos, vidéos, samples audio pour portfolio</li>
                    <li>• Disponibilités et tarifs (optionnels)</li>
                    <li>• Statistiques d'écoute sur Radio Vybbi</li>
                    <li>• Évaluations et avis professionnels reçus</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Profils Lieux & Événements</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Informations du lieu : adresse, capacité, équipements</li>
                    <li>• Événements organisés et programmation</li>
                    <li>• Photos et vidéos du lieu</li>
                    <li>• Partenariats avec autres établissements</li>
                    <li>• Historique des collaborations avec artistes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Profils Agents & Managers</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Informations professionnelles et entreprise</li>
                    <li>• Roster d'artistes représentés</li>
                    <li>• Données de commissions et facturation</li>
                    <li>• Statistiques de performance</li>
                    <li>• Communications avec artistes et lieux</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Programme Influenceur</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Données de tracking des liens d'affiliation</li>
                    <li>• Statistiques de conversions et commissions</li>
                    <li>• Informations bancaires pour les paiements</li>
                    <li>• Historique des recommandations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-6 w-6" />
                  Durée de conservation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Compte actif</h4>
                    <p className="text-muted-foreground">
                      Vos données sont conservées tant que votre compte est actif et nécessaire pour fournir nos services.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Compte supprimé</h4>
                    <p className="text-muted-foreground">
                      Suppression complète sous 30 jours, sauf obligations légales (facturation, litiges).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Données de facturation</h4>
                    <p className="text-muted-foreground">
                      Conservées 10 ans conformément aux obligations comptables françaises.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Logs de sécurité</h4>
                    <p className="text-muted-foreground">
                      Conservés 1 an maximum pour la sécurité et la prévention des fraudes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cookies et technologies similaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation de nos services :
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Cookies essentiels</strong> : nécessaires au fonctionnement (authentification, sécurité)</li>
                  <li>• <strong>Cookies de performance</strong> : statistiques d'utilisation anonymisées</li>
                  <li>• <strong>Cookies de préférences</strong> : mémorisation de vos choix (langue, thème)</li>
                </ul>
                <p className="text-muted-foreground">
                  Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur ou notre 
                  <a href="/cookies" className="text-primary hover:underline ml-1">politique de cookies détaillée</a>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exercer vos droits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Pour exercer vos droits ou pour toute question concernant le traitement de vos données personnelles :
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Contact direct</h4>
                    <p className="text-muted-foreground">
                      <Mail className="h-4 w-4 inline mr-2" />
                      privacy@vybbi.com
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Délai de réponse</h4>
                    <p className="text-muted-foreground">
                      Maximum 1 mois à compter de la réception de votre demande
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Réclamation CNIL</h4>
                  <p className="text-muted-foreground">
                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation 
                    auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) : 
                    <a href="https://www.cnil.fr" className="text-primary hover:underline ml-1">www.cnil.fr</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center text-muted-foreground">
            <p>
              Dernière mise à jour : 15 septembre 2025<br />
              Cette politique peut être mise à jour. Les modifications importantes vous seront notifiées.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}