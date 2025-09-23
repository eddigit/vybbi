import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useTokenPurchase = () => {
  const { user } = useAuth();
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const verifyPayment = async (sessionId: string) => {
    if (!user || !sessionId) return null;

    setVerifyingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-token-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        if (data.alreadyProcessed) {
          toast.info('Ce paiement a déjà été traité');
        } else {
          toast.success(
            `🎉 Félicitations ! Vous avez reçu ${data.tokensAwarded} jetons VYBBI !`,
            { duration: 5000 }
          );
        }
        return data;
      } else {
        throw new Error(data?.error || 'Échec de la vérification du paiement');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Erreur lors de la vérification du paiement');
      return null;
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Auto-verify payment on page load if session_id is present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentStatus = urlParams.get('payment');

    if (sessionId && paymentStatus === 'success' && user) {
      verifyPayment(sessionId).then(() => {
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      });
    } else if (paymentStatus === 'cancelled') {
      toast.error('Paiement annulé');
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [user]);

  return {
    verifyPayment,
    verifyingPayment
  };
};