import { useSelector } from 'react-redux';
import {
  selectAllSchedule,
  selectScheduleById,
  useGetScheduleQuery,
} from '@/features/scheduleSlice';
import { splitByUpcomingAndPast } from '@/utils/date';

export function useScheduleQuery(scheduleId) {
  const { data } = useGetScheduleQuery();
  const schedules = useSelector(selectAllSchedule);
  const schedule = useSelector((state) =>
    selectScheduleById(state, scheduleId)
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
