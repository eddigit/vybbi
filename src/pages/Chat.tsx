import React from 'react';
import { Helmet } from 'react-helmet-async';
import DualAIChat from '@/components/DualAIChat';
import { MessageSquare, Zap, Shield, Cpu } from 'lucide-react';

const Chat = () => {
  return (
    <>
      <Helmet>
        <title>Chat IA - Assistant Intelligent</title>
        <meta name="description" content="Chattez avec notre assistant IA avancé. Réponses instantanées avec fallback automatique entre Google AI et Hugging Face." />
        <meta name="keywords" content="chat IA, assistant intelligent, Google AI, Hugging Face, conversation automatique" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Assistant IA
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chattez avec notre assistant intelligent alimenté par les dernières technologies d'IA
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Réponses rapides</h3>
                <p className="text-sm text-muted-foreground">IA avancée pour des réponses instantanées</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Système de secours</h3>
                <p className="text-sm text-muted-foreground">Fallback automatique entre APIs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="p-2 rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Multi-modèles</h3>
                <p className="text-sm text-muted-foreground">Google AI + Hugging Face</p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="max-w-4xl mx-auto">
            <DualAIChat 
              className="shadow-xl border-0 bg-card/80 backdrop-blur-sm" 
              showProviderBadge={false}
            />
          </div>

          {/* Footer Info */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Propulsé par Google AI (Gemini 1.5 Flash) avec fallback Hugging Face</p>
            <p className="mt-1">Limite de 500 caractères par message • Conversations non persistantes</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;