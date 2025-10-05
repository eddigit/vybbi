import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole, AppRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/emailService';
import { useAdminSettings } from '@/hooks/useAdminSettings';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getAdminEmail, getSecuritySettings } = useAdminSettings();
  // Smart rate-limit with exponential backoff
  const [signUpAttempts, setSignUpAttempts] = useState<number>(() => {
    const saved = sessionStorage.getItem('signUpAttempts');
    return saved ? parseInt(saved) : 0;
  });
  
  const [lastSignUpAttempt, setLastSignUpAttempt] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('lastSignUpAttempt');
    return saved ? parseInt(saved) : null;
  });

  const getWaitTime = (attempts: number): number => {
    // Exponential backoff: 5s, 15s, 30s, 60s
    const waitTimes = [5000, 15000, 30000, 60000];
    return waitTimes[Math.min(attempts, waitTimes.length - 1)];
  };

  const fetchProfile = async (userId: string) => {
    try {
      // Get user metadata to determine profile type
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const userProfileType = currentUser?.user_metadata?.profile_type || 'artist';
      
      // First ensure profile exists with correct profile type
      const { data: profileId } = await supabase
        .rpc('ensure_user_profile', { 
          _user_id: userId,
          _display_name: currentUser?.user_metadata?.display_name || 'Nouvel Utilisateur',
          _profile_type: userProfileType
        });

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setRoles(rolesData?.map(r => r.role) || []);
      
      // Check onboarding status and redirect accordingly
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const shouldRedirect = currentPath === '/' || currentPath === '/auth';
        const isOnboardingCompleted = (profileData as any).onboarding_completed;
        const userRoles = rolesData?.map(r => r.role) || [];
        const isAdmin = userRoles.includes('admin');
        
        if (shouldRedirect) {
          if (!isOnboardingCompleted) {
            // Redirect to onboarding if not completed
            navigate('/onboarding', { replace: true });
          } else if (isAdmin) {
            // Redirect admins to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            // Redirect other users to social wall
            navigate('/', { replace: true });
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, profileType: string, roleDetail?: string) => {
    try {
      const now = Date.now();
      const waitTime = getWaitTime(signUpAttempts);
      
      if (lastSignUpAttempt && now - lastSignUpAttempt < waitTime) {
        const remaining = Math.ceil((waitTime - (now - lastSignUpAttempt)) / 1000);
        const message = `Veuillez attendre ${remaining} secondes avant de réessayer`;
        toast({ title: 'Trop de tentatives', description: message, variant: 'destructive' });
        throw new Error(message);
      }

      // Validate password strength before proceeding
      const { data: passwordValidation } = await supabase.rpc('validate_password_strength', { password });
      
      if (passwordValidation && !(passwordValidation as any).valid) {
        const errors = (passwordValidation as any).errors || ['Le mot de passe ne respecte pas les critères de sécurité'];
        toast({
          title: "Mot de passe trop faible",
          description: errors.join(' '),
          variant: "destructive",
        });
        throw new Error('Password does not meet security requirements');
      }
      
      const newAttempts = signUpAttempts + 1;
      setSignUpAttempts(newAttempts);
      setLastSignUpAttempt(now);
      sessionStorage.setItem('signUpAttempts', String(newAttempts));
      sessionStorage.setItem('lastSignUpAttempt', String(now));

      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Log signup attempt for security monitoring
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'SIGNUP_ATTEMPT',
          p_email: email,
          p_metadata: {
            profile_type: profileType,
            display_name: displayName
          }
        });
      } catch (logErr) {
        console.log('Security logging error:', logErr);
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            profile_type: profileType,
            role_detail: roleDetail,
          }
        }
      });

      if (error) throw error;
      
      // Reset attempts on success
      setSignUpAttempts(0);
      sessionStorage.removeItem('signUpAttempts');
      
      // L'email de bienvenue sera envoyé après validation via auth-email-sender
      // Notifier l'administrateur (immédiat)
      setTimeout(async () => {
        try {
          const adminEmail = getAdminEmail();
          await sendAdminNotification(adminEmail, displayName, email, profileType);
          console.log('Notification admin envoyée');
        } catch (adminEmailError) {
          console.error('Erreur lors de l\'envoi de la notification admin:', adminEmailError);
        }
      }, 2000);
      
      // Show email confirmation dialog instead of toast
      setConfirmationEmail(email);
      setShowEmailConfirmation(true);
    } catch (error: any) {
      // Log failed signup attempt
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'SIGNUP_ERROR',
          p_email: email,
          p_metadata: { error: error.message }
        });
      } catch (logErr) {
        console.log('Security logging error:', logErr);
      }
      
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Check if user is currently blocked due to failed attempts
      const { data: blockedCheck } = await supabase.rpc('is_user_blocked', {
        p_email: email
      });
      
      if (blockedCheck) {
        const securitySettings = getSecuritySettings();
        toast({
          title: "Compte temporairement bloqué",
          description: `Trop de tentatives de connexion. Veuillez attendre ${securitySettings.lockout_duration_minutes} minutes.`,
          variant: "destructive",
        });
        try {
          await supabase.rpc('log_security_event', {
            p_event_type: 'BLOCKED_LOGIN_ATTEMPT',
            p_email: email
          });
        } catch (logErr) {
          console.log('Security logging error:', logErr);
        }
        throw new Error('Account temporarily blocked');
      }

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
        // Track failed login attempt
        const { data: attemptResult } = await supabase.rpc('track_login_attempt', {
          p_email: email,
          p_success: false,
          p_failure_reason: error.message,
          p_user_agent: navigator.userAgent
        });
        
        const result = attemptResult as any;
        if (result?.blocked) {
          toast({
            title: "Compte bloqué",
            description: `Trop de tentatives échouées. Compte bloqué pour ${result.block_duration_minutes} minutes.`,
            variant: "destructive",
          });
          try {
            await supabase.rpc('log_security_event', {
              p_event_type: 'ACCOUNT_BLOCKED',
              p_email: email,
              p_metadata: { reason: 'too_many_failures' }
            });
          } catch (logErr) {
            console.log('Security logging error:', logErr);
          }
        } else {
          const securitySettings = getSecuritySettings();
          const remaining = securitySettings.max_login_attempts - (result?.attempts_count || 0);
          toast({
            title: "Erreur de connexion",
            description: `${error.message}. ${remaining} tentative(s) restante(s).`,
            variant: "destructive",
          });
        }
        throw error;
      }

      // Track successful login attempt
      try {
        await supabase.rpc('track_login_attempt', {
          p_email: email,
          p_success: true,
          p_user_agent: navigator.userAgent
        });
      } catch (logErr) {
        console.log('Login tracking error:', logErr);
      }
      
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'SUCCESSFUL_LOGIN',
          p_email: email
        });
      } catch (logErr) {
        console.log('Security logging error:', logErr);
      }

      // Award daily login tokens after successful sign-in
      setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.rpc('award_daily_login_tokens', {
              user_id_param: user.id
            });
          }
        } catch (loginTokenError) {
          console.log('Daily login tokens already awarded or error:', loginTokenError);
        }
      }, 1000);
    } catch (error: any) {
      if (error.message !== 'Account temporarily blocked') {
        try {
          await supabase.rpc('log_security_event', {
            p_event_type: 'LOGIN_ERROR',
            p_email: email,
            p_metadata: { error: error.message }
          });
        } catch (logErr) {
          console.log('Security logging error:', logErr);
        }
      }
      
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    navigate('/', { replace: true });
  };

  const hasRole = (role: AppRole) => {
    return roles.some(r => r === role);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setLoading(true);
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setRoles([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    profile,
    roles,
    loading,
    signUp,
    signIn,
    signOut,
    hasRole,
    refreshProfile,
    showEmailConfirmation,
    confirmationEmail,
    setShowEmailConfirmation,
  };
}