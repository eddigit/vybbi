-- First, let's see the current structure and add the missing constraint
-- Add placement_type check constraint for ad_campaigns table
ALTER TABLE public.ad_campaigns 
ADD CONSTRAINT ad_campaigns_placement_type_check 
CHECK (placement_type IN ('banner', 'sidebar', 'header', 'footer', 'inline', 'popup', 'video', 'native'));

-- Also add some example valid values to make it clearer
COMMENT ON COLUMN public.ad_campaigns.placement_type IS 'Valid values: banner, sidebar, header, footer, inline, popup, video, native';