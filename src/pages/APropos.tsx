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

      {/* Gilles KORZEC Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-6">Vybbi - De la Scène à la Vision</h2>
              <div className="text-xl text-muted-foreground mb-8">
                <p className="mb-4">54 ans. Des décennies dans la nuit.</p>
                <p className="mb-4">Passionné de digital depuis l'âge de 11 ans.</p>
                <p className="font-semibold">Une vision révolutionnaire.</p>
              </div>
              <p className="text-lg leading-relaxed">
                Derrière Vybbi.app se cache l'histoire extraordinaire de Gilles KORZEC, 
                un homme aux multiples talents qui a vécu chaque facette de l'industrie 
                du divertissement nocturne. Musicien, magicien, entrepreneur digital 
                depuis l'adolescence, Gilles a navigué pendant des années dans les 
                méandres complexes d'un secteur où le talent ne suffit pas toujours.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img src="/lovable-uploads/b2d290dd-d32c-44c9-944e-f842fb2b1d24.png" alt="Gilles KORZEC, Fondateur de Vybbi.app" className="w-80 h-80 object-cover rounded-2xl shadow-2xl" />
                <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <p className="font-bold text-lg">Gilles KORZEC</p>
                    <p className="text-sm opacity-90">Fondateur & CEO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parcours Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Un Parcours Forgé par la Passion et l'Innovation
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-xl font-bold mb-4">Musicien</h3>
                <p>Vibrant sur les scènes des clubs, maîtrisant l'art de faire danser les foules</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-bold mb-4">Magicien</h3>
                <p>Captivant les audiences avec ses performances, maître de l'entertainment nocturne</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <div className="text-6xl mb-4">💻</div>
                <h3 className="text-xl font-bold mb-4">Digital Pioneer</h3>
                <p>Passionné de technologie depuis 11 ans, entrepreneur digital visionnaire</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20 p-8">
            <blockquote className="text-xl italic text-center">
              "J'ai réalisé que même avec du talent dans plusieurs domaines et une expertise digital, 
              cela ne suffisait pas. Il fallait appartenir au bon cercle, connaître les bonnes personnes. 
              C'était profondément injuste."
            </blockquote>
            <cite className="block text-center mt-4 font-semibold">- Gilles KORZEC</cite>
          </Card>
        </div>
      </section>

      {/* Épiphanie Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            L'Épiphanie : Démocratiser l'Industrie de la Nuit
          </h2>
          
          <Card className="bg-secondary/10 border-secondary/30 p-8 mb-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-secondary">
              "Pourquoi le succès devrait-il dépendre de qui vous connaissez plutôt que de ce que vous valez ?"
            </h3>
            <p className="text-lg leading-relaxed">
              Cette question a hanté Gilles pendant des années. Témoin de talents exceptionnels 
              restés dans l'ombre faute de connexions, et de professionnels peinant à découvrir 
              ces perles rares, il a compris qu'il fallait révolutionner le système.
            </p>
          </Card>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-2xl">
            <p className="text-xl leading-relaxed max-w-4xl mx-auto">
              À 54 ans, avec la sagesse de l'expérience et la fougue de l'innovation, 
              Gilles a décidé de créer la solution qu'il aurait rêvé d'avoir à ses débuts : 
              <strong className="text-primary"> une plateforme qui donne les mêmes chances à tous</strong>.
            </p>
          </div>
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
              <blockquote className="text-xl italic">
                "Vybbi.app, c'est le LinkedIn de la nuit que j'aurais voulu avoir à mes débuts. 
                Une plateforme où votre talent compte plus que votre carnet d'adresses."
              </blockquote>
              <cite className="block mt-4 font-semibold">- Gilles KORZEC</cite>
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
                Mais derrière chaque algorithme, il y a la compréhension humaine des besoins réels du secteur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            Une Mission Personnelle Devenue Universelle
          </h2>
          
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl leading-relaxed mb-8">
              Ce qui a commencé comme une frustration personnelle est devenu une mission universelle : 
              <strong className="text-primary"> démocratiser l'industrie de la nuit mondiale</strong>.
            </p>
            
            <p className="text-lg leading-relaxed">
              Gilles KORZEC ne se contente pas de créer une plateforme. Il bâtit un mouvement 
              pour que chaque artiste, où qu'il soit, quelles que soient ses connexions, 
              puisse avoir sa chance de briller.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <h3 className="font-bold text-lg mb-2">Parce que votre talent</h3>
                <p className="text-muted-foreground">mérite d'être reconnu</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <h3 className="font-bold text-lg mb-2">Parce que votre passion</h3>
                <p className="text-muted-foreground">mérite d'être récompensée</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card p-6">
              <CardContent className="text-center p-0">
                <h3 className="font-bold text-lg mb-2">Parce que votre succès</h3>
                <p className="text-muted-foreground">ne devrait dépendre que de vous</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary text-primary-foreground p-8 max-w-4xl mx-auto">
            <blockquote className="text-xl italic mb-4">
              "Après 30 ans dans cette industrie, entre musique, magie et digital, 
              je sais une chose : le talent existe partout. Vybbi.app existe pour qu'il soit reconnu partout."
            </blockquote>
            <cite className="block font-semibold">- Gilles KORZEC, Fondateur</cite>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Contactez le Fondateur</h2>
            <p className="text-xl text-muted-foreground">
              Gilles KORZEC est disponible pour échanger avec la communauté Vybbi
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto p-8">
            <CardContent className="text-center p-0">
              <div className="mb-6">
                <img src="/lovable-uploads/b2d290dd-d32c-44c9-944e-f842fb2b1d24.png" alt="Gilles KORZEC" className="w-24 h-24 object-cover rounded-full mx-auto mb-4 shadow-lg" />
                <h3 className="text-2xl font-bold">Gilles KORZEC</h3>
                <p className="text-muted-foreground">Fondateur & CEO - Vybbi.app</p>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:vybbiapp@gmail.com" className="flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    vybbiapp@gmail.com
                  </a>
                </Button>
                
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Disponible pour échanger avec la communauté Vybbi
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>;
};
export default APropos;