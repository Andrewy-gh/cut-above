import { describe, it, expect } from 'vitest';
import { checkAvailabilityISO, parseISOToLocalTime } from './dateTime.js';

describe('parseISOToLocalTime - Timezone Handling', () => {
  describe('UTC input', () => {
    it('converts UTC to America/New_York correctly', () => {
      // 17:00 UTC = 12:00 EST (UTC-5) in January
      const result = parseISOToLocalTime('2024-01-22T17:00:00.000Z');
      expect(result.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-22 12:00:00');
      expect(result.utcOffset()).toBe(-300); // EST is UTC-5 (-300 minutes)
    });

    it('handles EDT correctly in summer', () => {
      // 17:00 UTC = 13:00 EDT (UTC-4) in July
      const result = parseISOToLocalTime('2024-07-22T17:00:00.000Z');
      expect(result.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-07-22 13:00:00');
      expect(result.utcOffset()).toBe(-240); // EDT is UTC-4 (-240 minutes)
    });
  });

  describe('explicit timezone offset input (defensive handling)', () => {
    it('handles EST offset correctly without double conversion', () => {
      // Input: 12:00 with -05:00 offset (explicit EST)
      // This represents the same instant as 17:00 UTC
      const withOffset = parseISOToLocalTime('2024-01-22T12:00:00-05:00');
      const withUTC = parseISOToLocalTime('2024-01-22T17:00:00.000Z');

      // Both should represent the same instant in time
      expect(withOffset.valueOf()).toBe(withUTC.valueOf());

      // Both should display as 12:00 EST when formatted in America/New_York
      expect(withOffset.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-22 12:00:00');
      expect(withUTC.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-22 12:00:00');
    });

    it('handles EDT offset correctly without double conversion', () => {
      // Input: 13:00 with -04:00 offset (explicit EDT) in July
      const withOffset = parseISOToLocalTime('2024-07-22T13:00:00-04:00');
      const withUTC = parseISOToLocalTime('2024-07-22T17:00:00.000Z');

      expect(withOffset.valueOf()).toBe(withUTC.valueOf());
      expect(withOffset.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-07-22 13:00:00');
    });

    it('handles PST offset and converts to EST', () => {
      // Input: 9:00 PST (UTC-8) = 12:00 EST (UTC-5)
      const pstTime = parseISOToLocalTime('2024-01-22T09:00:00-08:00');
      expect(pstTime.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-22 12:00:00');
      expect(pstTime.utcOffset()).toBe(-300); // Result is in EST (UTC-5)
    });

    // NOTE: Schema now rejects non-UTC input, but parseISOToLocalTime handles it defensively
  });
});

describe('checkAvailabilityISO', () => {
  describe('back-to-back appointments', () => {
    it('allows appointment starting exactly when previous ends', () => {
      const appointments = [
        {
          start: '2024-01-22T14:00:00.000Z',
          end: '2024-01-22T14:30:00.000Z',
          employeeId: 'emp-123',
        },
      ];

      const newAppt = {
        start: '2024-01-22T14:30:00.000Z', // Exactly when previous ends
        end: '2024-01-22T15:00:00.000Z',
        employeeId: 'emp-123',
      };

      const result = checkAvailabilityISO(appointments, newAppt);
      expect(result).toBe(true); // Should allow
    });

    it('allows appointment ending exactly when next starts', () => {
      const appointments = [
        {
          start: '2024-01-22T15:00:00.000Z',
          end: '2024-01-22T15:30:00.000Z',
          employeeId: 'emp-123',
        },
      ];

      const newAppt = {
        start: '2024-01-22T14:30:00.000Z',
        end: '2024-01-22T15:00:00.000Z', // Exactly when next starts
        employeeId: 'emp-123',
      };

      const result = checkAvailabilityISO(appointments, newAppt);
      expect(result).toBe(true); // Should allow
    });
  });

  describe('overlap detection', () => {
    it('detects overlap when new appointment starts during existing', () => {
      const appointments = [
        {
          start: '2024-01-22T14:00:00.000Z',
          end: '2024-01-22T14:30:00.000Z',
          employeeId: 'emp-123',
        },
      ];

      const newAppt = {
        start: '2024-01-22T14:15:00.000Z', // Starts during existing
        end: '2024-01-22T14:45:00.000Z',
        employeeId: 'emp-123',
      };

      const result = checkAvailabilityISO(appointments, newAppt);
      expect(result).toBe(false); // Should detect overlap
    });

    it('detects overlap when new appointment ends during existing', () => {
      const appointments = [
        {
          start: '2024-01-22T14:00:00.000Z',
          end: '2024-01-22T14:30:00.000Z',
          employeeId: 'emp-123',
        },
      ];

      const newAppt = {
        start: '2024-01-22T13:45:00.000Z',
        end: '2024-01-22T14:15:00.000Z', // Ends during existing
        employeeId: 'emp-123',
      };

      const result = checkAvailabilityISO(appointments, newAppt);
      expect(result).toBe(false); // Should detect overlap
    });

    it('detects overlap when new appointment completely contains existing', () => {
      const appointments = [
        {
          start: '2024-01-22T14:15:00.000Z',
          end: '2024-01-22T14:30:00.000Z',
          employeeId: 'emp-123',
        },
      ];

      const newAppt = {
        start: '2024-01-22T14:00:00.000Z', // Starts before
        end: '2024-01-22T15:00:00.000Z', // Ends after
        employeeId: 'emp-123',
      };

      const result = checkAvailabilityISO(appointments, newAppt);
      expect(result).toBe(false); // Should detect overlap (CRITICAL TEST)
    });

    it('detects overlap when existing appointment completely contains new', () => {
      const appointments = [
        {
          start: '2024-01-22T14:00:00.000Z',
          end: '2024-01-22T15:00:00.000Z',
          employeeId: 'emp-123',
        },
      ];

      const newAppt = {
        start: '2024-01-22T14:15:00.000Z', // Starts after
        end: '2024-01-22T14:30:00.000Z', // Ends before
        employeeId: 'emp-123',
      };

      const result = checkAvailabilityISO(appointments, newAppt);
      expect(result).toBe(false); // Should detect overlap
    });
  });

  describe('different employees', () => {
    it('allows overlapping times for different employees', () => {
      const appointments = [
        {
          start: '2024-01-22T14:00:00.000Z',
          end: '2024-01-22T14:30:00.000Z',
          employeeId: 'emp-123',
        },
      ];

      const newAppt = {
        start: '2024-01-22T14:00:00.000Z', // Exact same time
        end: '2024-01-22T14:30:00.000Z',
        employeeId: 'emp-456', // Different employee
      };

      const result = checkAvailabilityISO(appointments, newAppt);
      expect(result).toBe(true); // Should allow
    });
  });
});
