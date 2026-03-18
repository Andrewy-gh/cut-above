import { useMemo } from 'react';

import { useAppSelector } from '@/app/hooks';
import { useQuery } from '@/convex/client';
import { selectEmployeeIds } from '@/features/employeeSlice';
import { findAvailableTimeSlots, normalizeSchedule } from '@/utils/date';

import { api } from '../../../convex/_generated/api';

export function useBookingScheduleQuery(
  date: string,
  duration: number,
  employeeId?: string
) {
  const employeeIds = useAppSelector(selectEmployeeIds);
  const scheduleData = useQuery(
    api.schedules.getPublicScheduleByDate,
    date ? { date } : 'skip'
  );

  const schedule = useMemo(
    () => (scheduleData ? normalizeSchedule(scheduleData) : null),
    [scheduleData]
  );

  const timeSlots = useMemo(() => {
    if (!schedule) {
      return [];
    }

    return findAvailableTimeSlots(
      schedule,
      duration,
      employeeIds,
      employeeId ? { id: employeeId } : undefined
    );
  }, [duration, employeeId, employeeIds, schedule]);

  return {
    schedule,
    timeSlots,
    isLoading: Boolean(date) && scheduleData === undefined,
  };
}
