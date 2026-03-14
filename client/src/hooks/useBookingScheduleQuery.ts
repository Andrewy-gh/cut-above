import { useEffect, useMemo } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { clearSchedules, setSchedules } from '@/features/scheduleSlice';
import { normalizeSchedule } from '@/utils/date';
import { useQuery } from '@/convex/client';

import { api } from '../../../convex/_generated/api';

export function useBookingScheduleQuery(date: string) {
  const dispatch = useAppDispatch();
  const scheduleData = useQuery(
    api.schedules.getPublicScheduleByDate,
    date ? { date } : 'skip'
  );

  const normalizedSchedules = useMemo(
    () => (scheduleData ? [normalizeSchedule(scheduleData)] : []),
    [scheduleData]
  );

  useEffect(() => {
    if (!date) {
      dispatch(clearSchedules());
      return;
    }

    if (scheduleData === undefined) {
      return;
    }

    dispatch(setSchedules(normalizedSchedules));
  }, [date, dispatch, normalizedSchedules, scheduleData]);

  return {
    schedule: normalizedSchedules[0] ?? null,
    isLoading: Boolean(date) && scheduleData === undefined,
  };
}
