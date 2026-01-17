import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

const selectedTimeZone = 'America/New_York';

interface AppointmentCheck {
  date: string;
  start: string;
  end: string;
  employeeId: string;
}

interface ScheduleEntry {
  date: Dayjs;
  open: Dayjs;
  close: Dayjs;
}

// This function checks for availability of an appointment within a schedule
// isBetween usage: https://day.js.org/docs/en/plugin/is-between
export const checkAvailability = (
  appointments: AppointmentCheck[],
  newAppt: AppointmentCheck
): boolean => {
  const newStart = dayjs(`${newAppt.date}T${newAppt.start}`);
  const newEnd = dayjs(`${newAppt.date}T${newAppt.end}`);
  for (let appt of appointments) {
    const start = dayjs(`${appt.date}T${appt.start}`);
    const end = dayjs(`${appt.date}T${appt.end}`);
    if (appt.employeeId === newAppt.employeeId) {
      if (
        newStart.isBetween(start, end, 'minute', '[)') ||
        newEnd.isBetween(start, end, 'minute', '(]')
      ) {
        return false; // overlap found
      }
    }
  }
  // No conflict found
  return true;
};

// takes a local date: '2023-12-24' format and local time: '10:00' and converts it into dayjs obj with correct corresponding UTC time
// used to send correct format to database
export const convertDateAndTime = (inputDate: string, inputTime: string): Dayjs => {
  const dateObj = dayjs.tz(inputDate, selectedTimeZone);
  const [hour, minute] = inputTime.split(':');
  return dateObj.hour(Number(hour)).minute(Number(minute));
};

// takes a IOS date "2023-07-16T14:51:47.557Z" local and converts to correct corresponding UTC time, ex. 00:00 => 04:00
// used to send correct format to database
export const convertDate = (inputDate: string): Dayjs => {
  return dayjs.tz(inputDate, selectedTimeZone);
};

// These two functions used to send readable formats in email service
export const formatDateSlash = (date: string | Date): string =>
  dayjs(date).format('MM/DD/YYYY');

export const formatTime = (time: string): string =>
  dayjs(time, 'HH:mm').format('h:mma');

// Generates an array of dayjs obj to be used for scheduling.
export const generateRange = (
  dates: [string | Date, string | Date],
  open: string,
  close: string
): ScheduleEntry[] => {
  const [start, end] = dates;
  const endDate = dayjs(end).format('YYYY-MM-DD');
  const [openHour, openMinute] = open.split(':');
  const [closeHour, closeMinute] = close.split(':');
  const datesToSchedule: ScheduleEntry[] = [];
  let currentDate = dayjs(start);

  while (currentDate.isSameOrBefore(endDate, 'day')) {
    const currentDay = currentDate.format('YYYY-MM-DD');
    const dateObj = dayjs.tz(currentDay, 'America/New_York');

    datesToSchedule.push({
      date: dateObj,
      open: dateObj.hour(Number(openHour)).minute(Number(openMinute)),
      close: dateObj.hour(Number(closeHour)).minute(Number(closeMinute)),
    });

    currentDate = currentDate.add(1, 'day');
  }

  return datesToSchedule;
};

export const formatDateAndTimes = (appointment: { date: string }): { date: Dayjs } => {
  return {
    date: convertDate(appointment.date),
    // start: convertDateAndTime(appointment.date, appointment.start),
    // end: convertDateAndTime(appointment.date, appointment.end),
  };
};

// ============================================================================
// ISO DateTime Utilities
// ============================================================================

// Parse ISO datetime string to Dayjs object with America/New_York timezone
export const parseISOToLocalTime = (iso: string): Dayjs =>
  dayjs.tz(iso, selectedTimeZone);

// Convert ISO datetime string to JavaScript Date object for DB storage
export const convertISOToDate = (iso: string): Date =>
  parseISOToLocalTime(iso).toDate();

// Extract YYYY-MM-DD date string from ISO datetime for schedule lookups
export const extractDateFromISO = (iso: string): string =>
  parseISOToLocalTime(iso).format('YYYY-MM-DD');

// Check appointment availability using ISO datetime strings
export const checkAvailabilityISO = (
  appointments: { start: string; end: string; employeeId: string }[],
  newAppt: { start: string; end: string; employeeId: string }
): boolean => {
  const newStart = parseISOToLocalTime(newAppt.start);
  const newEnd = parseISOToLocalTime(newAppt.end);

  for (let appt of appointments) {
    const start = parseISOToLocalTime(appt.start);
    const end = parseISOToLocalTime(appt.end);

    if (appt.employeeId === newAppt.employeeId) {
      if (
        newStart.isBetween(start, end, 'minute', '[)') ||
        newEnd.isBetween(start, end, 'minute', '(]')
      ) {
        return false; // overlap found
      }
    }
  }
  return true; // no conflict
};

// Format ISO datetime to MM/DD/YYYY for email display
export const formatDateSlashISO = (isoDatetime: string): string =>
  parseISOToLocalTime(isoDatetime).format('MM/DD/YYYY');

// Format ISO datetime to h:mma (e.g., "2:30pm") for email display
export const formatTimeISO = (isoDatetime: string): string =>
  parseISOToLocalTime(isoDatetime).format('h:mma');
