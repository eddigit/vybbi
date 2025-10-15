import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GA4Metric {
  name: string;
  values: { value: string }[];
}

interface GA4Response {
  rows?: Array<{
    metricValues: Array<{ value: string }>;
  }>;
}

async function createJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Import private key
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = serviceAccount.private_key
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${encodedSignature}`;
}

async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwt = await createJWT(serviceAccount);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error getting access token:', error);
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data: GoogleAuthToken = await response.json();
  return data.access_token;
}

async function fetchGA4Data(accessToken: string, propertyId: string, startDate: string, endDate: string) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const requestBody = {
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "conversions" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  };

  console.log('Fetching GA4 data with body:', JSON.stringify(requestBody));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GA4 API error:', error);
    throw new Error(`GA4 API error: ${error}`);
  }

  const data: GA4Response = await response.json();
  console.log('GA4 response:', JSON.stringify(data));

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate = 'yesterday', endDate = 'today' } = await req.json().catch(() => ({}));

    // Get service account from Supabase secrets
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON secret not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Get GA4 Property ID from admin settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'ga4_property_id')
      .single();

    if (!settings?.setting_value) {
      throw new Error('GA4_PROPERTY_ID not configured in admin_settings. Please add it with key "ga4_property_id"');
    }

    const propertyId = settings.setting_value as string;
    console.log('Using GA4 Property ID:', propertyId);

    // Get access token
    const accessToken = await getAccessToken(serviceAccount);
    console.log('Access token obtained successfully');

    // Fetch GA4 data
    const ga4Data = await fetchGA4Data(accessToken, propertyId, startDate, endDate);

    // Parse response
    const row = ga4Data.rows?.[0];
    if (!row) {
      return new Response(
        JSON.stringify({
          activeUsers: 0,
          newUsers: 0,
          sessions: 0,
          pageViews: 0,
          conversions: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const metrics = {
      activeUsers: parseInt(row.metricValues[0]?.value || '0'),
      newUsers: parseInt(row.metricValues[1]?.value || '0'),
      sessions: parseInt(row.metricValues[2]?.value || '0'),
      pageViews: parseInt(row.metricValues[3]?.value || '0'),
      conversions: parseInt(row.metricValues[4]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues[5]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[6]?.value || '0'),
    };

    console.log('Parsed metrics:', metrics);

    return new Response(
      JSON.stringify(metrics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ga4-fetch-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check edge function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
