import { describe, it, expect } from 'vitest';
import { checkAvailabilityISO } from './dateTime.js';

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
