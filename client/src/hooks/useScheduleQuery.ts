import { useAppSelector } from "@/app/hooks";
import {
  selectAllSchedule,
  selectScheduleById,
  useGetScheduleQuery,
} from "@/features/scheduleSlice";

import { normalizeAppointments, splitByUpcomingAndPast } from "@/utils/date";
export function useScheduleQuery(scheduleId?: string) {
  useGetScheduleQuery();
  const schedules = useAppSelector(selectAllSchedule);
  const schedule = useAppSelector((state) =>
    scheduleId ? selectScheduleById(state, scheduleId) : null,
  );
  const appointments = schedule
    ? normalizeAppointments(schedule.appointments)
    : null;
  const [upcomingSchedules, pastSchedules] = splitByUpcomingAndPast(schedules);

  return {
    schedules,
    schedule,
    appointments,
    upcomingSchedules,
    pastSchedules,
  };
}
