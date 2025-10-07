-- Add SIRET field to profiles for legal compliance
ALTER TABLE public.profiles 
ADD COLUMN siret_number text,
ADD COLUMN siret_verified boolean DEFAULT false,
ADD COLUMN siret_verified_at timestamp with time zone;

-- Add recurring commission tracking fields
ALTER TABLE public.affiliate_conversions
ADD COLUMN is_recurring boolean DEFAULT false,
ADD COLUMN monthly_commission_amount numeric DEFAULT 0.50,
ADD COLUMN recurring_start_date date,
ADD COLUMN recurring_end_date date,
ADD COLUMN is_exclusive_program boolean DEFAULT false;

-- Create table for monthly recurring commissions tracking
CREATE TABLE public.recurring_commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- The user who is paying monthly
  conversion_id uuid REFERENCES public.affiliate_conversions(id),
  month_year text NOT NULL, -- Format: 'YYYY-MM'
  amount numeric NOT NULL DEFAULT 0.50,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  is_exclusive_program boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(influencer_profile_id, user_id, month_year)
);

-- Enable RLS on recurring_commissions
ALTER TABLE public.recurring_commissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_commissions
CREATE POLICY "Admins can manage all recurring commissions" 
ON public.recurring_commissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Influencers can view their recurring commissions" 
ON public.recurring_commissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = recurring_commissions.influencer_profile_id 
    AND p.user_id = auth.uid()
  )
);

-- Update commission rates and add exclusive program tracking
UPDATE public.affiliate_conversions 
SET commission_rate = 0.05,  -- Keep existing 5% or set new standard
    commission_amount = CASE 
      WHEN conversion_type = 'registration' THEN 2.00
      WHEN conversion_type = 'subscription' THEN 2.00
      ELSE commission_amount
    END;

-- Create function to calculate monthly recurring commissions
CREATE OR REPLACE FUNCTION public.calculate_monthly_recurring_commissions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month text := to_char(CURRENT_DATE, 'YYYY-MM');
  conversion_record RECORD;
  user_is_active boolean;
BEGIN
  -- Loop through all conversions that should generate recurring commissions
  FOR conversion_record IN 
    SELECT 
      ac.id,
      ac.link_id,
      ac.user_id,
      il.influencer_profile_id,
      ac.converted_at,
      ac.is_recurring,
      ac.is_exclusive_program
    FROM affiliate_conversions ac
    JOIN influencer_links il ON il.id = ac.link_id
    WHERE ac.conversion_type = 'subscription'
      AND ac.conversion_status = 'confirmed'
      AND ac.converted_at <= CURRENT_DATE
      -- For exclusive program: only if conversion was before 2026-01-31
      AND (NOT ac.is_exclusive_program OR ac.converted_at <= '2026-01-31'::date)
  LOOP
    -- Check if user is still active (has recent activity)
    -- This is a simplified check - you might want to adjust based on your definition of "active"
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = conversion_record.user_id 
      AND last_sign_in_at > CURRENT_DATE - INTERVAL '60 days'
    ) INTO user_is_active;
    
    -- Only create recurring commission if user is active and record doesn't exist
    IF user_is_active AND NOT EXISTS (
      SELECT 1 FROM recurring_commissions 
      WHERE influencer_profile_id = conversion_record.influencer_profile_id
        AND user_id = conversion_record.user_id
        AND month_year = current_month
    ) THEN
      INSERT INTO recurring_commissions (
        influencer_profile_id,
        user_id,
        conversion_id,
        month_year,
        amount,
        is_exclusive_program,
        status
      ) VALUES (
        conversion_record.influencer_profile_id,
        conversion_record.user_id,
        conversion_record.id,
        current_month,
        CASE 
          WHEN conversion_record.is_exclusive_program THEN 0.50
          ELSE 0.25  -- Regular rate for non-exclusive
        END,
        conversion_record.is_exclusive_program,
        'pending'
      );
    END IF;
  END LOOP;
END;
$$;

-- Create trigger to auto-update updated_at on recurring_commissions
CREATE TRIGGER update_recurring_commissions_updated_at
  BEFORE UPDATE ON public.recurring_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();