-- Fix the left banner campaign assignment to show ads
-- Link ACCUEIL-GAUCHE slot to the campaign that has ad assets
UPDATE ad_campaign_slots 
SET campaign_id = '7293e607-0ac4-4c4c-b217-54462e5d353d'
WHERE slot_id = '04500b86-b382-4b31-9c8a-c605283912c5';

-- Also ensure the slot dimensions match the available assets (300x900)
UPDATE ad_slots 
SET width = 300, height = 900
WHERE code = 'ACCUEIL-GAUCHE';