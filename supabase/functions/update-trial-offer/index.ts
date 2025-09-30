import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      system_config: {
        Row: {
          id: string;
          config_key: string;
          config_value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          config_key: string;
          config_value: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          config_key?: string;
          config_value?: any;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    console.log('🔄 Starting trial offer update process...');

    // Update promotional trial to be inactive and switch to standard trial
    const { error: updatePromoError } = await supabase
      .from('system_config')
      .update({
        config_value: {
          days: 30,
          active: false,
          end_date: '2026-01-31T00:00:00Z',
          expired: true
        },
        description: 'EXPIRED: Promotional trial period - switched to standard 7-day trial on January 31st, 2026'
      })
      .eq('config_key', 'promotional_trial');

    if (updatePromoError) {
      console.error('❌ Error updating promotional trial:', updatePromoError);
      throw updatePromoError;
    }

    // Update standard trial to be the active configuration
    const { error: updateStandardError } = await supabase
      .from('system_config')
      .update({
        config_value: {
          days: 7,
          active: true,
          switched_on: '2026-01-31T00:00:00Z'
        },
        description: 'Standard trial period configuration (now active since January 31st, 2026)'
      })
      .eq('config_key', 'standard_trial');

    if (updateStandardError) {
      console.error('❌ Error updating standard trial:', updateStandardError);
      throw updateStandardError;
    }

    console.log('✅ Successfully updated trial offer configuration');
    console.log('📈 Promotional offer (30 days) -> EXPIRED');
    console.log('🎯 Standard offer (7 days) -> ACTIVE');

    // Log the change for audit purposes
    const { error: logError } = await supabase
      .from('system_config')
      .insert({
        config_key: 'trial_offer_change_log',
        config_value: {
          changed_at: new Date().toISOString(),
          change_type: 'automated_switch',
          from: { type: 'promotional', days: 30 },
          to: { type: 'standard', days: 7 },
          reason: 'Scheduled automatic switch on January 31st, 2026'
        },
        description: 'Audit log for trial offer configuration change'
      });

    if (logError) {
      console.error('⚠️ Warning: Could not create audit log:', logError);
      // Don't throw error for logging failure
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Trial offer updated successfully',
        changes: {
          promotional_trial: { days: 30, active: false, status: 'expired' },
          standard_trial: { days: 7, active: true, status: 'active' }
        },
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Critical error in update-trial-offer function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});