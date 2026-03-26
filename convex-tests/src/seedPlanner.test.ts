import { describe, expect, it } from 'vitest';

import {
  getClientBookingKey,
  pickClientForSeedSlot,
  pickSeedSlot,
  type MinuteRange,
} from '../../scripts/seed-planner';

describe('seed planner', () => {
  it('skips overlapping and too-early employee slots', () => {
    const slot = pickSeedSlot(
      [
        {
          start: '2026-03-26T13:00:00.000Z',
          end: '2026-03-26T13:30:00.000Z',
        },
        {
          start: '2026-03-26T13:30:00.000Z',
          end: '2026-03-26T14:00:00.000Z',
        },
        {
          start: '2026-03-26T14:15:00.000Z',
          end: '2026-03-26T14:45:00.000Z',
        },
      ],
      [{ startMinute: 570, endMinute: 600 }],
      585,
      () => 0
    );

    expect(slot?.slot.start).toBe('2026-03-26T14:15:00.000Z');
    expect(slot?.range).toEqual({ startMinute: 615, endMinute: 645 });
  });

  it('prefers clients without another booking on the same day', () => {
    const userMap = new Map([
      ['mike@example.com', 'client-1'],
      ['john@example.com', 'client-2'],
    ]);
    const clientBookingsByDay = new Map<string, MinuteRange[]>();
    clientBookingsByDay.set(getClientBookingKey('2026-03-26', 'client-1'), [
      { startMinute: 600, endMinute: 630 },
    ]);

    const selected = pickClientForSeedSlot({
      clients: [{ email: 'mike@example.com' }, { email: 'john@example.com' }],
      userMap,
      date: '2026-03-26',
      candidateRange: { startMinute: 660, endMinute: 690 },
      clientBookingsByDay,
      rand: () => 0,
    });

    expect(selected).toMatchObject({
      client: { email: 'john@example.com' },
      clientId: 'client-2',
    });
  });
});
