import { useMemo } from 'react';

import { normalizeAppointments, normalizeSchedule } from '@/utils/date';
import { useQuery } from '@/convex/client';

import { api } from '../../../convex/_generated/api';

export function useScheduleDetailQuery(scheduleId?: string) {
  const scheduleData = useQuery(
    api.schedules.getPrivateScheduleById,
    scheduleId ? { id: scheduleId } : 'skip'
  );

  const schedule = useMemo(
    () => (scheduleData ? normalizeSchedule(scheduleData) : null),
    [scheduleData]
  );

  const appointments = useMemo(
    () => (schedule ? normalizeAppointments(schedule.appointments) : null),
    [schedule]
  );

  return {
    schedule,
    appointments,
    isLoading: Boolean(scheduleId) && scheduleData === undefined,
  };
}
