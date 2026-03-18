import { useEffect, useMemo } from 'react';

import { usePaginatedQuery, useQuery } from '@/convex/client';
import { formatDate, formatDateFull, formatDateSlash } from '@/utils/date';
import type { ScheduleSummary } from '@/types';

import { api } from '../../../convex/_generated/api';

export type DashboardScheduleView = 'upcoming' | 'past' | 'all';

const INITIAL_PAGE_SIZE = 12;

export function normalizeDashboardScheduleSummary(
  schedule: ScheduleSummary
): ScheduleSummary {
  return {
    ...schedule,
    date: schedule.date ?? formatDate(schedule.open),
  };
}

export function matchesDashboardScheduleSearch(
  schedule: ScheduleSummary,
  search: string
) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const normalizedSchedule = normalizeDashboardScheduleSummary(schedule);
  const searchableValues = [
    normalizedSchedule.date,
    formatDateSlash(normalizedSchedule.open),
    formatDateFull(normalizedSchedule.date),
    normalizedSchedule.open,
  ];

  return searchableValues.some((value) =>
    value?.toLowerCase().includes(query)
  );
}

export function useDashboardSchedulesQuery(
  view: DashboardScheduleView,
  search: string
) {
  const normalizedSearch = search.trim();
  const hasSearch = normalizedSearch.length > 0;
  const stats = useQuery(api.schedules.getPrivateScheduleStats, {});

  const upcomingQuery = usePaginatedQuery(
    api.schedules.listPrivateSchedules,
    view === 'past'
      ? 'skip'
      : {
          view: 'upcoming',
        },
    { initialNumItems: INITIAL_PAGE_SIZE }
  );

  const pastQuery = usePaginatedQuery(
    api.schedules.listPrivateSchedules,
    view === 'upcoming'
      ? 'skip'
      : {
          view: 'past',
        },
    { initialNumItems: INITIAL_PAGE_SIZE }
  );

  const { isLoading: isUpcomingLoading, loadMore: loadMoreUpcoming, status: upcomingStatus } =
    upcomingQuery;
  const { isLoading: isPastLoading, loadMore: loadMorePast, status: pastStatus } =
    pastQuery;

  useEffect(() => {
    if (!hasSearch) {
      return;
    }

    if (view !== 'past' && upcomingStatus === 'CanLoadMore') {
      loadMoreUpcoming(INITIAL_PAGE_SIZE);
    }

    if (view !== 'upcoming' && pastStatus === 'CanLoadMore') {
      loadMorePast(INITIAL_PAGE_SIZE);
    }
  }, [hasSearch, loadMorePast, loadMoreUpcoming, pastStatus, upcomingStatus, view]);

  const upcomingSchedules = useMemo(
    () =>
      upcomingQuery.results.map((schedule) =>
        normalizeDashboardScheduleSummary(schedule)
      ),
    [upcomingQuery.results]
  );

  const pastSchedules = useMemo(
    () =>
      pastQuery.results.map((schedule) =>
        normalizeDashboardScheduleSummary(schedule)
      ),
    [pastQuery.results]
  );

  const filteredUpcomingSchedules = useMemo(
    () =>
      upcomingSchedules.filter((schedule) =>
        matchesDashboardScheduleSearch(schedule, normalizedSearch)
      ),
    [normalizedSearch, upcomingSchedules]
  );

  const filteredPastSchedules = useMemo(
    () =>
      pastSchedules.filter((schedule) =>
        matchesDashboardScheduleSearch(schedule, normalizedSearch)
      ),
    [normalizedSearch, pastSchedules]
  );

  const schedules = useMemo(() => {
    if (view === 'upcoming') return filteredUpcomingSchedules;
    if (view === 'past') return filteredPastSchedules;
    return [...filteredUpcomingSchedules, ...filteredPastSchedules];
  }, [filteredPastSchedules, filteredUpcomingSchedules, view]);

  const isSearchLoading =
    hasSearch &&
    ((view !== 'past' && upcomingStatus !== 'Exhausted') ||
      (view !== 'upcoming' && pastStatus !== 'Exhausted'));

  return {
    schedules,
    stats,
    upcomingSchedules: filteredUpcomingSchedules,
    pastSchedules: filteredPastSchedules,
    upcomingStatus,
    pastStatus,
    loadMoreUpcoming,
    loadMorePast,
    isSearchLoading,
    isLoading:
      stats === undefined ||
      (view !== 'past' && isUpcomingLoading) ||
      (view !== 'upcoming' && isPastLoading),
  };
}
