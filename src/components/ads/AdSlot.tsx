import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  slotId: string;
  width?: number;
  height?: number;
  hideIfEmpty?: boolean;
  className?: string;
  fit?: 'cover' | 'contain' | 'fill';
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

export function AdSlot({ slotId, width, height, hideIfEmpty = true, className = "", fit = 'cover' }: AdSlotProps) {
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
      // Get slot info and global settings
      const { data: slotData } = await supabase
        .from('ad_slots')
        .select('*')
        .eq('code', slotId)
        .eq('is_enabled', true)
        .single();

      if (!slotData) {
        // Fallback: no slot configured, pull any active campaign assets
        const { data: campaigns } = await supabase
          .from('ad_campaigns')
          .select(`
            id, name, is_active, start_date, end_date, status, daily_window_start, daily_window_end, target_url,
            ad_assets (
              id, file_url, alt_text, width, height
            )
          `)
          .eq('is_active', true);

        const eligible: AdCreative[] = [];
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 8);

        for (const campaign of campaigns || []) {
          // Date range check
          const startDate = new Date(campaign.start_date);
          const endDate = new Date(campaign.end_date);
          if (now < startDate || now > endDate) continue;

          // Daily window check
          if (campaign.daily_window_start && campaign.daily_window_end) {
            if (currentTime < campaign.daily_window_start || currentTime > campaign.daily_window_end) continue;
          }

          if (!campaign.ad_assets?.length) continue;

          for (const asset of campaign.ad_assets) {
            // Use component-provided dimensions since no slot exists in DB
            const effectiveWidth = width || null;
            const effectiveHeight = height || null;
            const widthOk = !effectiveWidth || !asset.width || Math.abs(asset.width - effectiveWidth) <= 100;
            const heightOk = !effectiveHeight || !asset.height || Math.abs(asset.height - effectiveHeight) <= 200;
            if (!widthOk || !heightOk) continue;

            eligible.push({
              id: asset.id,
              file_url: asset.file_url,
              alt_text: asset.alt_text,
              width: asset.width,
              height: asset.height,
              campaign_id: campaign.id,
              target_url: campaign.target_url,
              weight: 1,
              priority: 0,
            });
          }
        }

        if (eligible.length > 0) {
          const idx = Math.floor(Math.random() * eligible.length);
          setCreative(eligible[idx]);
        } else {
          setCreative(null);
        }
        setLoading(false);
        return;
      }

      // Get global settings
      const { data: settingsData } = await supabase
        .from('ad_settings')
        .select('setting_value')
        .eq('setting_key', 'ads.global')
        .single();

      const globalSettings = settingsData?.setting_value as any;
      const adsEnabled = globalSettings?.enabled !== false;

      if (!adsEnabled) {
        setCreative(null);
        setLoading(false);
        return;
      }

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
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8);
      
      for (const slot of campaignSlots) {
        const campaign = slot.ad_campaigns;
        
        if (!campaign.is_active) continue;
        
        // Date range check
        const startDate = new Date(campaign.start_date);
        const endDate = new Date(campaign.end_date);
        if (now < startDate || now > endDate) continue;

        // Daily window check
        if (campaign.daily_window_start && campaign.daily_window_end) {
          if (currentTime < campaign.daily_window_start || currentTime > campaign.daily_window_end) {
            continue;
          }
        }

        // Check assets
        if (!campaign.ad_assets?.length) continue;

        for (const asset of campaign.ad_assets) {
          // Dimension check (flexible, uses slot dimensions or provided props as fallback)
          const effectiveWidth = slotData.width || width || null;
          const effectiveHeight = slotData.height || height || null;
          const widthOk = !effectiveWidth || !asset.width || Math.abs(asset.width - effectiveWidth) <= 100;
          const heightOk = !effectiveHeight || !asset.height || Math.abs(asset.height - effectiveHeight) <= 200;

          if (!widthOk || !heightOk) continue;

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
      
      if (eligibleCreatives.length === 0) {
        setCreative(null);
        setLoading(false);
        return;
      }

      // Select creative based on priority and weight
      eligibleCreatives.sort((a, b) => b.priority - a.priority);
      const highestPriority = eligibleCreatives[0].priority;
      const topPriorityCreatives = eligibleCreatives.filter(c => c.priority === highestPriority);

      // Weighted random selection
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

      setCreative(selectedCreative);
    } catch (error) {
      console.error(`Error loading ad for slot ${slotId}:`, error);
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
          className={`w-full h-full object-${fit} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${fit === 'contain' ? 'bg-muted/10' : ''}`}
          style={{ 
            width: width || creative.width || 300, 
            height: height || creative.height || 250 
          }}
        />
      </a>
    </div>
  );
}