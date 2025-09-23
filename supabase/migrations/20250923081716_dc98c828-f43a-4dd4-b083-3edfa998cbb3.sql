-- Fix RLS issues for token system and create award_vybbi_tokens function
CREATE OR REPLACE FUNCTION public.award_vybbi_tokens(
  target_user_id UUID,
  amount NUMERIC,
  reason TEXT,
  description TEXT DEFAULT NULL,
  reference_type TEXT DEFAULT NULL,
  reference_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_balance_exists BOOLEAN;
BEGIN
  -- Check if user balance exists using SECURITY DEFINER
  EXECUTE format('
    SELECT EXISTS(SELECT 1 FROM public.user_token_balances WHERE user_id = %L)',
    target_user_id
  ) INTO user_balance_exists;
  
  -- Create balance if it doesn't exist
  IF NOT user_balance_exists THEN
    EXECUTE format('
      INSERT INTO public.user_token_balances (user_id, balance, total_earned, total_spent)
      VALUES (%L, 0, 0, 0)',
      target_user_id
    );
  END IF;
  
  -- Update balance
  EXECUTE format('
    UPDATE public.user_token_balances 
    SET 
      balance = balance + %L,
      total_earned = total_earned + %L,
      updated_at = now()
    WHERE user_id = %L',
    amount, amount, target_user_id
  );
  
  -- Record transaction
  EXECUTE format('
    INSERT INTO public.token_transactions (
      user_id, transaction_type, amount, reason, description,
      reference_type, reference_id, metadata
    ) VALUES (
      %L, %L, %L, %L, %L, %L, %L, %L
    )',
    target_user_id, 'earned', amount, reason, description,
    reference_type, reference_id, metadata
  );
  
  RETURN TRUE;
END;
$$;

-- Create table for storing stripe payment sessions to prevent double payments
CREATE TABLE IF NOT EXISTS public.stripe_payment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  tokens_amount INTEGER NOT NULL,
  pack_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.stripe_payment_sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for stripe_payment_sessions
CREATE POLICY "Users can view their own payment sessions"
  ON public.stripe_payment_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment sessions"
  ON public.stripe_payment_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payment sessions"
  ON public.stripe_payment_sessions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all payment sessions"
  ON public.stripe_payment_sessions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));