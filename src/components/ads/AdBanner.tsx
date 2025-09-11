import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdCampaign {
  id: string;
  name: string;
  target_url?: string;
  ad_assets: Array<{
    id: string;
    file_url: string;
    file_name: string;
    width?: number;
    height?: number;
    alt_text?: string;
    display_order: number;
  }>;
}

interface AdBannerProps {
  placement: 'header' | 'sidebar_left' | 'sidebar_right' | 'banner_top' | 'banner_bottom';
  className?: string;
}

export function AdBanner({ placement, className = '' }: AdBannerProps) {
  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkAdSettings();
    fetchActiveCampaign();
  }, [placement]);

  const checkAdSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('ad_settings')
        .select('setting_value')
        .eq('setting_key', 'ads_enabled')
        .single();

      if (settings?.setting_value && typeof settings.setting_value === 'object' && 'enabled' in settings.setting_value) {
        setIsEnabled(Boolean((settings.setting_value as any).enabled));
      }
    } catch (error) {
      console.error('Error checking ad settings:', error);
    }
  };

  const fetchActiveCampaign = async () => {
    if (!isEnabled) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: campaigns } = await supabase
        .from('ad_campaigns')
        .select(`
          id,
          name,
          target_url,
          ad_assets (
            id,
            file_url,
            file_name,
            width,
            height,
            alt_text,
            display_order
          )
        `)
        .eq('placement_type', placement)
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      if (campaigns && campaigns.length > 0 && campaigns[0].ad_assets.length > 0) {
        const campaign = campaigns[0];
        // Sort assets by display_order
        campaign.ad_assets.sort((a, b) => a.display_order - b.display_order);
        setCampaign(campaign);
      }
    } catch (error) {
      console.error('Error fetching ad campaign:', error);
    }
  };

  const trackEvent = async (eventType: 'impression' | 'click', assetId?: string) => {
    if (!campaign) return;

    try {
      await supabase.functions.invoke('track-ad-event', {
        body: {
          campaignId: campaign.id,
          assetId,
          eventType,
          pageUrl: window.location.href,
          referrer: document.referrer
        }
      });
    } catch (error) {
      console.error('Error tracking ad event:', error);
    }
  };

  const handleClick = () => {
    if (!campaign) return;

    const currentAsset = campaign.ad_assets[currentAssetIndex];
    trackEvent('click', currentAsset?.id);

    if (campaign.target_url) {
      window.open(campaign.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (campaign && campaign.ad_assets.length > 0) {
      const currentAsset = campaign.ad_assets[currentAssetIndex];
      trackEvent('impression', currentAsset?.id);

      // Rotate assets every 30 seconds if multiple assets
      if (campaign.ad_assets.length > 1) {
        const interval = setInterval(() => {
          setCurrentAssetIndex(prev => (prev + 1) % campaign.ad_assets.length);
        }, 30000);

        return () => clearInterval(interval);
      }
    }
  }, [campaign, currentAssetIndex]);

  if (!isEnabled || !campaign || campaign.ad_assets.length === 0) {
    return null;
  }

  const currentAsset = campaign.ad_assets[currentAssetIndex];
  
  const getPlacementStyles = () => {
    switch (placement) {
      case 'header':
        return 'h-16 w-full max-w-md';
      case 'sidebar_left':
      case 'sidebar_right':
        return 'w-full max-w-[300px] h-[600px]';
      case 'banner_top':
      case 'banner_bottom':
        return 'w-full h-24 max-w-4xl mx-auto';
      default:
        return 'w-full h-auto';
    }
  };

  return (
    <div className={`ad-banner ${getPlacementStyles()} ${className}`}>
      <img
        src={currentAsset.file_url}
        alt={currentAsset.alt_text || `Publicité ${campaign.name}`}
        className="w-full h-full object-cover cursor-pointer rounded-lg border border-border/50 hover:border-border transition-colors"
        onClick={handleClick}
        loading="lazy"
      />
    </div>
  );
}