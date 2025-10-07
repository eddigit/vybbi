-- Activer l'emplacement publicitaire gauche et associer la campagne RADIO FG
UPDATE ad_slots 
SET is_enabled = true 
WHERE code = 'ADS-LANDING-LEFT';

-- Insérer l'association campagne-emplacement pour l'emplacement gauche
INSERT INTO ad_campaign_slots (
  campaign_id,
  slot_id,
  weight,
  priority,
  is_enabled
)
SELECT 
  c.id as campaign_id,
  s.id as slot_id,
  1 as weight,
  0 as priority,
  true as is_enabled
FROM ad_campaigns c
CROSS JOIN ad_slots s
WHERE c.name = 'RADIO FG' 
  AND c.is_active = true
  AND s.code = 'ADS-LANDING-LEFT'
  AND s.is_enabled = true
ON CONFLICT (campaign_id, slot_id) DO NOTHING;