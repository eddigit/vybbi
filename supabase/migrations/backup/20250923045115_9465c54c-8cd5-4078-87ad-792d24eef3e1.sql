-- Create user token balances table
CREATE TABLE public.user_token_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(18,6) NOT NULL DEFAULT 0,
  total_earned DECIMAL(18,6) NOT NULL DEFAULT 0,
  total_spent DECIMAL(18,6) NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'bronze',
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.05,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_token_balances ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own token balance" 
ON public.user_token_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own token balance" 
ON public.user_token_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create token transactions table
CREATE TABLE public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty')),
  amount DECIMAL(18,6) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own token transactions" 
ON public.token_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create token earning rules table
CREATE TABLE public.token_earning_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('daily_login', 'profile_completion', 'social_interaction', 'referral', 'ad_impression', 'campaign_bonus')),
  base_amount DECIMAL(18,6) NOT NULL,
  max_per_day DECIMAL(18,6),
  cooldown_hours INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_profile_types TEXT[] DEFAULT ARRAY['artist', 'agent', 'manager', 'lieu'],
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_earning_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage token earning rules" 
ON public.token_earning_rules 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active earning rules" 
ON public.token_earning_rules 
FOR SELECT 
USING (is_active = true);

-- Create token spending options table
CREATE TABLE public.token_spending_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_name TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('subscription', 'boost', 'service', 'feature', 'upgrade')),
  vybbi_cost DECIMAL(18,6) NOT NULL,
  duration_days INTEGER,
  target_profile_types TEXT[] DEFAULT ARRAY['artist', 'agent', 'manager', 'lieu'],
  description TEXT,
  benefits JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_spending_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active spending options" 
ON public.token_spending_options 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage spending options" 
ON public.token_spending_options 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default earning rules
INSERT INTO public.token_earning_rules (rule_name, rule_type, base_amount, max_per_day, cooldown_hours) VALUES
('daily_login', 'daily_login', 5, 5, 24),
('profile_completion', 'profile_completion', 50, 50, null),
('first_post', 'social_interaction', 25, 25, null),
('social_like', 'social_interaction', 1, 10, 1),
('social_comment', 'social_interaction', 2, 20, 1),
('successful_referral', 'referral', 100, null, null),
('ad_impression_1000', 'ad_impression', 1, null, null),
('campaign_completion', 'campaign_bonus', 200, null, null);

-- Insert default spending options  
INSERT INTO public.token_spending_options (option_name, option_type, vybbi_cost, duration_days, target_profile_types, description) VALUES
('Artist Pro Monthly', 'subscription', 500, 30, ARRAY['artist'], 'Abonnement mensuel Artiste Pro avec fonctionnalités avancées'),
('Agent Premium Monthly', 'subscription', 800, 30, ARRAY['agent'], 'Abonnement mensuel Agent Premium avec outils de prospection'),
('Venue Elite Monthly', 'subscription', 1000, 30, ARRAY['lieu'], 'Abonnement mensuel Venue Elite avec gestion d''événements'),
('Profile Boost Weekly', 'boost', 100, 7, ARRAY['artist', 'agent', 'manager', 'lieu'], 'Boost de visibilité du profil pendant 7 jours'),
('Event Promotion', 'boost', 150, 3, ARRAY['lieu'], 'Mise en avant d''événement pendant 3 jours'),
('Priority Message', 'service', 10, null, ARRAY['agent', 'manager'], 'Message prioritaire dans les conversations'),
('Profile Certification', 'upgrade', 300, null, ARRAY['artist', 'agent', 'manager', 'lieu'], 'Certification officielle du profil'),
('Advanced Analytics', 'feature', 200, 30, ARRAY['artist', 'agent', 'manager', 'lieu'], 'Accès aux analytics avancés pendant 30 jours');

-- Create function to award tokens
CREATE OR REPLACE FUNCTION public.award_vybbi_tokens(
  target_user_id UUID,
  amount DECIMAL(18,6),
  reason TEXT,
  description TEXT DEFAULT NULL,
  reference_type TEXT DEFAULT NULL,
  reference_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_balance RECORD;
  new_level TEXT;
  new_multiplier DECIMAL(3,2);
BEGIN
  -- Get or create user balance record
  INSERT INTO public.user_token_balances (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current balance
  SELECT * INTO user_balance 
  FROM public.user_token_balances 
  WHERE user_id = target_user_id;
  
  -- Apply multiplier
  amount := amount * user_balance.multiplier;
  
  -- Update balance
  UPDATE public.user_token_balances 
  SET 
    balance = balance + amount,
    total_earned = total_earned + amount,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id, transaction_type, amount, reason, description, 
    reference_type, reference_id, metadata
  ) VALUES (
    target_user_id, 'earned', amount, reason, description,
    reference_type, reference_id, metadata
  );
  
  -- Calculate new level based on total earned
  SELECT 
    CASE 
      WHEN user_balance.total_earned + amount >= 20000 THEN 'platine'
      WHEN user_balance.total_earned + amount >= 5000 THEN 'or'
      WHEN user_balance.total_earned + amount >= 1000 THEN 'argent'
      ELSE 'bronze'
    END,
    CASE 
      WHEN user_balance.total_earned + amount >= 20000 THEN 1.25
      WHEN user_balance.total_earned + amount >= 5000 THEN 1.15
      WHEN user_balance.total_earned + amount >= 1000 THEN 1.10
      ELSE 1.05
    END
  INTO new_level, new_multiplier;
  
  -- Update level if changed
  IF new_level != user_balance.level THEN
    UPDATE public.user_token_balances 
    SET level = new_level, multiplier = new_multiplier
    WHERE user_id = target_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to spend tokens
CREATE OR REPLACE FUNCTION public.spend_vybbi_tokens(
  spender_user_id UUID,
  amount DECIMAL(18,6),
  reason TEXT,
  description TEXT DEFAULT NULL,
  reference_type TEXT DEFAULT NULL,
  reference_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance DECIMAL(18,6);
BEGIN
  -- Check if user has enough balance
  SELECT balance INTO current_balance
  FROM public.user_token_balances
  WHERE user_id = spender_user_id;
  
  IF current_balance IS NULL OR current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient VYBBI balance';
  END IF;
  
  -- Update balance
  UPDATE public.user_token_balances 
  SET 
    balance = balance - amount,
    total_spent = total_spent + amount,
    updated_at = now()
  WHERE user_id = spender_user_id;
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id, transaction_type, amount, reason, description,
    reference_type, reference_id, metadata
  ) VALUES (
    spender_user_id, 'spent', amount, reason, description,
    reference_type, reference_id, metadata
  );
  
  RETURN TRUE;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_user_token_balances_updated_at
BEFORE UPDATE ON public.user_token_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_token_earning_rules_updated_at
BEFORE UPDATE ON public.token_earning_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_token_spending_options_updated_at
BEFORE UPDATE ON public.token_spending_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_token_balances_user_id ON public.user_token_balances(user_id);
CREATE INDEX idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX idx_token_transactions_processed_at ON public.token_transactions(processed_at DESC);
CREATE INDEX idx_token_earning_rules_active ON public.token_earning_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_token_spending_options_active ON public.token_spending_options(is_active) WHERE is_active = true;