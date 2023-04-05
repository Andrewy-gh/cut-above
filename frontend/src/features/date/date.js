import dayjs, { Dayjs } from 'dayjs';

const convertEST = (date) =>
  `${dayjs(date).format('YYYY-MM-DD')}T00:00:00-05:00`;

const currentDate = () => dayjs();

const dateDash = (date) => dayjs(date).format('YYYY-MM-DD');

const dateHyphen = (date) => dayjs(date).format('MM/DD/YYYY');

const dateShort = (date) => dayjs(date).format('M/D');

const time = (date) => dayjs(date).format('h:mma');

export default {
  convertEST,
  currentDate,
  dateDash,
  dateHyphen,
  dateShort,
  time,
};
