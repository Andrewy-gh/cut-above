import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { bookingSchema } from './appointmentSchema.js';

describe('bookingSchema - ISO datetime validation', () => {
  const validBooking = {
    start: '2024-01-22T17:00:00.000Z',
    end: '2024-01-22T17:30:00.000Z',
    employee: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
    },
    service: 'Haircut' as const,
  };

  describe('accepts valid UTC ISO strings', () => {
    it('accepts ISO with milliseconds and Z suffix', () => {
      const result = v.safeParse(bookingSchema, validBooking);
      expect(result.success).toBe(true);
    });

    it('accepts ISO without milliseconds but with Z suffix', () => {
      const booking = {
        ...validBooking,
        start: '2024-01-22T17:00:00Z',
        end: '2024-01-22T17:30:00Z',
      };
      const result = v.safeParse(bookingSchema, booking);
      expect(result.success).toBe(true);
    });
  });

  describe('rejects non-UTC ISO strings', () => {
    it('rejects ISO with EST offset', () => {
      const booking = {
        ...validBooking,
        start: '2024-01-22T12:00:00-05:00',
        end: '2024-01-22T12:30:00-05:00',
      };
      const result = v.safeParse(bookingSchema, booking);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('Z suffix required');
      }
    });

    it('rejects ISO with positive timezone offset', () => {
      const booking = {
        ...validBooking,
        start: '2024-01-22T12:00:00+02:00',
        end: '2024-01-22T12:30:00+02:00',
      };
      const result = v.safeParse(bookingSchema, booking);
      expect(result.success).toBe(false);
    });

    it('rejects ISO without timezone indicator', () => {
      const booking = {
        ...validBooking,
        start: '2024-01-22T17:00:00',
        end: '2024-01-22T17:30:00',
      };
      const result = v.safeParse(bookingSchema, booking);
      expect(result.success).toBe(false);
      if (!result.success) {
        // isoTimestamp() validates first, rejects missing timezone
        expect(result.issues[0].message).toBeDefined();
      }
    });

    it('rejects date-only format', () => {
      const booking = {
        ...validBooking,
        start: '2024-01-22',
        end: '2024-01-22',
      };
      const result = v.safeParse(bookingSchema, booking);
      expect(result.success).toBe(false);
      if (!result.success) {
        // isoTimestamp() validates first, rejects invalid format
        expect(result.issues[0].message).toBeDefined();
      }
    });
  });

  describe('validates end after start', () => {
    it('rejects when end is before start', () => {
      const booking = {
        ...validBooking,
        start: '2024-01-22T17:30:00.000Z',
        end: '2024-01-22T17:00:00.000Z', // Before start
      };
      const result = v.safeParse(bookingSchema, booking);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('after start');
      }
    });

    it('rejects when end equals start', () => {
      const booking = {
        ...validBooking,
        start: '2024-01-22T17:00:00.000Z',
        end: '2024-01-22T17:00:00.000Z', // Same as start
      };
      const result = v.safeParse(bookingSchema, booking);
      expect(result.success).toBe(false);
    });
  });
});
