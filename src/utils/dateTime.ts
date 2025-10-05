/**
 * Utility functions for reliable timezone-aware date/time handling
 * Uses Intl.DateTimeFormat for accurate timezone conversions
 */

/**
 * Get the user's current timezone
 */
export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/**
 * Get date key in specific timezone (YYYY-MM-DD format)
 * @param input - Date string or Date object
 * @param timeZone - Timezone (e.g., 'Europe/Paris')
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateKeyInTZ(input: string | Date, timeZone: string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const parts = new Intl.DateTimeFormat('en-CA', { 
    timeZone, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(d);
  return parts; // Returns YYYY-MM-DD
}

/**
 * Get time string in specific timezone (HH:mm:ss format)
 * @param input - Date string or Date object
 * @param timeZone - Timezone (e.g., 'Europe/Paris')
 * @returns Time string in HH:mm:ss format
 */
export function getTimeStringInTZ(input: string | Date, timeZone: string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const formatter = new Intl.DateTimeFormat('fr-FR', { 
    timeZone, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  });
  return formatter.format(d); // Returns HH:mm:ss
}

/**
 * Format time of day (HH:mm format)
 * @param input - Date string or Date object
 * @param timeZone - Timezone (defaults to user's timezone)
 * @param locale - Locale (defaults to 'fr-FR')
 * @returns Time string in HH:mm format
 */
export function formatTimeOfDay(
  input: string | Date, 
  timeZone: string = getUserTimeZone(), 
  locale: string = 'fr-FR'
): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, { 
    timeZone, 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  }).format(d);
}

/**
 * Format date label with relative labels (Aujourd'hui, Hier, or full date)
 * @param input - Date string or Date object
 * @param timeZone - Timezone (defaults to user's timezone)
 * @param locale - Locale (defaults to 'fr-FR')
 * @returns Formatted date label
 */
export function formatDateLabel(
  input: string | Date, 
  timeZone: string = getUserTimeZone(), 
  locale: string = 'fr-FR'
): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const todayKey = getDateKeyInTZ(new Date(), timeZone);
  const dateKey = getDateKeyInTZ(d, timeZone);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKeyInTZ(yesterday, timeZone);
  
  if (dateKey === todayKey) {
    return "Aujourd'hui";
  }
  if (dateKey === yesterdayKey) {
    return "Hier";
  }
  
  return new Intl.DateTimeFormat(locale, { 
    timeZone, 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(d);
}
