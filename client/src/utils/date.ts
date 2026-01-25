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

export const currentDate = dayjs();

export const initialCurrentDate = dayjs().format('YYYY-MM-DD');

export const oneMonthFromCurrent = dayjs().add(1, 'month');

export const checkIsBefore = (startDate: DateInput, endDate: DateInput) => {
  return dayjs(startDate).isBefore(dayjs(endDate));
};

export const convertUtcToEst = (utcString: DateInput) => {
  const utcDate = dayjs.utc(utcString);
  const estDate = utcDate.tz('America/New_York');
  const estString = estDate.format();
  return estString;
};

// server format
export const formatDate = (date: DateInput) => dayjs(date).format('YYYY-MM-DD');

// client side format
export const formatDateSlash = (date: DateInput) => dayjs(date).format('MM/DD/YYYY');

// client side format ex: Monday August 21, 2023
export const formatDateFull = (date: DateInput) => dayjs(date).format('dddd LL');

// ex: 10:00am 6:00pm used in component render
export const formatDateToTime = (date: DateInput) => dayjs(date).format('h:mma');

export const formatTime = (time: DateInput) => dayjs(time).format('h:mma');

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
  const currentEstTime = convertUtcToEst(currentDate);
  const formattedCurrentDate = formatDate(currentEstTime);
  const scheduleDate = formatDate(open); // Extract date from open timestamp
  let slotStart =
    scheduleDate === formattedCurrentDate
      ? roundedCurrentDate()
      : dayjs(open);
  const slotEnd = dayjs(close);

  while (slotStart.isBefore(slotEnd)) {
    const currentSlotEnd = slotStart.add(duration, 'minute');
    if (currentSlotEnd.isAfter(slotEnd)) {
      break;
    }

    const selectedEmployees = employee ? [employee.id] : employees;
    const availableEmployees = selectedEmployees.filter((employeeId) => {
      const employeeAppointments = appointments.filter((appointment) => {
        const apptEmpId = appointment.employeeId ||
          (appointment.employee && typeof appointment.employee === 'object' ? appointment.employee.id : appointment.employee);
        return apptEmpId === employeeId;
      });
      const employeeBooked = employeeAppointments.some(
        (appointment) => dayjs(appointment.start).isBefore(currentSlotEnd) &&
        (appointment.end ? dayjs(appointment.end).isAfter(slotStart) : false)
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

export const roundedCurrentDate = () => {
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
  const presentDate = new Date();
  if (dateObj.length > 0) {
    dateObj.forEach((dateItem) => {
      const itemDate = dateItem.date ?? dateItem.start ?? dateItem.open;
      if (!itemDate) {
        return;
      }
      const currItemDate = new Date(itemDate);
      if (currItemDate < presentDate) {
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
