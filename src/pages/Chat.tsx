import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import VybbiChat from '@/components/DualAIChat';
import SupportChatPanel from '@/components/SupportChatPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Database, Users, TrendingUp, MessageCircle, Search, Calendar, HeadphonesIcon } from 'lucide-react';
import vybbiLogo from '@/assets/vybbi-logo.png';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'assistant');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'support') {
      setActiveTab('support');
    } else {
      setActiveTab('assistant');
    }
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Vybbi - Assistant IA & Support</title>
        <meta name="description" content="Chattez avec Vybbi, l'assistant IA musical intelligent, ou contactez notre support pour une aide personnalisée." />
        <meta name="keywords" content="Vybbi, assistant IA musical, support client, booking artistes, événements musicaux" />
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
              Assistant IA musical intelligent et support personnalisé
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

          {/* Chat Interface with Tabs */}
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="assistant" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Assistant IA
                </TabsTrigger>
                <TabsTrigger value="support" className="flex items-center gap-2">
                  <HeadphonesIcon className="h-4 w-4" />
                  Support
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="assistant">
                <VybbiChat className="shadow-xl border-0 bg-card/80 backdrop-blur-sm" />
              </TabsContent>
              
              <TabsContent value="support">
                <SupportChatPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            {activeTab === 'assistant' ? (
              <>
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
              </>
            ) : (
              <>
                <p>💬 Notre équipe support est disponible en temps réel</p>
                <p className="mt-1">Réponse généralement sous 2 minutes • Lundi-Vendredi 9h-18h</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;