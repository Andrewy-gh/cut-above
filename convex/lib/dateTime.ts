import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const selectedTimeZone = "America/New_York";

export const parseISOToLocalTime = (iso: string) =>
  dayjs.utc(iso).tz(selectedTimeZone);

export const extractDateFromISO = (iso: string) =>
  parseISOToLocalTime(iso).format("YYYY-MM-DD");

export const generateRange = (
  dates: [string, string],
  open: string,
  close: string
) => {
  const [start, end] = dates;
  const endDate = dayjs(end).format("YYYY-MM-DD");
  const [openHour, openMinute] = open.split(":");
  const [closeHour, closeMinute] = close.split(":");
  const datesToSchedule: { date: string; open: string; close: string }[] = [];
  let currentDate = dayjs(start);

  while (currentDate.isSameOrBefore(endDate, "day")) {
    const currentDay = currentDate.format("YYYY-MM-DD");
    const dateObj = dayjs.tz(currentDay, selectedTimeZone);
    const openTime = dateObj
      .hour(Number(openHour))
      .minute(Number(openMinute))
      .second(0)
      .millisecond(0);
    const closeTime = dateObj
      .hour(Number(closeHour))
      .minute(Number(closeMinute))
      .second(0)
      .millisecond(0);

    datesToSchedule.push({
      date: currentDay,
      open: openTime.toISOString(),
      close: closeTime.toISOString(),
    });

    currentDate = currentDate.add(1, "day");
  }

  return datesToSchedule;
};

export const checkAvailabilityISO = (
  appointments: { start: string; end: string; employeeId: string }[],
  newAppt: { start: string; end: string; employeeId: string }
) => {
  const newStart = parseISOToLocalTime(newAppt.start);
  const newEnd = parseISOToLocalTime(newAppt.end);

  for (const appt of appointments) {
    if (appt.employeeId !== newAppt.employeeId) continue;
    const start = parseISOToLocalTime(appt.start);
    const end = parseISOToLocalTime(appt.end);

    if (newStart.isBefore(end, "minute") && newEnd.isAfter(start, "minute")) {
      return false;
    }
  }
  return true;
};

export const formatDateSlashISO = (isoDatetime: string) =>
  parseISOToLocalTime(isoDatetime).format("MM/DD/YYYY");

export const formatTimeISO = (isoDatetime: string) =>
  parseISOToLocalTime(isoDatetime).format("h:mma");
