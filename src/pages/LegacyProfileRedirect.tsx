import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function LegacyProfileRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!id) {
        navigate('/', { replace: true });
        return;
      }
      try {
        const { data, error } = await supabase
          .rpc('get_safe_profile_data', { profile_identifier: id })
          .maybeSingle();
        if (error) throw error;

        if (data && isMounted) {
          const type = data.profile_type as string;
          const slug = data.slug as string | null;
          const target = type === 'artist'
            ? `/artistes/${slug || id}`
            : (type === 'agent' || type === 'manager')
              ? `/partners/${slug || id}`
              : type === 'lieu'
                ? `/lieux/${slug || id}`
                : '/';
          navigate(target, { replace: true });
          return;
        }
      } catch (e) {
        // ignore and fallback below
      }

      // Fallback: send to list based on current legacy prefix
      const path = location.pathname;
      if (path.startsWith('/artists')) navigate('/artistes', { replace: true });
      else if (path.startsWith('/partners') || path.startsWith('/agents') || path.startsWith('/managers')) navigate('/partners', { replace: true });
      else if (path.startsWith('/lieux')) navigate('/lieux', { replace: true });
      else navigate('/', { replace: true });
    };
    run();
    return () => { isMounted = false; };
  }, [id, navigate, location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
