import { useSelector } from 'react-redux';
import {
  selectAllSchedule,
  selectScheduleById,
  useGetScheduleQuery,
} from '@/features/scheduleSlice';

import { splitByUpcomingAndPast } from '@/utils/date';

export function useScheduleQuery(scheduleId?: string) {
  const { data } = useGetScheduleQuery();
  const schedules = useSelector(selectAllSchedule);
  const schedule = useSelector((state: any) =>
    scheduleId ? selectScheduleById(state, scheduleId) : null
  );
  const appointments = schedule && schedule.appointments;
  const [upcomingSchedules, pastSchedules] = splitByUpcomingAndPast(schedules);

  return {
    schedules,
    schedule,
    appointments,
    upcomingSchedules,
    pastSchedules,
  };
}
