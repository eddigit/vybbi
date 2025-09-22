import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface SecurityCheck {
  isBlocked: boolean;
  blockDuration?: number;
  attemptsCount?: number;
}

export function useEnhancedAuthSecurity() {
  const { toast } = useToast();
  const { getSecuritySettings } = useAdminSettings();

  const checkLoginSecurity = async (email: string): Promise<SecurityCheck> => {
    try {
      const { data, error } = await supabase.rpc('is_user_blocked', {
        p_email: email
      });

      if (error) {
        console.error('Error checking login security:', error);
        return { isBlocked: false };
      }

      return { isBlocked: data || false };
    } catch (error) {
      console.error('Error in security check:', error);
      return { isBlocked: false };
    }
  };

  const trackLoginAttempt = async (
    email: string,
    success: boolean,
    failureReason?: string
  ): Promise<SecurityCheck> => {
    try {
      const { data, error } = await supabase.rpc('track_login_attempt', {
        p_email: email,
        p_ip_address: null, // Could be enhanced with IP detection
        p_user_agent: navigator.userAgent,
        p_success: success,
        p_failure_reason: failureReason
      });

      if (error) {
        console.error('Error tracking login attempt:', error);
        return { isBlocked: false };
      }

      const result = data as any;
      return {
        isBlocked: result?.blocked || false,
        blockDuration: result?.block_duration_minutes,
        attemptsCount: result?.attempts_count
      };
    } catch (error) {
      console.error('Error tracking login attempt:', error);
      return { isBlocked: false };
    }
  };

  const validatePasswordStrength = async (password: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_password_strength', {
        password
      });

      if (error) {
        console.error('Error validating password:', error);
        return { valid: false, errors: ['Unable to validate password'] };
      }

      return data;
    } catch (error) {
      console.error('Error validating password:', error);
      return { valid: false, errors: ['Unable to validate password'] };
    }
  };

  const logSecurityEvent = async (
    eventType: string,
    email?: string,
    metadata: any = {}
  ) => {
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_email: email,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const enhancedSignIn = async (email: string, password: string, rememberMe: boolean = false) => {
    // Check if user is currently blocked
    const securityCheck = await checkLoginSecurity(email);
    
    if (securityCheck.isBlocked) {
      const securitySettings = getSecuritySettings();
      toast({
        title: "Compte temporairement bloqué",
        description: `Trop de tentatives de connexion. Veuillez attendre ${securitySettings.lockout_duration_minutes} minutes.`,
        variant: "destructive",
      });
      await logSecurityEvent('BLOCKED_LOGIN_ATTEMPT', email);
      throw new Error('Account temporarily blocked');
    }

    try {
      // Store email for future use if remember me is checked
      if (rememberMe) {
        localStorage.setItem('vybbi_remembered_email', email);
      } else {
        localStorage.removeItem('vybbi_remembered_email');
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Track failed attempt
        const result = await trackLoginAttempt(email, false, error.message);
        
        if (result.isBlocked) {
          toast({
            title: "Compte bloqué",
            description: `Trop de tentatives échouées. Compte bloqué pour ${result.blockDuration} minutes.`,
            variant: "destructive",
          });
          await logSecurityEvent('ACCOUNT_BLOCKED', email, { reason: 'too_many_failures' });
        } else {
          const remaining = getSecuritySettings().max_login_attempts - (result.attemptsCount || 0);
          toast({
            title: "Erreur de connexion",
            description: `${error.message}. ${remaining} tentative(s) restante(s).`,
            variant: "destructive",
          });
        }
        throw error;
      } else {
        // Track successful attempt
        await trackLoginAttempt(email, true);
        await logSecurityEvent('SUCCESSFUL_LOGIN', email);
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
      }
    } catch (error: any) {
      if (error.message !== 'Account temporarily blocked') {
        await logSecurityEvent('LOGIN_ERROR', email, { error: error.message });
      }
      throw error;
    }
  };

  const enhancedSignUp = async (
    email: string,
    password: string,
    displayName: string,
    profileType: string,
    roleDetail?: string
  ) => {
    // Validate password strength
    const passwordValidation = await validatePasswordStrength(password);
    const validation = passwordValidation as any;
    
    if (!validation.valid) {
      toast({
        title: "Mot de passe trop faible",
        description: validation.errors.join(' '),
        variant: "destructive",
      });
      throw new Error('Password does not meet security requirements');
    }

    await logSecurityEvent('SIGNUP_ATTEMPT', email, { 
      profile_type: profileType,
      display_name: displayName 
    });

    // Continue with original signup logic...
    // This would call the original signUp function from useAuth
  };

  return {
    checkLoginSecurity,
    trackLoginAttempt,
    validatePasswordStrength,
    logSecurityEvent,
    enhancedSignIn,
    enhancedSignUp,
  };
}