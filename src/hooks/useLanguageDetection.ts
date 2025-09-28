// Safe fallback for legacy imports to avoid invalid hook call errors
// IMPORTANT: This is intentionally NOT using React hooks to prevent
// \"Invalid hook call\" runtime errors from stale bundles referencing this module.
// It provides a minimal, side-effect-free language detection that mirrors
// the logic in the current TranslationContext.

export type LanguageDetectionResult = {
  detectedLanguage: string;
  userLanguage: string;
  isAutoDetected: boolean;
  changeLanguage: (code: string) => void;
};

// Named export to match potential legacy imports: `import { useLanguageDetection } from '@/hooks/useLanguageDetection'`
export function useLanguageDetection(): LanguageDetectionResult {
  // Default fallback
  let detected = 'fr';
  let user = 'fr';
  let isAuto = true;

  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('vybbi-language') : null;
    if (saved && /^[a-z]{2}$/i.test(saved)) {
      detected = saved;
      user = saved;
      isAuto = false;
    } else if (typeof navigator !== 'undefined') {
      const browserLanguages = navigator.languages || [navigator.language];
      for (const l of browserLanguages) {
        const code = (l || '').split('-')[0].toLowerCase();
        if (code) {
          detected = code;
          user = code;
          break;
        }
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('vybbi-language', detected);
      }
      isAuto = true;
    }
  } catch {
    // Swallow errors and keep defaults
  }

  const changeLanguage = (code: string) => {
    try {
      if (!code) return;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('vybbi-language', code);
      }
      // No state update here by design (legacy fallback)
    } catch {
      // ignore
    }
  };

  return { detectedLanguage: detected, userLanguage: user, isAutoDetected: isAuto, changeLanguage };
}

export default useLanguageDetection;
