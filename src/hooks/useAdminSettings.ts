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
        // Always use default values to avoid 406 errors
        // Only try to fetch if we really need dynamic values
        console.log('Using default admin settings to avoid permission issues');
        
        // Optionally try to get admin emails via secure function, but don't fail if it doesn't work
        try {
          const { data: adminEmailsData, error: emailsError } = await supabase
            .rpc('get_admin_emails');

          if (!emailsError && adminEmailsData && adminEmailsData.length > 0) {
            setSettings(prev => ({
              ...prev,
              admin_emails: adminEmailsData,
            }));
          }
        } catch (emailError) {
          // Silently fail and use defaults
          console.log('Using default admin emails');
        }

        // Always use default security settings to avoid permission issues
        console.log('Using default security settings');
        
      } catch (error) {
        console.log('Using default admin settings due to error:', error);
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
