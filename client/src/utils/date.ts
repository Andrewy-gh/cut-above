import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Schedule, User } from '@/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale('en');

type DateInput = string | Date | Dayjs;

export const BUSINESS_TIME_ZONE = 'America/New_York';

const isIsoDateTimeString = (value: string) => value.includes('T');

const toBusinessDateTime = (value: DateInput) => {
  if (dayjs.isDayjs(value)) {
    return value.tz(BUSINESS_TIME_ZONE, true);
  }

  if (value instanceof Date) {
    return dayjs(value).tz(BUSINESS_TIME_ZONE);
  }

  if (isIsoDateTimeString(value)) {
    return dayjs.utc(value).tz(BUSINESS_TIME_ZONE);
  }

  return dayjs.tz(value, BUSINESS_TIME_ZONE);
};

export const getCurrentDateTime = () => dayjs().tz(BUSINESS_TIME_ZONE);

export const getInitialCurrentDate = () => getCurrentDateTime().format('YYYY-MM-DD');

export const getOneMonthFromCurrent = () => getCurrentDateTime().add(1, 'month');

export const checkIsBefore = (startDate: DateInput, endDate: DateInput) => {
  return toBusinessDateTime(startDate).isBefore(toBusinessDateTime(endDate));
};

export const convertUtcToEst = (utcString: DateInput) => {
  const estDate = toBusinessDateTime(utcString);
  const estString = estDate.format();
  return estString;
};

// server format
export const formatDate = (date: DateInput) =>
  toBusinessDateTime(date).format('YYYY-MM-DD');

// client side format
export const formatDateSlash = (date: DateInput) =>
  toBusinessDateTime(date).format('MM/DD/YYYY');

// client side format ex: Monday August 21, 2023
export const formatDateFull = (date: DateInput) =>
  toBusinessDateTime(date).format('dddd LL');

// ex: 10:00am 6:00pm used in component render
export const formatDateToTime = (date: DateInput) =>
  toBusinessDateTime(date).format('h:mma');

export const formatTime = (time: DateInput) =>
  toBusinessDateTime(time).format('h:mma');

type AppointmentLike = {
  start: string;
  date?: string;
};

export const normalizeAppointment = <T extends AppointmentLike>(appointment: T): T => {
  const start = appointment.start;
  const hasIsoStart = typeof start === 'string' && start.includes('T');
  return {
    ...appointment,
    date: appointment.date ?? (hasIsoStart ? formatDateSlash(start) : appointment.date),
    start: hasIsoStart ? formatDateToTime(start) : start,
  } as T;
};

export const normalizeAppointments = <T extends AppointmentLike>(appointments: T[]): T[] =>
  appointments.map(normalizeAppointment);

export const normalizeSchedule = (schedule: Schedule): Schedule => ({
  ...schedule,
  date: schedule.date ?? formatDate(schedule.open),
});

export const normalizeSchedules = (schedules: Schedule[]): Schedule[] =>
  schedules.map(normalizeSchedule);

interface ScheduleAppointment {
  employeeId?: string;
  employee?: User | string;
  start: string;
  end?: string;
}

interface ScheduleInput {
  open: string;
  close: string;
  employeeAvailability?: {
    employeeId: string;
    start: string;
    end: string;
  }[];
  employeeBreaks?: {
    id: string;
    employeeId: string;
    start: string;
    end: string;
  }[];
  appointments: ScheduleAppointment[];
}

interface SelectedEmployee {
  id: string;
}

export const findAvailableTimeSlots = (
  schedule: ScheduleInput,
  duration: number,
  employees: (string | number)[],
  employee: SelectedEmployee | undefined
) => {
  const { open, close, appointments } = schedule;
  const searchIncrement = 15;
  const slots = [];
  const scheduleOpen = toBusinessDateTime(open);
  const scheduleClose = toBusinessDateTime(close);
  const formattedCurrentDate = getInitialCurrentDate();
  const scheduleDate = formatDate(scheduleOpen);
  const nextBookableTime = roundedCurrentDate();
  let slotStart = scheduleOpen;

  if (scheduleDate === formattedCurrentDate && nextBookableTime.isAfter(scheduleOpen)) {
    slotStart = nextBookableTime;
  }

  const slotEnd = scheduleClose;

  while (slotStart.isBefore(slotEnd)) {
    const currentSlotEnd = slotStart.add(duration, 'minute');
    if (currentSlotEnd.isAfter(slotEnd)) {
      break;
    }

    const selectedEmployees = employee ? [employee.id] : employees;
    const employeeAvailability = new Map(
      (schedule.employeeAvailability ?? []).map((window) => [window.employeeId, window])
    );
    const employeeBreaks = (schedule.employeeBreaks ?? []).reduce<
      Map<string, { id: string; start: string; end: string }[]>
    >((acc, entry) => {
      const current = acc.get(entry.employeeId) ?? [];
      current.push(entry);
      acc.set(entry.employeeId, current);
      return acc;
    }, new Map());
    const hasAvailabilityWindows = employeeAvailability.size > 0;
    const availableEmployees = selectedEmployees.filter((employeeId) => {
      const normalizedEmployeeId = String(employeeId);
      const availabilityWindow = employeeAvailability.get(normalizedEmployeeId);
      const isWithinAvailability = hasAvailabilityWindows
        ? Boolean(
            availabilityWindow &&
              !toBusinessDateTime(availabilityWindow.start).isAfter(slotStart) &&
              !toBusinessDateTime(availabilityWindow.end).isBefore(currentSlotEnd)
          )
        : true;
      if (!isWithinAvailability) {
        return false;
      }

      const hasBreakConflict = (employeeBreaks.get(normalizedEmployeeId) ?? []).some(
        (entry) =>
          toBusinessDateTime(entry.start).isBefore(currentSlotEnd) &&
          toBusinessDateTime(entry.end).isAfter(slotStart)
      );
      if (hasBreakConflict) {
        return false;
      }

      const employeeAppointments = appointments.filter((appointment) => {
        const apptEmpId =
          appointment.employeeId ||
          (appointment.employee && typeof appointment.employee === 'object'
            ? appointment.employee.id
            : appointment.employee);
        return apptEmpId === normalizedEmployeeId;
      });
      const employeeBooked = employeeAppointments.some(
        (appointment) =>
          toBusinessDateTime(appointment.start).isBefore(currentSlotEnd) &&
          (appointment.end
            ? toBusinessDateTime(appointment.end).isAfter(slotStart)
            : false)
      );
      return !employeeBooked;
    });
    if (availableEmployees.length > 0) {
      slots.push({
        id: crypto.randomUUID(),
        start: slotStart,
        end: currentSlotEnd,
        available: availableEmployees,
      });
    }

    slotStart = slotStart.add(searchIncrement, 'minute');
  }
  return slots;
};

export const roundedCurrentDate = (currentDate = getCurrentDateTime()) => {
  // Round minutes
  const roundedMinutes = Math.round(currentDate.minute() / 30) * 30;

  // Set rounded minutes, and zero out seconds and milliseconds
  const rounded = currentDate.minute(roundedMinutes).second(0).millisecond(0);
  const roundedPlusHour = rounded.add(1, 'hour');
  return roundedPlusHour;
};

interface DateItem {
  date?: string;
  start?: string;
  open?: string;
}

// splits schedules or appointments by upcoming and past
export const splitByUpcomingAndPast = <T extends DateItem>(dateObj: T[]): [T[], T[]] => {
  const upcoming: T[] = [];
  const past: T[] = [];
  const presentDate = getCurrentDateTime();
  if (dateObj.length > 0) {
    dateObj.forEach((dateItem) => {
      const itemDate = dateItem.date ?? dateItem.start ?? dateItem.open;
      if (!itemDate) {
        return;
      }
      const currItemDate = toBusinessDateTime(itemDate);
      if (currItemDate.isBefore(presentDate)) {
        past.push(dateItem);
      } else {
        upcoming.push(dateItem);
      }
    });
  }
  return [upcoming, past];
};

export const sortAndFormatApptByStartTime = <T extends AppointmentLike>(apptObj: T[] | null | undefined) => {
  if (apptObj) {
    return [...apptObj]
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .map((appt) => normalizeAppointment(appt));
  } else {
    return [];
  }
};
