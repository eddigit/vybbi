import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
const APropos = () => {
  const problems = [{
    category: "Pour les Artistes",
    items: ["Fin de l'isolement : Plus besoin de connaître \"les bonnes personnes\"", "Visibilité méritée : Votre talent parle pour vous", "Accès direct : Connexion directe avec agents, lieux et organisateurs", "Égalité des chances : Même plateforme pour tous, du débutant à la star"]
  }, {
    category: "Pour les Agents & Managers",
    items: ["Découverte facilitée : Accès à un vivier mondial de talents", "Évaluation objective : Profils complets, références vérifiées", "Gestion simplifiée : Outils intégrés pour le suivi des artistes", "Réseau élargi : Connexions avec lieux et organisateurs"]
  }, {
    category: "Pour les Lieux & Organisateurs",
    items: ["Booking simplifié : Recherche et réservation en quelques clics", "Diversité garantie : Accès à tous types d'artistes et performances", "Sécurité juridique : Contrats standardisés et validation légale", "Optimisation budgétaire : Transparence des tarifs et négociation directe"]
  }];
  const visionPoints = ["Les artistes peuvent exprimer leur créativité sans barrières", "Les agents découvrent les talents de demain", "Les lieux programment la diversité et l'excellence", "Les organisateurs créent des événements mémorables"];
  const innovations = ["Intelligence Artificielle pour le matching optimal", "Blockchain pour la traçabilité et la sécurité", "Analytics pour l'optimisation des performances", "Services juridiques pour la protection de tous"];
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 text-lg px-6 py-2">
              À Propos de Vybbi.app
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              L'Histoire d'une Révolution<br />Née de l'Expérience
            </h1>
          </div>
        </div>
      </section>

      {/* Mission et Vision Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Une Plateforme Née de l'Expérience du Terrain</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Vybbi.app révolutionne l'industrie de la nuit en créant un écosystème équitable 
              où le talent prime sur les connexions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <Card className="bg-secondary/10 border-secondary/30 p-8">
                <h3 className="text-2xl font-bold mb-6 text-secondary">
                  "Une plateforme qui donne les mêmes chances à tous"
                </h3>
                <p className="text-lg leading-relaxed">
                  Vybbi.app est née d'un constat simple : dans l'industrie de la nuit, 
                  le succès dépend trop souvent de qui vous connaissez plutôt que de ce que vous valez. 
                  Notre mission est de démocratiser cet écosystème.
                </p>
              </Card>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img src="/lovable-uploads/b2d290dd-d32c-44c9-944e-f842fb2b1d24.png" alt="Gilles KORZEC, Fondateur de Vybbi.app" className="w-64 h-64 object-cover rounded-2xl shadow-2xl" />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-3 rounded-xl shadow-lg">
                  <div className="text-center text-sm">
                    <p className="font-bold">Gilles KORZEC</p>
                    <p className="opacity-90">Fondateur</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs de Vybbi */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Les Valeurs Fondatrices de Vybbi
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold mb-4">Égalité des Chances</h3>
                <p>Tous les talents méritent d'être découverts, peu importe leur réseau</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-xl font-bold mb-4">Connexions Authentiques</h3>
                <p>Créer de vraies relations professionnelles basées sur la compatibilité</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-bold mb-4">Innovation Continue</h3>
                <p>Utiliser la technologie pour simplifier et améliorer l'industrie</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20 p-8">
            <blockquote className="text-xl italic text-center">
              "Vybbi.app, c'est le LinkedIn de la nuit que l'industrie attendait. 
              Une plateforme où votre talent compte plus que votre carnet d'adresses."
            </blockquote>
          </Card>
        </div>
      </section>

      {/* Problématiques Résolues */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Les Problématiques Résolues par Vybbi.app
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {problems.map((problem, index) => <Card key={index} className="glass-card p-6">
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold mb-6 text-center">{problem.category}</h3>
                  <ul className="space-y-3">
                    {problem.items.map((item, itemIndex) => <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{item}</span>
                      </li>)}
                  </ul>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Vision Vybbi */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">La Vision Vybbi : Un Écosystème Équitable</h2>
            <Card className="bg-primary/5 border-primary/20 p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Le LinkedIn de la nuit enfin accessible à tous
              </h3>
              <p className="text-lg">
                Une plateforme où votre talent compte plus que votre carnet d'adresses, 
                où chaque opportunité est basée sur la valeur ajoutée réelle.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Un Écosystème Complet</h3>
              <ul className="space-y-4">
                {visionPoints.map((point, index) => <li key={index} className="flex items-start">
                    <div className="w-3 h-3 bg-secondary rounded-full mr-3 mt-1 flex-shrink-0"></div>
                    <span>{point}</span>
                  </li>)}
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">L'Innovation au Service de l'Humain</h3>
              <ul className="space-y-4">
                {innovations.map((innovation, index) => <li key={index} className="flex items-start">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 mt-1 flex-shrink-0"></div>
                    <span>{innovation}</span>
                  </li>)}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                Derrière chaque algorithme, une compréhension profonde des besoins réels du secteur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            La Mission Vybbi : Démocratiser l'Industrie de la Nuit
          </h2>
          
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl leading-relaxed mb-8">
              Vybbi transforme l'industrie du divertissement nocturne en créant un écosystème équitable où 
              <strong className="text-primary"> chaque talent a sa chance de briller</strong>.
            </p>
            
            <p className="text-lg leading-relaxed">
              Notre plateforme connecte artistes, agents et lieux de manière intelligente, 
              en se basant sur les compétences et la compatibilité plutôt que sur les réseaux existants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <h3 className="font-bold text-lg mb-2">Pour votre talent</h3>
                <p className="text-muted-foreground">qui mérite d'être reconnu</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <h3 className="font-bold text-lg mb-2">Pour votre passion</h3>
                <p className="text-muted-foreground">qui mérite d'être récompensée</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <h3 className="font-bold text-lg mb-2">Pour votre succès</h3>
                <p className="text-muted-foreground">qui ne devrait dépendre que de vous</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary text-primary-foreground p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">L'Engagement Vybbi</h3>
            <p className="text-lg">
              Nous croyons qu'une industrie plus juste et transparente bénéficie à tous : 
              artistes, professionnels et audiences découvrent enfin ce qu'ils cherchaient vraiment.
            </p>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Contactez l'Équipe Vybbi</h2>
            <p className="text-xl text-muted-foreground">
              Nous sommes à votre écoute pour faire grandir la communauté ensemble
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto p-8">
            <CardContent className="text-center p-0">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold mb-2">Vybbi.app</h3>
              <p className="text-muted-foreground mb-6">L'avenir de l'industrie de la nuit</p>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:vybbiapp@gmail.com" className="flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    vybbiapp@gmail.com
                  </a>
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Une question ? Une suggestion ? Écrivez-nous !
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>;
};
export default APropos;