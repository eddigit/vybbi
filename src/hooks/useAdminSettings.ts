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
        // Fetch admin emails
        const { data: adminEmailsData } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'admin_emails')
          .single();

        // Fetch security settings  
        const { data: securityData } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'security_settings')
          .single();

        if (adminEmailsData?.setting_value) {
          setSettings(prev => ({
            ...prev,
            admin_emails: adminEmailsData.setting_value as string[],
          }));
        }

        if (securityData?.setting_value) {
          setSettings(prev => ({
            ...prev,
            security_settings: securityData.setting_value as any,
          }));
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
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
