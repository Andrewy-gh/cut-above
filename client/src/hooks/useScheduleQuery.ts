import { useSelector } from "react-redux";
import {
  selectAllSchedule,
  selectScheduleById,
  useGetScheduleQuery,
} from "@/features/scheduleSlice";

import { normalizeAppointments, splitByUpcomingAndPast } from "@/utils/date";
import type { RootState } from "@/app/store";

export function useScheduleQuery(scheduleId?: string) {
  useGetScheduleQuery();
  const schedules = useSelector(selectAllSchedule);
  const schedule = useSelector((state: RootState) =>
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
