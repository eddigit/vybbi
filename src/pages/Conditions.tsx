import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Shield, AlertTriangle, CheckCircle, Gavel, Globe, Ban } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function Conditions() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Conditions générales d'utilisation" 
        description="Consultez les conditions d'utilisation de Vybbi : règles pour artistes, lieux, agents et influenceurs. Politique de modération et ADN de la plateforme musicale."
        canonicalUrl={`${window.location.origin}/conditions`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            <FileText className="w-4 h-4 mr-2" />
            Version 2.0
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Conditions générales d'utilisation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Les présentes conditions définissent les règles d'utilisation de la plateforme Vybbi 
            et les droits et obligations de chaque utilisateur selon son profil.
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
                  <h4 className="font-semibold mb-2">Éditeur de la plateforme</h4>
                  <p className="text-muted-foreground">
                    Vybbi SAS<br />
                    Capital social : 10 000 €<br />
                    RCS Paris : [À compléter]<br />
                    SIRET : [À compléter]
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Siège social</h4>
                  <p className="text-muted-foreground">
                    102 avenue des Champs-Élysées<br />
                    75008 Paris, France<br />
                    Téléphone : +33 (0)1 XX XX XX XX<br />
                    Email : contact@vybbi.com
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
                  <h4 className="font-semibold mb-2">Juridiction</h4>
                  <p className="text-muted-foreground">
                    Tribunal de Commerce de Nanterre<br />
                    Droit français applicable<br />
                    Langue de référence : Français
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Terms */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6" />
                  Acceptation des conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  L'utilisation de la plateforme Vybbi implique l'acceptation pleine et entière des présentes conditions générales d'utilisation (CGU). 
                  Ces conditions s'appliquent à tous les utilisateurs, quel que soit leur profil : artistes, lieux, agents, managers ou influenceurs.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• L'inscription sur la plateforme vaut acceptation des CGU</li>
                  <li>• Les CGU peuvent être modifiées à tout moment avec notification préalable</li>
                  <li>• La version en vigueur est toujours accessible sur cette page</li>
                  <li>• En cas de désaccord, l'utilisateur doit cesser d'utiliser les services</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6" />
                  L'ADN Vybbi : Nos valeurs fondamentales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
                  <h4 className="font-semibold text-lg mb-4">Le loup des nuits qui déniche les talents</h4>
                  <p className="text-muted-foreground">
                    Vybbi incarne l'esprit du loup : intelligent, social et connecté à son écosystème. 
                    Nous croyons en la force du collectif pour révéler et amplifier les talents musicaux.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">🎵 Excellence artistique</h4>
                    <p className="text-muted-foreground">
                      Nous valorisons la qualité, l'originalité et le professionnalisme dans toutes les interactions sur la plateforme.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">🤝 Collaboration respectueuse</h4>
                    <p className="text-muted-foreground">
                      Les relations entre artistes, lieux et professionnels doivent être basées sur le respect mutuel et la transparence.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">🌍 Diversité culturelle</h4>
                    <p className="text-muted-foreground">
                      Vybbi célèbre tous les genres musicaux et toutes les cultures, favorisant l'ouverture et la découverte.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">⚡ Innovation technologique</h4>
                    <p className="text-muted-foreground">
                      Nous utilisons la technologie pour simplifier et améliorer l'expérience de tous les acteurs de l'industrie musicale.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6" />
                  Obligations des utilisateurs par profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-purple-600">👨‍🎤 Profils Artistes</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Fournir des informations exactes et à jour sur leur activité artistique</li>
                    <li>• Respecter les droits d'auteur pour tout contenu uploadé (musique, images, vidéos)</li>
                    <li>• Maintenir un comportement professionnel dans les échanges</li>
                    <li>• Honorer les engagements pris (dates, tarifs, conditions techniques)</li>
                    <li>• Signaler tout conflit ou problème via les canaux appropriés</li>
                    <li>• Ne pas utiliser la plateforme pour des activités illégales ou offensantes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">🏢 Profils Lieux & Événements</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Décrire fidèlement leurs installations et équipements</li>
                    <li>• Respecter les accords financiers conclus avec les artistes</li>
                    <li>• Assurer la sécurité et les conditions d'accueil décrites</li>
                    <li>• Communiquer clairement les attentes et exigences techniques</li>
                    <li>• Évaluer équitablement les prestations des artistes</li>
                    <li>• Respecter les réglementations en vigueur (licences, sécurité, etc.)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-green-600">📈 Profils Agents & Managers</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Agir dans l'intérêt de leurs artistes représentés</li>
                    <li>• Être transparent sur les conditions financières et contractuelles</li>
                    <li>• Posséder les qualifications et autorisations légales requises</li>
                    <li>• Maintenir la confidentialité des informations sensibles</li>
                    <li>• Faciliter les relations entre artistes et lieux</li>
                    <li>• Respecter les codes déontologiques de leur profession</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-orange-600">⚡ Programme Influenceur</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Promouvoir Vybbi de manière honnête et transparente</li>
                    <li>• Mentionner clairement les liens d'affiliation dans leurs communications</li>
                    <li>• Ne pas utiliser de pratiques trompeuses ou spam</li>
                    <li>• Respecter les guidelines des plateformes sociales utilisées</li>
                    <li>• Fournir des informations fiscales exactes pour les paiements</li>
                    <li>• Signaler toute anomalie dans le tracking ou les commissions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Ban className="h-6 w-6" />
                  Interdictions et politique de modération
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3">Comportements strictement interdits</h4>
                  <ul className="space-y-2 text-red-600 dark:text-red-300">
                    <li>• Harcèlement, discrimination ou propos offensants</li>
                    <li>• Usurpation d'identité ou fausses informations</li>
                    <li>• Violation des droits d'auteur ou de propriété intellectuelle</li>
                    <li>• Spam, pratiques commerciales déloyales ou frauduleuses</li>
                    <li>• Contournement des systèmes de paiement ou de commission</li>
                    <li>• Utilisation de bots ou de comptes multiples abusifs</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Système de modération à trois niveaux</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h5 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">⚠️ Avertissement</h5>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Premier manquement : notification et rappel des règles
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <h5 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">⏳ Suspension</h5>
                      <p className="text-sm text-orange-600 dark:text-orange-300">
                        Récidive : restriction temporaire d'accès (7-30 jours)
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <h5 className="font-semibold text-red-700 dark:text-red-400 mb-2">🚫 Exclusion</h5>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Manquement grave : bannissement définitif de la plateforme
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6" />
                  Responsabilités et limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Responsabilité de Vybbi</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Vybbi met en relation les professionnels mais n'est pas partie prenante des contrats conclus</li>
                    <li>• Nous nous efforçons d'assurer la continuité du service sans pouvoir le garantir à 100%</li>
                    <li>• Nous modérons le contenu mais ne pouvons contrôler toutes les interactions en temps réel</li>
                    <li>• Notre responsabilité est limitée aux dommages directs et prévisibles</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Responsabilité des utilisateurs</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Chaque utilisateur est responsable de ses publications et interactions</li>
                    <li>• Les contrats entre artistes et lieux relèvent de leur seule responsabilité</li>
                    <li>• Les utilisateurs s'engagent à respecter la législation applicable</li>
                    <li>• En cas de litige, les parties doivent privilégier la résolution amiable</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gavel className="h-6 w-6" />
                  Résolution des litiges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Procédure de médiation</h4>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Contact direct entre les parties via la messagerie Vybbi</li>
                    <li>Signalement à l'équipe Vybbi si aucune solution amiable n'est trouvée</li>
                    <li>Médiation proposée par Vybbi avec proposition de solution</li>
                    <li>Recours judiciaire en dernier ressort devant le Tribunal de Commerce de Nanterre</li>
                  </ol>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Médiation de la consommation</h4>
                  <p className="text-muted-foreground">
                    Conformément aux articles L.611-1 et suivants du Code de la consommation, 
                    les consommateurs peuvent recourir gratuitement au service de médiation CNPM - MEDIATION DE LA CONSOMMATION 
                    par voie électronique : <a href="https://cnpm-mediation-consommation.eu" className="text-primary hover:underline">cnpm-mediation-consommation.eu</a> 
                    ou par voie postale : CNPM - MEDIATION - CONSOMMATION - 27 avenue de la libération - 42400 Saint-Chamond.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center text-muted-foreground">
            <p>
              Conditions générales d'utilisation en vigueur depuis le 15 septembre 2025<br />
              Dernière modification : 15 septembre 2025<br />
              Pour toute question : <a href="mailto:legal@vybbi.com" className="text-primary hover:underline">legal@vybbi.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}