import { useSelector } from 'react-redux';
import {
  selectAllSchedule,
  selectScheduleById,
  useGetScheduleQuery,
// @ts-expect-error TS(2307): Cannot find module '@/features/scheduleSlice' or i... Remove this comment to see the full error message
} from '@/features/scheduleSlice';

// @ts-expect-error TS(2307): Cannot find module '@/utils/date' or its correspon... Remove this comment to see the full error message
import { splitByUpcomingAndPast } from '@/utils/date';

export function useScheduleQuery(scheduleId: any) {
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
