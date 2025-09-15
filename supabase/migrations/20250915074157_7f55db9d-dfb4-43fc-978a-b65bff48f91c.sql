-- Add new partner types to profile_type enum
ALTER TYPE profile_type ADD VALUE 'academie';
ALTER TYPE profile_type ADD VALUE 'sponsors'; 
ALTER TYPE profile_type ADD VALUE 'media';
ALTER TYPE profile_type ADD VALUE 'agence';

-- Add new partner types to app_role enum  
ALTER TYPE app_role ADD VALUE 'academie';
ALTER TYPE app_role ADD VALUE 'sponsors';
ALTER TYPE app_role ADD VALUE 'media'; 
ALTER TYPE app_role ADD VALUE 'agence';