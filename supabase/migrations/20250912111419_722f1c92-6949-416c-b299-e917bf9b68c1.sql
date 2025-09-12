-- Mise à jour des emplacements publicitaires en français
UPDATE ad_slots 
SET code = 'ACCUEIL-GAUCHE', name = 'Page d''Accueil - Sidebar Gauche' 
WHERE code = 'ADS-LANDING-LEFT';

UPDATE ad_slots 
SET code = 'ACCUEIL-DROITE', name = 'Page d''Accueil - Sidebar Droite' 
WHERE code = 'ADS-LANDING-RIGHT';

-- Mise à jour des autres emplacements aussi pour plus de cohérence
UPDATE ad_slots 
SET code = 'TABLEAU-BORD-HEADER', name = 'Tableau de Bord - Bannière Header' 
WHERE code = 'ADS-DASHBOARD-HEADER';

UPDATE ad_slots 
SET code = 'TABLEAU-BORD-SIDEBAR', name = 'Tableau de Bord - Sidebar' 
WHERE code = 'ADS-DASHBOARD-SIDEBAR';