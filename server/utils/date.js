const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // dependent on utc plugin
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const checkAvailability = (schedule, newAppt) => {
  const newStart = dayjs(newAppt.start);
  const newEnd = dayjs(newAppt.end);
  for (let appt of schedule.appointments) {
    const start = dayjs(appt.start);
    const end = dayjs(appt.end);
    if (appt.employee.toString() === newAppt.employee._id.toString()) {
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

const easternDateTime = (inputDate, inputTime) => {
  const dateObj = dayjs.tz(inputDate, 'America/New_York');
  const [hour, minute] = inputTime.split(':');
  return dateObj.hour(Number(hour)).minute(Number(minute));
};

// takes eastern standard date and converts it into utc time ex. 00:00 => 04:00
const easternDate = (inputDate) => {
  return dayjs.tz(inputDate, 'America/New_York');
};

const formatDateSlash = (date) => dayjs(date).format('MM/DD/YYYY');
const formatTime = (time) => dayjs(time, 'HH:mm').format('h:mma');

const generateRange = (dates, open, close) => {
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

module.exports = {
  checkAvailability,
  easternDate,
  easternDateTime,
  formatDateSlash,
  formatTime,
  generateRange,
};
