import PropTypes from 'prop-types';
import dayjs from 'dayjs';

export const userPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
});

export const appointmentPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  employee: userPropType,
  client: userPropType,
  start: PropTypes.string.isRequired,
  service: PropTypes.oneOf([
    'Haircut',
    'Beard Trim',
    'Straight Razor Shave',
    'Cut and Shave Package',
    'The Full Package',
  ]).isRequired,
});

export const selectionPropType = PropTypes.shape({
  id: PropTypes.string,
  start: PropTypes.instanceOf(dayjs),
  end: PropTypes.instanceOf(dayjs),
  available: PropTypes.arrayOf(PropTypes.string),
}).isRequired;

export const schedulePropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  open: PropTypes.string.isRequired,
  close: PropTypes.string.isRequired,
  appointment: PropTypes.arrayOf(appointmentPropType),
});
