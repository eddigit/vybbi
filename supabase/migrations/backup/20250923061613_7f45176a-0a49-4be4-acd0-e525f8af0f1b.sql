-- Fix RLS policies on user_token_balances to allow SECURITY DEFINER functions
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can only view and modify their own token balance" ON public.user_token_balances;
DROP POLICY IF EXISTS "Users can view their own token balance" ON public.user_token_balances;
DROP POLICY IF EXISTS "Users can update their own token balance" ON public.user_token_balances;
DROP POLICY IF EXISTS "Users can insert their own token balance" ON public.user_token_balances;

-- Create new policies that allow SECURITY DEFINER functions to work
CREATE POLICY "Users can view their own token balance"
ON public.user_token_balances
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own token balance"
ON public.user_token_balances  
FOR INSERT
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Token functions can update balances"
ON public.user_token_balances
FOR UPDATE
USING (
  -- Allow if user owns the balance OR if called from SECURITY DEFINER function
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  -- Allow updates from token functions (they run as SECURITY DEFINER)
  current_setting('role', true) = 'postgres'
);

-- Also ensure token_transactions table allows SECURITY DEFINER inserts
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.token_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.token_transactions;
DROP POLICY IF EXISTS "Only system can insert transactions" ON public.token_transactions;

CREATE POLICY "Users can view their own transactions"
ON public.token_transactions
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Token system can insert transactions"
ON public.token_transactions
FOR INSERT
WITH CHECK (
  -- Allow if user owns the transaction OR if called from SECURITY DEFINER function
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  -- Allow inserts from token functions
  current_setting('role', true) = 'postgres'
);