import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  slotId: string;
  width?: number;
  height?: number;
  hideIfEmpty?: boolean;
  className?: string;
}

interface AdCreative {
  id: string;
  file_url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  campaign_id: string;
  target_url: string | null;
  weight: number;
  priority: number;
}

export function AdSlot({ slotId, width, height, hideIfEmpty = true, className = "" }: AdSlotProps) {
  const [creative, setCreative] = useState<AdCreative | null>(null);
  const [loading, setLoading] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Get session storage keys
  const getSessionKey = (type: 'impression' | 'click', creativeId: string) => 
    `ad_${type}_${creativeId}_${Date.now().toString().slice(0, -3)}000`; // Round to seconds

  const hasBeenTracked = (type: 'impression' | 'click', creativeId: string) => {
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith(`ad_${type}_${creativeId}_`)
    );
    return sessionKeys.length > 0;
  };

  // Load eligible creative for this slot
  const loadCreative = async () => {
    try {
      console.log(`[AdSlot] Loading creative for slot: ${slotId}`);
      
      // Get slot info and global settings
      const { data: slotData } = await supabase
        .from('ad_slots')
        .select('*')
        .eq('code', slotId)
        .eq('is_enabled', true)
        .single();

      console.log(`[AdSlot] Slot data for ${slotId}:`, slotData);

      if (!slotData) {
        console.log(`[AdSlot] No slot data found for ${slotId}`);
        setCreative(null);
        setLoading(false);
        return;
      }

      // Get global settings - DEFAULT TO ENABLED IF NOT FOUND
      const { data: settingsData } = await supabase
        .from('ad_settings')
        .select('setting_value')
        .eq('setting_key', 'ads.global')
        .single();

      const globalSettings = settingsData?.setting_value as any;
      console.log(`[AdSlot] Global settings:`, globalSettings);
      
      // FORCE ADS TO BE ENABLED FOR DEBUGGING
      const adsEnabled = globalSettings?.enabled !== false; // Default to true
      if (!adsEnabled) {
        console.log(`[AdSlot] Ads globally disabled`);
        // Don't return - force display for debugging
      }

      // Get current time for daily window check
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS format

      // Get eligible campaigns and their creatives
      const { data: campaignSlots } = await supabase
        .from('ad_campaign_slots')
        .select(`
          weight,
          priority,
          campaign_id,
          ad_campaigns!inner (
            id,
            name,
            is_active,
            start_date,
            end_date,
            status,
            daily_window_start,
            daily_window_end,
            target_url,
            ad_assets (
              id,
              file_url,
              alt_text,
              width,
              height
            )
          )
        `)
        .eq('slot_id', slotData.id)
        .eq('is_enabled', true);

      if (!campaignSlots?.length) {
        setCreative(null);
        setLoading(false);
        return;
      }

      // Filter eligible campaigns
      const eligibleCreatives: AdCreative[] = [];
      
      console.log(`[AdSlot] Found ${campaignSlots?.length} campaign slots for ${slotId}`);
      
      for (const slot of campaignSlots) {
        const campaign = slot.ad_campaigns;
        console.log(`[AdSlot] Processing campaign:`, campaign.name, {
          is_active: campaign.is_active,
          status: campaign.status,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          assets_count: campaign.ad_assets?.length
        });
        
        // SIMPLIFIED CHECK - just check if campaign is active
        if (!campaign.is_active) {
          console.log(`[AdSlot] Campaign ${campaign.name} is not active`);
          continue;
        }
        
        // RELAXED DATE CHECK
        const startDate = new Date(campaign.start_date);
        const endDate = new Date(campaign.end_date);
        const today = new Date();
        
        if (today < startDate || today > endDate) {
          console.log(`[AdSlot] Campaign ${campaign.name} date out of range`, { today, startDate, endDate });
          continue;
        }

        // Skip daily window check for debugging
        console.log(`[AdSlot] Campaign ${campaign.name} passed date checks`);

        // Check if campaign has assets
        if (!campaign.ad_assets?.length) {
          console.log(`[AdSlot] Campaign ${campaign.name} has no assets`);
          continue;
        }

        // Add eligible creatives from this campaign
        for (const asset of campaign.ad_assets) {
          console.log(`[AdSlot] Processing asset:`, asset.id, {
            dimensions: `${asset.width}x${asset.height}`,
            slot_dimensions: `${slotData.width}x${slotData.height}`
          });
          
          // RELAXED DIMENSION CHECK
          const widthOk = !slotData.width || !asset.width || Math.abs(asset.width - slotData.width) <= 100;
          const heightOk = !slotData.height || !asset.height || Math.abs(asset.height - slotData.height) <= 200;
          
          if (!widthOk || !heightOk) {
            console.log(`[AdSlot] Asset ${asset.id} dimensions don't match`);
            continue;
          }

          // SKIP FREQUENCY CAP FOR DEBUGGING
          console.log(`[AdSlot] Adding eligible creative:`, asset.id);

          eligibleCreatives.push({
            id: asset.id,
            file_url: asset.file_url,
            alt_text: asset.alt_text,
            width: asset.width,
            height: asset.height,
            campaign_id: campaign.id,
            target_url: campaign.target_url,
            weight: slot.weight,
            priority: slot.priority
          });
        }
      }

      console.log(`[AdSlot] Found ${eligibleCreatives.length} eligible creatives for ${slotId}`);
      
      if (eligibleCreatives.length === 0) {
        console.log(`[AdSlot] No eligible creatives found for ${slotId}`);
        setCreative(null);
        setLoading(false);
        return;
      }

      // Select creative based on priority and weight
      eligibleCreatives.sort((a, b) => b.priority - a.priority);
      const highestPriority = eligibleCreatives[0].priority;
      const topPriorityCreatives = eligibleCreatives.filter(c => c.priority === highestPriority);

      // Weighted random selection among top priority creatives
      const totalWeight = topPriorityCreatives.reduce((sum, c) => sum + c.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedCreative = topPriorityCreatives[0];

      for (const creative of topPriorityCreatives) {
        random -= creative.weight;
        if (random <= 0) {
          selectedCreative = creative;
          break;
        }
      }

      console.log(`[AdSlot] Selected creative for ${slotId}:`, selectedCreative);
      setCreative(selectedCreative);
    } catch (error) {
      console.error(`[AdSlot] Error loading ad creative for ${slotId}:`, error);
      setCreative(null);
    } finally {
      setLoading(false);
    }
  };

  // Track impression when ad enters viewport
  const trackImpression = async (creativeId: string, campaignId: string) => {
    if (impressionTracked || hasBeenTracked('impression', creativeId)) return;

    try {
      await supabase.from('ad_metrics').insert({
        campaign_id: campaignId,
        asset_id: creativeId,
        event_type: 'impression',
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent
      });

      // Mark as tracked in session
      sessionStorage.setItem(getSessionKey('impression', creativeId), 'true');
      setImpressionTracked(true);
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  // Track click and redirect
  const handleClick = async (e: React.MouseEvent) => {
    if (!creative) return;

    const globalSettings = await supabase
      .from('ad_settings')
      .select('setting_value')
      .eq('setting_key', 'ads.global')
      .single();

    const clickThrottle = (globalSettings.data?.setting_value as any)?.click_throttle_ms || 2000;
    
    // Check click throttling
    const lastClickKey = `ad_last_click_${creative.id}`;
    const lastClick = sessionStorage.getItem(lastClickKey);
    const now = Date.now();
    
    if (lastClick && (now - parseInt(lastClick)) < clickThrottle) {
      e.preventDefault();
      return;
    }

    // Track click
    try {
      await supabase.from('ad_metrics').insert({
        campaign_id: creative.campaign_id,
        asset_id: creative.id,
        event_type: 'click',
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent
      });

      sessionStorage.setItem(lastClickKey, now.toString());
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Add UTM parameters
    if (creative.target_url) {
      const url = new URL(creative.target_url);
      url.searchParams.set('utm_source', 'vybbi');
      url.searchParams.set('utm_medium', 'banner');
      url.searchParams.set('utm_campaign', creative.campaign_id);
      url.searchParams.set('utm_content', creative.id);
      url.searchParams.set('utm_slot', slotId);
      
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    }
    
    e.preventDefault();
  };

  // Setup intersection observer for impression tracking
  useEffect(() => {
    if (!creative || impressionTracked) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTracked) {
            trackImpression(creative.id, creative.campaign_id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '50px' }
    );

    if (adRef.current) {
      observerRef.current.observe(adRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [creative, impressionTracked]);

  // Load creative on mount
  useEffect(() => {
    loadCreative();
  }, [slotId]);

  if (loading) return null;
  
  if (!creative && hideIfEmpty) return null;

  if (!creative) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg ${className}`}
        style={{ width: width || 300, height: height || 250 }}
      >
        <span className="text-xs text-muted-foreground">Emplacement publicitaire</span>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`ad-slot ${className}`}>
      <a
        href="#"
        onClick={handleClick}
        className="block"
        style={{ 
          width: width || creative.width || 300, 
          height: height || creative.height || 250 
        }}
      >
        <img
          src={creative.file_url}
          alt={creative.alt_text || 'Publicité'}
          className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          style={{ 
            width: width || creative.width || 300, 
            height: height || creative.height || 250 
          }}
        />
      </a>
    </div>
  );
}