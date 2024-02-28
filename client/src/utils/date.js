import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale('en');

export const currentDate = dayjs();

export const initialCurrentDate = dayjs().format('YYYY-MM-DD');

export const oneMonthFromCurrent = dayjs().add(1, 'month');

export const checkIsBefore = (startDate, endDate) => {
  return dayjs(startDate).isBefore(dayjs(endDate));
};

export const convertUtcToEst = (utcString) => {
  const utcDate = dayjs.utc(utcString);
  const estDate = utcDate.tz('America/New_York');
  const estString = estDate.format();
  return estString;
};

// server format
export const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');

// client side format
export const formatDateSlash = (date) => dayjs(date).format('MM/DD/YYYY');

// client side format ex: Monday August 21, 2023
export const formatDateFull = (date) => dayjs(date).format('dddd LL');

// ex: 10:00am 6:00pm used in component render
export const formatDateToTime = (date) => dayjs(date).format('h:mma');

export const formatTime = (time) => dayjs(time, 'HH:mm').format('h:mma');

export const findAvailableTimeSlots = (
  schedule,
  duration,
  employees,
  employee
) => {
  const { date, open, close, appointments } = schedule;
  const searchIncrement = 15;
  const slots = [];
  const currentEstTime = convertUtcToEst(currentDate);
  const formattedCurrentDate = formatDate(currentEstTime);
  let slotStart =
    formatDate(date) === formattedCurrentDate
      ? roundedCurrentDate()
      : dayjs(open);
  const slotEnd = dayjs(close);

  while (slotStart.isBefore(slotEnd)) {
    const currentSlotEnd = slotStart.add(duration, 'minute');
    if (currentSlotEnd.isAfter(slotEnd)) {
      break;
    }

    const selectedEmployees = employee !== 'any' ? [employee.id] : employees;
    const availableEmployees = selectedEmployees.filter((employeeId) => {
      const employeeAppointments = appointments.filter(
        (appointment) => appointment.employeeId === employeeId
      );
      const employeeBooked = employeeAppointments.some(
        (appointment) =>
          dayjs(appointment.start).isBefore(currentSlotEnd) &&
          dayjs(appointment.end).isAfter(slotStart)
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

// splits schedules or appointments by upcoming and past
export const splitByUpcomingAndPast = (dateObj) => {
  const upcoming = [];
  const past = [];
  const presentDate = new Date();
  if (dateObj.length > 0) {
    dateObj.forEach((dateItem) => {
      const currItemDate = new Date(dateItem.date);
      if (currItemDate < presentDate) {
        past.push(dateItem);
      } else {
        upcoming.push(dateItem);
      }
    });
  }
  return [upcoming, past];
};

export const sortAndFormatApptByStartTime = (apptObj) => {
  if (apptObj) {
    return apptObj
      .toSorted((a, b) => new Date(a.start) - new Date(b.start))
      .map((appt) => {
        return {
          ...appt,
          start: formatDateToTime(appt.start),
        };
      });
  } else {
    return [];
  }
};
