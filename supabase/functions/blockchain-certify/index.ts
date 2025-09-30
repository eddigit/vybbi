import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CertificationRequest {
  musicReleaseId: string;
  metadata: {
    title: string;
    artist: string;
    isrc: string;
    releaseDate: string;
    collaborators: Array<{
      name: string;
      role: string;
      royaltyPercentage: number;
    }>;
    audioHash?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { musicReleaseId, metadata }: CertificationRequest = await req.json();

    console.log('Starting blockchain certification for release:', musicReleaseId);

    // Generate certification hash from metadata
    const certificationData = {
      musicReleaseId,
      ...metadata,
      timestamp: new Date().toISOString(),
      certifiedBy: 'Vybbi Platform',
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(certificationData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const certificationHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Generated certification hash:', certificationHash);

    // For demo purposes, simulate blockchain transaction
    // In production, this would interact with actual Solana network
    const mockTransactionHash = `solana_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = `sig_${Math.random().toString(36).substr(2, 20)}`;
    const mockBlockNumber = Math.floor(Math.random() * 1000000) + 500000;

    console.log('Mock blockchain transaction:', mockTransactionHash);

    // Store certification in database
    const { data: certification, error: dbError } = await supabaseClient
      .from('blockchain_certifications')
      .insert({
        music_release_id: musicReleaseId,
        transaction_hash: mockTransactionHash,
        blockchain_network: 'solana',
        certification_hash: certificationHash,
        solana_signature: mockSignature,
        block_number: mockBlockNumber,
        certification_data: certificationData,
        status: 'confirmed',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to store certification: ${dbError.message}`);
    }

    console.log('Certification stored successfully:', certification.id);

    // Generate QR code data URL
    const verificationUrl = `https://vybbi.com/verify/${certification.id}`;
    const qrCodeData = `data:text/plain;base64,${btoa(verificationUrl)}`;

    // Update certification with QR code URL
    const { error: updateError } = await supabaseClient
      .from('blockchain_certifications')
      .update({
        qr_code_url: qrCodeData,
        certificate_url: verificationUrl,
      })
      .eq('id', certification.id);

    if (updateError) {
      console.error('Failed to update QR code:', updateError);
    }

    const response = {
      success: true,
      certification: {
        id: certification.id,
        transactionHash: mockTransactionHash,
        certificationHash: certificationHash,
        status: 'confirmed',
        qrCodeUrl: qrCodeData,
        verificationUrl: verificationUrl,
        blockNumber: mockBlockNumber,
        timestamp: certification.created_at,
      },
    };

    console.log('Certification completed successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Certification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create blockchain certification',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});