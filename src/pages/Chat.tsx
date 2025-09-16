import React from 'react';
import { Helmet } from 'react-helmet-async';
import VybbiChat from '@/components/DualAIChat';
import { Bot, Database, Users, TrendingUp, MessageCircle, Search, Calendar } from 'lucide-react';
import vybbiLogo from '@/assets/vybbi-logo.png';

const Chat = () => {
  return (
    <>
      <Helmet>
        <title>Vybbi - Assistant IA Musical Intelligent</title>
        <meta name="description" content="Chattez avec Vybbi, l'assistant IA qui connaît toute la plateforme musicale. Trouvez des artistes, organisez des événements, découvrez des opportunités." />
        <meta name="keywords" content="Vybbi, assistant IA musical, booking artistes, événements musicaux, plateforme musique" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20">
                <img src={vybbiLogo} alt="Vybbi IA" className="h-12 w-12 rounded-full" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Vybbi
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              L'assistant IA qui connaît toute la plateforme musicale pour vous accompagner
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Connaissance complète</h3>
                <p className="text-sm text-muted-foreground">Base de données musicale complète</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Recherche intelligente</h3>
                <p className="text-sm text-muted-foreground">Trouve profils et opportunités</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Matching intelligent</h3>
                <p className="text-sm text-muted-foreground">Opportunités personnalisées</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Accompagnement</h3>
                <p className="text-sm text-muted-foreground">Conseils selon votre profil</p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="max-w-4xl mx-auto">
            <VybbiChat className="shadow-xl border-0 bg-card/80 backdrop-blur-sm" />
          </div>

          {/* Footer Info */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>🧠 Vybbi apprend de chaque interaction pour mieux vous accompagner</p>
            <p className="mt-1">Limite de 1000 caractères par message • Historique des conversations sauvegardé</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Profils
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Événements
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                Annonces
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;