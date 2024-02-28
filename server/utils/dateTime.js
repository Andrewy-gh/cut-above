import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

import logger from './logger/index.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

const selectedTimeZone = 'America/New_York';

// This function checks for availability of an appointment within a schedule
// isBetween usage: https://day.js.org/docs/en/plugin/is-between
export const checkAvailability = (appointments, newAppt) => {
  const newStart = dayjs(`${newAppt.date}T${newAppt.start}`);
  const newEnd = dayjs(`${newAppt.date}T${newAppt.end}`);
  for (let appt of appointments) {
    const start = dayjs(`${appt.date}T${appt.start}`);
    const end = dayjs(`${appt.date}T${appt.end}`);
    if (appt.employeeId === newAppt.employeeId) {
      if (
        newStart.isBetween(start, end, 'time', '[)') ||
        newEnd.isBetween(start, end, 'time', '(]')
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
export const convertDateAndTime = (inputDate, inputTime) => {
  const dateObj = dayjs.tz(inputDate, selectedTimeZone);
  const [hour, minute] = inputTime.split(':');
  return dateObj.hour(Number(hour)).minute(Number(minute));
};

// takes a IOS date "2023-07-16T14:51:47.557Z" local and converts to correct corresponding UTC time, ex. 00:00 => 04:00
// used to send correct format to database
export const convertDate = (inputDate) => {
  return dayjs.tz(inputDate, selectedTimeZone);
};

// These two functions used to send readable formats in email service
export const formatDateSlash = (date) => dayjs(date).format('MM/DD/YYYY');
export const formatTime = (time) => dayjs(time, 'HH:mm').format('h:mma');

// Generates an array of dayjs obj to be used for scheduling.
export const generateRange = (dates, open, close) => {
  const [start, end] = dates;
  const endDate = dayjs(end).format('YYYY-MM-DD');
  const [openHour, openMinute] = open.split(':');
  const [closeHour, closeMinute] = close.split(':');
  const datesToSchedule = [];
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

export const formatDateAndTimes = (appointment) => {
  return {
    date: convertDate(appointment.date),
    // start: convertDateAndTime(appointment.date, appointment.start),
    // end: convertDateAndTime(appointment.date, appointment.end),
  };
};
