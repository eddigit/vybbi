-- Fix spend_vybbi_tokens function to bypass RLS
CREATE OR REPLACE FUNCTION public.spend_vybbi_tokens(
  spender_user_id UUID,
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
  current_balance DECIMAL(18,6);
BEGIN
  -- Check if user has enough balance using SECURITY DEFINER
  EXECUTE format('
    SELECT balance FROM public.user_token_balances
    WHERE user_id = %L',
    spender_user_id
  ) INTO current_balance;
  
  IF current_balance IS NULL OR current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient VYBBI balance';
  END IF;
  
  -- Update balance
  EXECUTE format('
    UPDATE public.user_token_balances 
    SET 
      balance = balance - %L,
      total_spent = total_spent + %L,
      updated_at = now()
    WHERE user_id = %L',
    amount, amount, spender_user_id
  );
  
  -- Record transaction
  EXECUTE format('
    INSERT INTO public.token_transactions (
      user_id, transaction_type, amount, reason, description,
      reference_type, reference_id, metadata
    ) VALUES (
      %L, %L, %L, %L, %L, %L, %L, %L
    )',
    spender_user_id, 'spent', amount, reason, description,
    reference_type, reference_id, metadata
  );
  
  RETURN TRUE;
END;
$$;