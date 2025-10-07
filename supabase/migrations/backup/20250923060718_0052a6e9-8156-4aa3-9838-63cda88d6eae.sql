-- Create the missing process_marketplace_purchase function
CREATE OR REPLACE FUNCTION public.process_marketplace_purchase(
  purchase_user_id UUID,
  option_id UUID,
  tokens_spent NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  option_record RECORD;
  result JSONB;
BEGIN
  -- Get the spending option details
  SELECT * INTO option_record
  FROM public.token_spending_options
  WHERE id = option_id AND is_active = true;
  
  IF option_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid spending option');
  END IF;
  
  -- Apply marketplace effects based on option type
  CASE option_record.option_type
    WHEN 'profile_boost' THEN
      -- Boost profile visibility (you can implement this later)
      result := jsonb_build_object(
        'success', true,
        'effect', 'profile_boost',
        'duration_days', option_record.duration_days,
        'message', 'Votre profil sera mis en avant pendant ' || option_record.duration_days || ' jours'
      );
    
    WHEN 'priority_listing' THEN
      -- Priority in search results (you can implement this later)
      result := jsonb_build_object(
        'success', true,
        'effect', 'priority_listing',
        'duration_days', option_record.duration_days,
        'message', 'Votre profil apparaîtra en priorité dans les recherches'
      );
    
    WHEN 'featured_badge' THEN
      -- Add featured badge (you can implement this later)
      result := jsonb_build_object(
        'success', true,
        'effect', 'featured_badge',
        'duration_days', option_record.duration_days,
        'message', 'Badge "Artiste Vedette" activé sur votre profil'
      );
    
    ELSE
      -- Default case
      result := jsonb_build_object(
        'success', true,
        'effect', 'generic_purchase',
        'message', 'Achat effectué avec succès'
      );
  END CASE;
  
  -- Log the purchase effect
  INSERT INTO public.token_transactions (
    user_id,
    transaction_type,
    amount,
    reason,
    description,
    reference_type,
    reference_id,
    metadata
  ) VALUES (
    purchase_user_id,
    'spent',
    0, -- Already spent in the main transaction
    'marketplace_effect',
    'Activation des effets de l''achat marketplace',
    'marketplace_purchase',
    option_id,
    result
  );
  
  RETURN result;
END;
$$;