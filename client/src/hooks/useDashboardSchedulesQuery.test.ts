import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDashboardSchedulesQuery } from './useDashboardSchedulesQuery';

const mocks = vi.hoisted(() => ({
  usePaginatedQuery: vi.fn(),
  useQuery: vi.fn(),
  loadMoreUpcoming: vi.fn(),
  loadMorePast: vi.fn(),
}));

vi.mock('@/convex/client', () => ({
  usePaginatedQuery: (...args: unknown[]) => mocks.usePaginatedQuery(...args),
  useQuery: (...args: unknown[]) => mocks.useQuery(...args),
}));

const baseStatusCounts = {
  scheduled: 0,
  'checked-in': 0,
  completed: 0,
};

describe('useDashboardSchedulesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useQuery.mockReturnValue({
      totalSchedules: 2,
      totalAppointments: 1,
      upcomingSchedules: 1,
      pastSchedules: 1,
    });

    mocks.usePaginatedQuery.mockImplementation((_query, args) => {
      if (args === 'skip') {
        return {
          results: [],
          status: 'LoadingFirstPage',
          isLoading: true,
          loadMore: vi.fn(),
        };
      }

      if ((args as { view: string }).view === 'upcoming') {
        return {
          results: [
            {
              id: 'schedule-upcoming',
              open: '2026-03-18T14:00:00.000Z',
              close: '2026-03-18T22:00:00.000Z',
              appointmentCount: 1,
              appointmentStatusCounts: {
                scheduled: 1,
                'checked-in': 0,
                completed: 0,
              },
            },
          ],
          status: 'CanLoadMore',
          isLoading: false,
          loadMore: mocks.loadMoreUpcoming,
        };
      }

      return {
        results: [
          {
            id: 'schedule-past',
            date: '2026-03-10',
            open: '2026-03-10T14:00:00.000Z',
            close: '2026-03-10T22:00:00.000Z',
            appointmentCount: 0,
            appointmentStatusCounts: baseStatusCounts,
          },
        ],
        status: 'Exhausted',
        isLoading: false,
        loadMore: mocks.loadMorePast,
      };
    });
  });

  it('passes trimmed search terms to both paginated schedule queries', () => {
    const { result } = renderHook(() =>
      useDashboardSchedulesQuery('all', ' 02-03 ')
    );

    expect(result.current.upcomingSchedules).toHaveLength(1);
    expect(result.current.pastSchedules).toHaveLength(1);
    expect(result.current.schedules).toHaveLength(2);
    expect(mocks.usePaginatedQuery).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      { view: 'upcoming', search: '02-03' },
      { initialNumItems: 12 }
    );
    expect(mocks.usePaginatedQuery).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      { view: 'past', search: '02-03' },
      { initialNumItems: 12 }
    );
  });

  it('skips the hidden view query', () => {
    renderHook(() => useDashboardSchedulesQuery('upcoming', ''));

    expect(mocks.usePaginatedQuery).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      { view: 'upcoming' },
      { initialNumItems: 12 }
    );
    expect(mocks.usePaginatedQuery).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      'skip',
      { initialNumItems: 12 }
    );
  });
});
