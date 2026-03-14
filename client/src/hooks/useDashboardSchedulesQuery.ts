import { useMemo } from 'react';

import { usePaginatedQuery, useQuery } from '@/convex/client';

import { api } from '../../../convex/_generated/api';

export type DashboardScheduleView = 'upcoming' | 'past' | 'all';

const INITIAL_PAGE_SIZE = 12;

export function useDashboardSchedulesQuery(
  view: DashboardScheduleView,
  search: string
) {
  const normalizedSearch = search.trim() || undefined;
  const stats = useQuery(api.schedules.getPrivateScheduleStats, {});

  const upcomingQuery = usePaginatedQuery(
    api.schedules.listPrivateSchedules,
    view === 'past'
      ? 'skip'
      : {
          view: 'upcoming',
          ...(normalizedSearch ? { search: normalizedSearch } : {}),
        },
    { initialNumItems: INITIAL_PAGE_SIZE }
  );

  const pastQuery = usePaginatedQuery(
    api.schedules.listPrivateSchedules,
    view === 'upcoming'
      ? 'skip'
      : {
          view: 'past',
          ...(normalizedSearch ? { search: normalizedSearch } : {}),
        },
    { initialNumItems: INITIAL_PAGE_SIZE }
  );

  const schedules = useMemo(() => {
    if (view === 'upcoming') return upcomingQuery.results;
    if (view === 'past') return pastQuery.results;
    return [...upcomingQuery.results, ...pastQuery.results];
  }, [pastQuery.results, upcomingQuery.results, view]);

  return {
    schedules,
    stats,
    upcomingSchedules: upcomingQuery.results,
    pastSchedules: pastQuery.results,
    upcomingStatus: upcomingQuery.status,
    pastStatus: pastQuery.status,
    loadMoreUpcoming: upcomingQuery.loadMore,
    loadMorePast: pastQuery.loadMore,
    isLoading:
      stats === undefined ||
      (view !== 'past' && upcomingQuery.isLoading) ||
      (view !== 'upcoming' && pastQuery.isLoading),
  };
}
