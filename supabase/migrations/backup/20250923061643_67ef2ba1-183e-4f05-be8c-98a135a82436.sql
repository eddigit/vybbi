-- Simple fix: Make token functions bypass RLS by using raw SQL within SECURITY DEFINER
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
  user_balance RECORD;
  new_level TEXT;
  new_multiplier DECIMAL(3,2);
BEGIN
  -- Bypass RLS by using SECURITY DEFINER and direct SQL
  
  -- Get or create user balance record (bypass RLS with SECURITY DEFINER)
  EXECUTE format('
    INSERT INTO public.user_token_balances (user_id)
    VALUES (%L)
    ON CONFLICT (user_id) DO NOTHING',
    target_user_id
  );
  
  -- Get current balance
  EXECUTE format('
    SELECT * FROM public.user_token_balances 
    WHERE user_id = %L',
    target_user_id
  ) INTO user_balance;
  
  -- Apply multiplier
  amount := amount * COALESCE(user_balance.multiplier, 1.05);
  
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
  
  -- Calculate new level based on total earned
  SELECT 
    CASE 
      WHEN COALESCE(user_balance.total_earned, 0) + amount >= 20000 THEN 'platine'
      WHEN COALESCE(user_balance.total_earned, 0) + amount >= 5000 THEN 'or'
      WHEN COALESCE(user_balance.total_earned, 0) + amount >= 1000 THEN 'argent'
      ELSE 'bronze'
    END,
    CASE 
      WHEN COALESCE(user_balance.total_earned, 0) + amount >= 20000 THEN 1.25
      WHEN COALESCE(user_balance.total_earned, 0) + amount >= 5000 THEN 1.15
      WHEN COALESCE(user_balance.total_earned, 0) + amount >= 1000 THEN 1.10
      ELSE 1.05
    END
  INTO new_level, new_multiplier;
  
  -- Update level if changed
  IF new_level != COALESCE(user_balance.level, 'bronze') THEN
    EXECUTE format('
      UPDATE public.user_token_balances 
      SET level = %L, multiplier = %L
      WHERE user_id = %L',
      new_level, new_multiplier, target_user_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$;