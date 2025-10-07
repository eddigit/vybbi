-- Create ad_campaign_slots associations for the existing campaign
-- Get the slot IDs for left and right sidebars
WITH slot_ids AS (
  SELECT id, code FROM ad_slots 
  WHERE code IN ('ADS-LANDING-LEFT', 'ADS-LANDING-RIGHT') 
  AND is_enabled = true
),
campaign_id AS (
  SELECT id FROM ad_campaigns 
  WHERE name = 'RADIO FG' 
  AND is_active = true 
  LIMIT 1
)
INSERT INTO ad_campaign_slots (
  campaign_id,
  slot_id,
  weight,
  priority,
  is_enabled
)
SELECT 
  c.id,
  s.id,
  1,
  0,
  true
FROM campaign_id c
CROSS JOIN slot_ids s
ON CONFLICT (campaign_id, slot_id) DO NOTHING;