import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectAllSchedule,
  selectScheduleById,
  setSchedules,
} from "@/features/scheduleSlice";

import {
  normalizeAppointments,
  normalizeSchedule,
  splitByUpcomingAndPast,
} from "@/utils/date";
import { useQuery } from "@/convex/client";
import { api } from "../../../convex/_generated/api";
export function useScheduleQuery(scheduleId?: string) {
  const dispatch = useAppDispatch();
  const schedulesData = useQuery(api.schedules.getPublicSchedules, {});

  const normalizedSchedules = useMemo(() => {
    if (!schedulesData) return [];
    return [...schedulesData]
      .sort((a, b) => a.open.localeCompare(b.open))
      .map((schedule) => normalizeSchedule(schedule));
  }, [schedulesData]);

  useEffect(() => {
    if (schedulesData) {
      dispatch(setSchedules(normalizedSchedules));
    }
  }, [dispatch, schedulesData, normalizedSchedules]);

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
    isLoading: schedulesData === undefined,
  };
}
