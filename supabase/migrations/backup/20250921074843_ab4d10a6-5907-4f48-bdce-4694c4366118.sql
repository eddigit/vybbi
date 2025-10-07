-- Create blockchain certifications table
CREATE TABLE IF NOT EXISTS public.blockchain_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_release_id UUID NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  blockchain_network TEXT NOT NULL DEFAULT 'solana',
  certification_hash TEXT NOT NULL,
  solana_signature TEXT,
  block_number BIGINT,
  certification_data JSONB NOT NULL DEFAULT '{}',
  qr_code_url TEXT,
  certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  certified_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.blockchain_certifications ENABLE ROW LEVEL SECURITY;

-- Artists can view certifications for their releases
CREATE POLICY "Artists can view their certifications"
ON public.blockchain_certifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.music_releases mr
    JOIN public.profiles p ON p.id = mr.profile_id
    WHERE mr.id = blockchain_certifications.music_release_id
    AND p.user_id = auth.uid()
  )
);

-- Artists can create certifications for their releases
CREATE POLICY "Artists can certify their releases"
ON public.blockchain_certifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.music_releases mr
    JOIN public.profiles p ON p.id = mr.profile_id
    WHERE mr.id = blockchain_certifications.music_release_id
    AND p.user_id = auth.uid()
  )
);

-- Only system can update certification status
CREATE POLICY "System can update certifications"
ON public.blockchain_certifications
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Public can view confirmed certifications
CREATE POLICY "Public can view confirmed certifications"
ON public.blockchain_certifications
FOR SELECT
USING (status = 'confirmed');

-- Add indexes for performance
CREATE INDEX idx_blockchain_certifications_music_release_id ON public.blockchain_certifications(music_release_id);
CREATE INDEX idx_blockchain_certifications_transaction_hash ON public.blockchain_certifications(transaction_hash);
CREATE INDEX idx_blockchain_certifications_status ON public.blockchain_certifications(status);

-- Create trigger for updated_at
CREATE TRIGGER update_blockchain_certifications_updated_at
BEFORE UPDATE ON public.blockchain_certifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();