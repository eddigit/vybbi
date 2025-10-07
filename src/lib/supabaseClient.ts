import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

if (import.meta.env.DEV) {
  // Affichage console au démarrage
   
  console.log('[Supabase] URL=', import.meta.env.VITE_SUPABASE_URL, '| ANON=', import.meta.env.VITE_SUPABASE_ANON_KEY);
}
