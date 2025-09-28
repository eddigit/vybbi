import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminSettings {
  admin_emails: string[];
  security_settings: {
    max_login_attempts: number;
    lockout_duration_minutes: number;
    require_captcha_after_attempts: number;
  };
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    admin_emails: ['admin@vybbi.app'],
    security_settings: {
      max_login_attempts: 5,
      lockout_duration_minutes: 15,
      require_captcha_after_attempts: 3,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        // Check if user is authenticated first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('No authenticated user, using default admin settings');
          setLoading(false);
          return;
        }

        // Use the secure function to get admin emails
        const { data: adminEmailsData, error: emailsError } = await supabase
          .rpc('get_admin_emails');

        if (emailsError) {
          console.warn('Could not fetch admin emails, using defaults:', emailsError);
        } else if (adminEmailsData && adminEmailsData.length > 0) {
          setSettings(prev => ({
            ...prev,
            admin_emails: adminEmailsData,
          }));
        }

        // For security settings, we'll use default values since they don't need to be dynamic
        // and accessing them requires admin permissions
        console.log('Using default security settings for non-admin users');
        
      } catch (error) {
        console.warn('Error fetching admin settings, using defaults:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchAdminSettings();
  }, []);

  const getAdminEmail = () => {
    return settings.admin_emails[0] || 'admin@vybbi.app';
  };

  const getSecuritySettings = () => {
    return settings.security_settings;
  };

  return {
    settings,
    loading,
    getAdminEmail,
    getSecuritySettings,
  };
}
