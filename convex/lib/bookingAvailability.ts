import dayjs, { type Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { Doc } from "../_generated/dataModel";
import {
  isSlotWithinAvailability,
  type AvailabilityWindow,
  type BreakWindow,
} from "./availability";
import { parseISOToLocalTime } from "./dateTime";

dayjs.extend(utc);
dayjs.extend(timezone);

const selectedTimeZone = "America/New_York";
const searchIncrementMinutes = 15;

export type BookingAvailabilitySlot = {
  id: string;
  start: string;
  end: string;
  available: string[];
};

type AppointmentInput = Pick<Doc<"appointments">, "start" | "end" | "employeeId">;
type ScheduleInput = Pick<Doc<"schedules">, "open" | "close">;

const roundCurrentTimeForBooking = (now: Dayjs) => {
  const roundedMinutes = Math.round(now.minute() / 30) * 30;
  return now
    .minute(roundedMinutes)
    .second(0)
    .millisecond(0)
    .add(1, "hour");
};

export const buildBookingAvailabilitySlots = (args: {
  schedule: ScheduleInput;
  durationMinutes: number;
  employeeIds: string[];
  selectedEmployeeId?: string;
  employeeAvailability: AvailabilityWindow[];
  employeeBreaks: BreakWindow[];
  appointments: AppointmentInput[];
  now?: Dayjs;
}) => {
  const {
    schedule,
    durationMinutes,
    employeeIds,
    selectedEmployeeId,
    employeeAvailability,
    employeeBreaks,
    appointments,
  } = args;
  const now = args.now ?? dayjs();
  const scheduleDate = parseISOToLocalTime(schedule.open).format("YYYY-MM-DD");
  const currentDate = now.tz(selectedTimeZone).format("YYYY-MM-DD");
  const slotEnd = dayjs(schedule.close);
  let slotStart =
    scheduleDate === currentDate
      ? roundCurrentTimeForBooking(now.tz(selectedTimeZone))
      : dayjs(schedule.open);

  const availabilityByEmployeeId = new Map(
    employeeAvailability.map((window) => [window.employeeId, window])
  );
  const breaksByEmployeeId = employeeBreaks.reduce<Map<string, BreakWindow[]>>(
    (acc, entry) => {
      const current = acc.get(entry.employeeId) ?? [];
      current.push(entry);
      acc.set(entry.employeeId, current);
      return acc;
    },
    new Map()
  );
  const appointmentsByEmployeeId = appointments.reduce<Map<string, AppointmentInput[]>>(
    (acc, appointment) => {
      const current = acc.get(appointment.employeeId) ?? [];
      current.push(appointment);
      acc.set(appointment.employeeId, current);
      return acc;
    },
    new Map()
  );

  const slots: BookingAvailabilitySlot[] = [];
  const candidateEmployeeIds = selectedEmployeeId
    ? [selectedEmployeeId]
    : employeeIds;

  while (slotStart.isBefore(slotEnd)) {
    const currentSlotEnd = slotStart.add(durationMinutes, "minute");
    if (currentSlotEnd.isAfter(slotEnd)) {
      break;
    }

    const candidate = {
      start: slotStart.toISOString(),
      end: currentSlotEnd.toISOString(),
    };
    const available = candidateEmployeeIds.filter((employeeId) => {
      const availabilityWindow = availabilityByEmployeeId.get(employeeId) ?? null;
      const breakWindows = breaksByEmployeeId.get(employeeId) ?? [];
      if (!isSlotWithinAvailability(availabilityWindow, candidate, breakWindows)) {
        return false;
      }

      return !(appointmentsByEmployeeId.get(employeeId) ?? []).some(
        (appointment) =>
          dayjs(appointment.start).isBefore(currentSlotEnd) &&
          dayjs(appointment.end).isAfter(slotStart)
      );
    });

    if (available.length > 0) {
      slots.push({
        id: candidate.start,
        start: candidate.start,
        end: candidate.end,
        available,
      });
    }

    slotStart = slotStart.add(searchIncrementMinutes, "minute");
  }

  return slots;
};
