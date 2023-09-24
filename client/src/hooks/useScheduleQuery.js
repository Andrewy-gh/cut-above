import { useSelector } from 'react-redux';
import {
  selectAllSchedule,
  selectScheduleById,
  useGetScheduleQuery,
} from '../features/scheduleSlice';

export function useScheduleQuery(scheduleId) {
  const { data } = useGetScheduleQuery();
  const schedules = useSelector(selectAllSchedule);
  const schedule = useSelector((state) =>
    selectScheduleById(state, scheduleId)
  );
  const appointments = schedule && schedule.appointments;

  return {
    schedules,
    schedule,
    appointments,
  };
}
