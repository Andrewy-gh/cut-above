import dayjs, { Dayjs } from 'dayjs';

const convertEST = (date) =>
  `${dayjs(date).format('YYYY-MM-DD')}T00:00:00-05:00`;

const convertTimeFormat = (time) => dayjs(time, 'HH:mm').format('h:mma');

const currentDate = () => dayjs();

const dateHyphen = (date) => dayjs(date).format('YYYY-MM-DD');

const dateShort = (date) => dayjs(date).format('M/D');

const dateSlash = (date) => dayjs(date).format('MM/DD/YYYY');

const time = (date) => dayjs(date).format('h:mma');

export default {
  convertEST,
  convertTimeFormat,
  currentDate,
  dateHyphen,
  dateShort,
  dateSlash,
  time,
};
