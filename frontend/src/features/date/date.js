import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const convertEST = (date) =>
  `${dayjs(date).format('YYYY-MM-DD')}T00:00:00-05:00`;

const convertTimeFormat = (time) => dayjs(time, 'HH:mm').format('h:mma');

const currentDate = () => dayjs();

const dateHyphen = (date) => dayjs(date).format('YYYY-MM-DD');

const dateShort = (date) => dayjs(date).format('M/D');

const dateSlash = (date) => dayjs(date).format('MM/DD/YYYY');

const generateDateRanges = (dates, open, close) => {
  const [startDate, endDate] = dates;
  const startDateString = dateHyphen(startDate);
  const endDateString = dateHyphen(endDate);
  const datesToSchedule = [];
  let currentDate = dayjs(startDateString);
  while (currentDate.isSameOrBefore(endDateString, 'day')) {
    datesToSchedule.push({
      date: convertEST(currentDate),
      open: open,
      close: close,
    });
    currentDate = currentDate.add(1, 'day');
  }
  return datesToSchedule;
};

const filterBySevenDays = (arr) =>
  arr.filter((obj) => {
    const date = dayjs(obj.date);
    return (
      date.isSameOrAfter(dayjs(), 'day') &&
      date.isBefore(dayjs().add(6, 'day'), 'day')
    );
  });

const time = (date) => dayjs(date).format('h:mma');

export default {
  convertEST,
  convertTimeFormat,
  currentDate,
  dateHyphen,
  dateShort,
  dateSlash,
  filterBySevenDays,
  generateDateRanges,
  time,
};
