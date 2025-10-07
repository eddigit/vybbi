import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Zap, BarChart3, Smartphone, Lock, Code, Brain, TrendingUp, Globe, Users, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Blockchain = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="m5 15 2-2" />
    <path d="m5 9 2 2" />
    <path d="m15 19 2-2" />
    <path d="m15 5 2 2" />
  </svg>
);

export default function Technologie() {
  const techFeatures = [
    {
      icon: Brain,
      title: "Intelligence Artificielle : Le Matching Parfait",
      problem: "Comment trouver l'artiste parfait parmi des milliers de profils ?",
      solution: "Un algorithme d'IA propriétaire qui analyse :",
      features: [
        "Style musical et influences",
        "Historique de performances", 
        "Feedback et ratings",
        "Disponibilités géographiques",
        "Budget et préférences de l'organisateur"
      ],
      result: "87% de taux de satisfaction sur les recommandations (vs 34% pour la recherche manuelle).",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Blockchain,
      title: "Blockchain : La Révolution des Droits d'Auteur",
      problem: "Traçabilité des œuvres, paiements des royalties, contrats opaques.",
      solution: "Partenariat exclusif pour intégrer :",
      features: [
        "Certification NFT des performances live",
        "Smart contracts pour paiements automatiques",
        "Traçabilité blockchain des créations", 
        "Droits d'auteur numériques inviolables"
      ],
      result: "Premier écosystème musical avec blockchain native intégrée.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Prédictifs : L'Intelligence du Marché",
      problem: "Décisions basées sur l'intuition, pas sur les données.",
      solution: "Tableaux de bord intelligents qui révèlent :",
      features: [
        "Tendances musicales émergentes par région",
        "Prédictions de succès d'événements",
        "Optimisation des tarifs en temps réel",
        "ROI prévisionnel des investissements"
      ],
      result: "Organisateurs augmentent leur ROI de 34% en moyenne.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Smartphone,
      title: "Mobile-First : L'Expérience Utilisateur Parfaite",
      problem: "78% des réservations se font sur mobile dans l'entertainment.",
      solution: "Notre Réponse :",
      features: [
        "App native iOS/Android ultra-rapide",
        "Interface intuitive inspirée des réseaux sociaux",
        "Notifications push intelligentes",
        "Mode hors-ligne pour les événements"
      ],
      result: "Expérience utilisateur optimisée pour le mobile.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const integrations = [
    "SACEM/ASCAP : Déclarations automatiques",
    "Spotify/Apple Music : Import playlists et stats", 
    "Google Maps : Géolocalisation et itinéraires",
    "Stripe/PayPal : Paiements sécurisés multi-devises",
    "Zoom/Teams : Auditions virtuelles"
  ];

  const security = [
    "Chiffrement AES-256 bout en bout",
    "Authentification multi-facteurs",
    "Conformité RGPD stricte", 
    "Audits de sécurité trimestriels",
    "Sauvegarde redondante multi-zones"
  ];

  const roadmap = [
    { period: "Q1 2025", feature: "Lancement IA de recommandation v2.0" },
    { period: "Q2 2025", feature: "Intégration blockchain complète" },
    { period: "Q3 2025", feature: "Réalité augmentée pour prévisualisation événements" },
    { period: "Q4 2025", feature: "Assistant vocal IA pour organisateurs" },
    { period: "2026", feature: "Expansion métaverse et concerts virtuels" },
    { period: "2027", feature: "Prédiction tendances musicales par IA" }
  ];

  const investorStats = [
    "Équipe de développement de 15+ ingénieurs",
    "Budget R&D de 30% du chiffre d'affaires",
    "3 brevets en cours de dépôt",
    "Partenariats technologiques exclusifs"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/brand/vybbi-logo.png" alt="Vybbi Logo" className="w-8 h-8" />
                <span className="font-bold text-lg">Vybbi</span>
              </div>
            </div>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 text-sm px-4 py-2">
            <Cpu className="w-4 h-4 mr-2" />
            INNOVATION TECHNOLOGIQUE
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Quand la Technologie
            </span>
            <br />
            <span className="text-foreground">Rencontre la Passion</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Derrière l'interface élégante de Vybbi.app se cache un arsenal technologique digne des plus grandes plateformes mondiales. Notre mission : utiliser l'innovation pour résoudre les vrais problèmes de l'industrie musicale nocturne.
          </p>
        </div>
      </section>

      {/* Core Technologies */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="space-y-16">
            {techFeatures.map((tech, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-cols-2' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <Card className="group hover:shadow-glow transition-all duration-300 bg-gradient-card border-border">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${tech.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow`}>
                        <tech.icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4 text-foreground">{tech.title}</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-destructive mb-2">Le Problème :</h3>
                          <p className="text-muted-foreground">{tech.problem}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-primary mb-2">{tech.solution.includes("Notre") ? "Notre Solution :" : tech.solution}</h3>
                          <ul className="space-y-2">
                            {tech.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-success mb-2">Le Résultat :</h3>
                          <p className="text-muted-foreground font-medium">{tech.result}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-xl opacity-30"></div>
                    <Card className="relative bg-gradient-card border-border shadow-glow">
                      <CardContent className="p-8">
                        <div className="text-center">
                          <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                            {index === 0 ? "87%" : index === 1 ? "100%" : index === 2 ? "34%" : "78%"}
                          </div>
                          <p className="text-muted-foreground">
                            {index === 0 ? "Taux de satisfaction" : index === 1 ? "Sécurité blockchain" : index === 2 ? "Augmentation ROI" : "Mobile-first"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Intégrations Stratégiques : L'Écosystème Connecté</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des partenariats exclusifs pour une expérience seamless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{integration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Sécurité de Niveau Bancaire</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Vos données et transactions protégées par les meilleurs standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {security.map((item, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-success flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">API Ouverte : L'Innovation Collaborative</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Notre API permet aux développeurs tiers de créer :
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-primary" />
                  <span>Outils de gestion pour agents</span>
                </div>
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-primary" />
                  <span>Apps spécialisées par genre musical</span>
                </div>
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-primary" />
                  <span>Intégrations avec systèmes existants</span>
                </div>
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-primary" />
                  <span>Innovations que nous n'avons pas encore imaginées</span>
                </div>
              </div>
            </div>
            
            <Card className="bg-gradient-card border-border shadow-glow">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <Code className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">API Vybbi</h3>
                  <p className="text-muted-foreground">Documentation complète</p>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="bg-background/50 rounded p-4 font-mono">
                    <div className="text-primary">GET /api/artists</div>
                    <div className="text-muted-foreground">→ Liste des artistes</div>
                  </div>
                  <div className="bg-background/50 rounded p-4 font-mono">
                    <div className="text-primary">POST /api/bookings</div>
                    <div className="text-muted-foreground">→ Créer un booking</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">L'Avantage Concurrentiel Technologique</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pendant que nos concurrents utilisent des technologies d'il y a 10 ans, Vybbi.app construit l'infrastructure du futur
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover:shadow-glow transition-all duration-300 bg-gradient-card border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-glow">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Stack Moderne</h3>
                </div>
                <p className="text-muted-foreground mb-4">React Native, Node.js, PostgreSQL, Redis</p>
                <div className="text-sm text-success">✓ Performance optimale</div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 bg-gradient-card border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-glow">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Cloud Natif</h3>
                </div>
                <p className="text-muted-foreground mb-4">AWS avec auto-scaling et 99.9% uptime</p>
                <div className="text-sm text-success">✓ Scalabilité garantie</div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 bg-gradient-card border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">DevOps Avancé</h3>
                </div>
                <p className="text-muted-foreground mb-4">CI/CD, monitoring temps réel, déploiement continu</p>
                <div className="text-sm text-success">✓ Déploiements sans interruption</div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 bg-gradient-card border-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-glow">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Data Science</h3>
                </div>
                <p className="text-muted-foreground mb-4">Machine learning pour optimisation continue</p>
                <div className="text-sm text-success">✓ Amélioration perpétuelle</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Roadmap Innovation 2025-2027</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              L'avenir de la musique se construit en code. Et nous écrivons l'histoire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmap.map((item, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Badge className="mb-3">{item.period}</Badge>
                    <p className="text-foreground font-medium">{item.feature}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pour les Investisseurs Tech</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Vybbi.app n'est pas qu'une plateforme de réservation. C'est une tech company qui révolutionne un secteur traditionnel
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {investorStats.map((stat, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{stat}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Card className="inline-block bg-gradient-card border-border shadow-glow">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-foreground mb-4">L'avenir de la musique se construit en code.</h3>
                <p className="text-xl text-primary font-semibold">Et nous écrivons l'histoire.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Rejoignez la révolution technologique</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez comment Vybbi transforme l'industrie musicale avec la technologie de pointe
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Commencer maintenant</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/demo">Voir la démo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}