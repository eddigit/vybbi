import { TestAuthFlow } from '@/components/TestAuthFlow';
import { QuickTestActions } from '@/components/QuickTestActions';
import { SEOHead } from '@/components/SEOHead';

export default function SystemTest() {
  return (
    <>
      <SEOHead 
        title="Tests Système - Vybbi"
        description="Page de diagnostic pour tester les fonctionnalités critiques de Vybbi"
      />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Tests Système Vybbi</h1>
            <p className="text-lg text-muted-foreground">
              Diagnostic complet des fonctionnalités critiques
            </p>
          </div>
          
          <TestAuthFlow />
          
          <QuickTestActions />
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Flux utilisateur critique</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">1</span>
                  <span>Inscription avec choix du profil (artiste/agent/lieu)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">2</span>
                  <span>Confirmation email et activation du compte</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">3</span>
                  <span>Onboarding avec complétion du profil</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">4</span>
                  <span>Redirection vers dashboard approprié</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">5</span>
                  <span>Recherche et contact d'autres utilisateurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">6</span>
                  <span>Messagerie temps réel fonctionnelle</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Points de vérification</h2>
              <div className="space-y-2 text-sm">
                <div>✅ <strong>Supabase:</strong> Connexion et RLS configurés</div>
                <div>✅ <strong>Authentication:</strong> Signup/Login/Logout</div>
                <div>✅ <strong>Profiles:</strong> Création automatique des profils</div>
                <div>✅ <strong>Roles:</strong> Attribution et vérification des rôles</div>
                <div>✅ <strong>Conversations:</strong> Création et gestion des conversations</div>
                <div>✅ <strong>Messages:</strong> Envoi et réception en temps réel</div>
                <div>✅ <strong>Onboarding:</strong> Flux de complétion du profil</div>
                <div>✅ <strong>Dashboard:</strong> Redirection selon le type de profil</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}