import { useState, useEffect } from "react";
import { Sparkles, Link as LinkIcon, Euro, TrendingUp, Eye, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { InfluencerDashboard } from "@/components/InfluencerDashboard";
import { WelcomeModal } from '@/components/WelcomeModal';
import { useWelcomeModal } from '@/hooks/useWelcomeModal';

export default function InfluenceurDashboard() {
  const { profile } = useAuth();
  const { isWelcomeModalOpen, closeWelcomeModal, handleNavigate } = useWelcomeModal();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Influenceur</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue {profile?.display_name} ! 
            <Link to={`/influencer/${profile?.id}`} className="ml-2 text-primary hover:underline">
              Voir mon profil public
            </Link>
          </p>
        </div>
      </div>

      <InfluencerDashboard />
      
      {/* Welcome Modal */}
      {profile && (
        <WelcomeModal
          isOpen={isWelcomeModalOpen}
          onClose={closeWelcomeModal}
          profileType={profile.profile_type}
          displayName={profile.display_name}
          profileId={profile.id}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}