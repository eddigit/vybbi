
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUserTimeZone,
  getDateKeyInTZ,
  getTimeStringInTZ,
  formatTimeOfDay,
  formatDateLabel,
} from '../dateTime';

describe('dateTime utilities', () => {
  describe('getUserTimeZone', () => {
    it('should return a valid timezone string', () => {
      const tz = getUserTimeZone();
      expect(tz).toBeTruthy();
      expect(typeof tz).toBe('string');
      // Should be a valid IANA timezone or UTC
      expect(tz).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/);
    });

    it('should return UTC as fallback if timezone is unavailable', () => {
      const originalDateTimeFormat = Intl.DateTimeFormat;
      
      // Mock Intl.DateTimeFormat to return undefined timezone
      vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(
        () =>
          ({
            resolvedOptions: () => ({ timeZone: undefined }),
          } as any)
      );

      const tz = getUserTimeZone();
      expect(tz).toBe('UTC');

      // Restore original
      Intl.DateTimeFormat = originalDateTimeFormat;
    });
  });

  describe('getDateKeyInTZ', () => {
    it('should format date as YYYY-MM-DD in specified timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const dateKey = getDateKeyInTZ(date, 'UTC');
      expect(dateKey).toBe('2024-01-15');
    });

    it('should handle string input', () => {
      const dateKey = getDateKeyInTZ('2024-01-15T12:00:00Z', 'UTC');
      expect(dateKey).toBe('2024-01-15');
    });

    it('should respect timezone differences', () => {
      // 23:00 UTC on Jan 15 is 00:00 CET on Jan 16
      const date = new Date('2024-01-15T23:00:00Z');
      const utcKey = getDateKeyInTZ(date, 'UTC');
      const parisKey = getDateKeyInTZ(date, 'Europe/Paris');
      
      expect(utcKey).toBe('2024-01-15');
      expect(parisKey).toBe('2024-01-16');
    });

    it('should handle edge case dates', () => {
      // New Year transition
      const date = new Date('2023-12-31T23:30:00Z');
      const utcKey = getDateKeyInTZ(date, 'UTC');
      const tokyoKey = getDateKeyInTZ(date, 'Asia/Tokyo'); // UTC+9
      
      expect(utcKey).toBe('2023-12-31');
      expect(tokyoKey).toBe('2024-01-01');
    });
  });

  describe('getTimeStringInTZ', () => {
    it('should format time as HH:mm:ss in specified timezone', () => {
      const date = new Date('2024-01-15T12:30:45Z');
      const timeStr = getTimeStringInTZ(date, 'UTC');
      expect(timeStr).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle string input', () => {
      const timeStr = getTimeStringInTZ('2024-01-15T12:30:45Z', 'UTC');
      expect(timeStr).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should respect timezone differences', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const utcTime = getTimeStringInTZ(date, 'UTC');
      const parisTime = getTimeStringInTZ(date, 'Europe/Paris'); // UTC+1 in winter
      
      expect(utcTime).toBe('12:00:00');
      expect(parisTime).toBe('13:00:00');
    });

    it('should use 24-hour format', () => {
      const date = new Date('2024-01-15T23:59:59Z');
      const timeStr = getTimeStringInTZ(date, 'UTC');
      expect(timeStr).toBe('23:59:59');
    });
  });

  describe('formatTimeOfDay', () => {
    it('should format time as HH:mm', () => {
      const date = new Date('2024-01-15T12:30:00Z');
      const timeStr = formatTimeOfDay(date, 'UTC');
      expect(timeStr).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should use user timezone by default', () => {
      const date = new Date('2024-01-15T12:30:00Z');
      const timeStr = formatTimeOfDay(date);
      expect(timeStr).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle string input', () => {
      const timeStr = formatTimeOfDay('2024-01-15T12:30:00Z', 'UTC');
      expect(timeStr).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should respect custom locale', () => {
      const date = new Date('2024-01-15T12:30:00Z');
      const timeStr = formatTimeOfDay(date, 'UTC', 'en-US');
      expect(timeStr).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('formatDateLabel', () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15 12:00 UTC
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    it('should return "Aujourd\'hui" for today', () => {
      const today = new Date('2024-01-15T10:00:00Z');
      const label = formatDateLabel(today, 'UTC');
      expect(label).toBe("Aujourd'hui");
    });

    it('should return "Hier" for yesterday', () => {
      const yesterday = new Date('2024-01-14T10:00:00Z');
      const label = formatDateLabel(yesterday, 'UTC');
      expect(label).toBe('Hier');
    });

    it('should return full date for older dates', () => {
      const oldDate = new Date('2024-01-10T10:00:00Z');
      const label = formatDateLabel(oldDate, 'UTC', 'fr-FR');
      expect(label).toMatch(/mercredi/i);
      expect(label).toMatch(/janvier/i);
      expect(label).toMatch(/2024/);
    });

    it('should handle timezone-aware date boundaries', () => {
      // 23:00 UTC on Jan 14 is still Jan 14 in UTC but Jan 15 in Paris
      const date = new Date('2024-01-14T23:00:00Z');
      const utcLabel = formatDateLabel(date, 'UTC');
      const parisLabel = formatDateLabel(date, 'Europe/Paris');
      
      expect(utcLabel).toBe('Hier');
      expect(parisLabel).toBe("Aujourd'hui");
    });

    it('should handle string input', () => {
      const label = formatDateLabel('2024-01-15T10:00:00Z', 'UTC');
      expect(label).toBe("Aujourd'hui");
    });

    it('should use user timezone by default', () => {
      const today = new Date();
      const label = formatDateLabel(today);
      expect(label).toBe("Aujourd'hui");
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle invalid date strings gracefully', () => {
      const invalidDate = 'not-a-date';
      const date = new Date(invalidDate);
      
      // Should not throw, but return Invalid Date
      expect(() => getDateKeyInTZ(date, 'UTC')).not.toThrow();
    });

    it('should handle unsupported timezones', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      
      // Most implementations will throw or fallback to UTC
      expect(() => {
        try {
          getDateKeyInTZ(date, 'Invalid/Timezone');
        } catch (e) {
          // Expected to throw
          throw e;
        }
      }).toThrow();
    });

    it('should handle dates at DST transitions', () => {
      // March 31, 2024 - DST transition in Europe/Paris
      const dstDate = new Date('2024-03-31T01:00:00Z');
      const dateKey = getDateKeyInTZ(dstDate, 'Europe/Paris');
      expect(dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
