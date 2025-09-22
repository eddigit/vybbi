import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole, AppRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/emailService';

// Email de l'administrateur - à configurer selon vos besoins
const ADMIN_EMAIL = 'info@vybbi.app';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  // Local rate-limit to avoid 429 from Supabase (60s between attempts)
  const [lastSignUpAttempt, setLastSignUpAttempt] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('lastSignUpAttempt');
    return saved ? parseInt(saved) : null;
  });

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
      if (lastSignUpAttempt && now - lastSignUpAttempt < 60000) {
        const remaining = Math.ceil((60000 - (now - lastSignUpAttempt)) / 1000);
        const message = `Veuillez attendre ${remaining} secondes avant de réessayer`;
        toast({ title: 'Trop de tentatives', description: message, variant: 'destructive' });
        throw new Error(message);
      }
      setLastSignUpAttempt(now);
      sessionStorage.setItem('lastSignUpAttempt', String(now));

      const redirectUrl = `${window.location.origin}/auth/callback`;
      
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
      
      // L'email de bienvenue sera envoyé après validation via auth-email-sender
      // Notifier l'administrateur (immédiat)
      setTimeout(async () => {
        try {
          await sendAdminNotification(ADMIN_EMAIL, displayName, email, profileType);
          console.log('Notification admin envoyée');
        } catch (adminEmailError) {
          console.error('Erreur lors de l\'envoi de la notification admin:', adminEmailError);
        }
      }, 2000);
      
      toast({
        title: 'Compte créé avec succès !',
        description: 'Vérifiez votre email pour confirmer votre compte.',
      });
    } catch (error: any) {
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
      
      if (error) throw error;
    } catch (error: any) {
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
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
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
  };
}