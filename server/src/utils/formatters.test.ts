import { describe, it, expect } from 'vitest';

describe('formatEmail', () => {
  it('formats date, time, employee, and link from ISO start', async () => {
    const { formatEmail } = await import('./formatters.js');

    const result = formatEmail({
      start: '2024-01-22T17:00:00.000Z',
      end: '2024-01-22T17:30:00.000Z',
      service: 'Haircut',
      employee: { id: 'employee-1', firstName: 'John' },
      id: 'appt-123',
      option: 'confirmation',
    });

    expect(result).toEqual({
      date: '01/22/2024',
      time: '12:00pm',
      employee: 'John',
      option: 'confirmation',
      emailLink: 'http://localhost:3000/appointment/appt-123',
    });
  });
});
