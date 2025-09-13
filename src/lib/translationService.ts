import { supabase } from '@/integrations/supabase/client';

interface TranslationCache {
  [key: string]: string;
}

class TranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_KEY = 'vybbi-translations';
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const { cache, timestamp } = JSON.parse(stored);
        // Check if cache is still valid
        if (Date.now() - timestamp < this.CACHE_EXPIRY) {
          this.cache = cache;
        } else {
          localStorage.removeItem(this.CACHE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load translation cache:', error);
    }
  }

  private saveCacheToStorage() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        cache: this.cache,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save translation cache:', error);
    }
  }

  private getCacheKey(text: string, targetLang: string, sourceLang?: string): string {
    return `${sourceLang || 'auto'}_${targetLang}_${text}`;
  }

  async translate(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<string> {
    // Translation disabled: always return original text
    try {
      if (!text?.trim()) return text;
      return text;
    } catch {
      return text;
    }
  }

  async translateBatch(
    texts: string[], 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<string[]> {
    // Process in parallel but limit concurrent requests
    const BATCH_SIZE = 3;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(text => this.translate(text, targetLanguage, sourceLanguage));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  clearCache() {
    this.cache = {};
    localStorage.removeItem(this.CACHE_KEY);
  }
}

export const translationService = new TranslationService();