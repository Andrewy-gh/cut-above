import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBookingAvailabilityQuery } from './useBookingAvailabilityQuery';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock('@/convex/client', () => ({
  useQuery: (...args: unknown[]) => mocks.useQuery(...args),
}));

describe('useBookingAvailabilityQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user-facing booking slots in business time', () => {
    mocks.useQuery.mockReturnValue({
      schedule: {
        id: 'schedule-1',
        date: '2099-03-18',
        open: '2099-03-18T14:00:00.000Z',
        close: '2099-03-18T16:00:00.000Z',
      },
      slots: [
        {
          id: 'slot-1',
          start: '2099-03-18T14:30:00.000Z',
          end: '2099-03-18T15:00:00.000Z',
          available: ['employee-1'],
        },
      ],
    });

    const { result } = renderHook(() =>
      useBookingAvailabilityQuery('2099-03-18', 30, 'employee-1')
    );

    expect(result.current.schedule?.date).toBe('2099-03-18');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.timeSlots).toHaveLength(1);
    expect(result.current.timeSlots[0].start.format('h:mma')).toBe('10:30am');
    expect(result.current.timeSlots[0].end.format('h:mma')).toBe('11:00am');
    expect(result.current.timeSlots[0].available).toEqual(['employee-1']);
  });
});
