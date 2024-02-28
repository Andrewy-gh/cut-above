import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/hooks/useAuth';
import { useFilter } from '@/hooks/useFilter';
import { formatDateFull, formatTime } from '@/utils/date';
import { theme } from '@/styles/styles';
import styles from './styles.module.css';
import PropTypes from 'prop-types';
import { selectionPropType } from '@/utils/propTypes';

const BookingDialogTitle = ({ children, onClose }) => {
  return (
    <div className={styles.flex_sb}>
      <DialogTitle>{children}</DialogTitle>
      <div className={styles.padding}>
        {onClose ? (
          <IconButton
            onClick={onClose}
            sx={{
              color: theme.palette.secondary.light,
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
};

export default function BookingDialogContent({
  children,
  handleAgree,
  handleClose,
  selection,
}) {
  const { user } = useAuth();
  const { date, service } = useFilter();

  let loggedIn;
  if (!user) {
    loggedIn = (
      <Link to="/login">
        <Button style={{ color: '#E0A00D' }}>Login</Button>
      </Link>
    );
  }
  return (
    <>
      <BookingDialogTitle onClose={handleClose}>
        Complete your Booking
      </BookingDialogTitle>
      <DialogContent className="grow-0">
        <div className={styles.flex}>
          <ContentCutIcon />
          <div>{service.name}</div>
          <div>{service.duration} minutes</div>
        </div>
        <div className={styles.flex}>
          <CalendarMonthIcon />
          <div>{formatDateFull(date)}</div>
          <div>{formatTime(selection.start)}</div>
        </div>
      </DialogContent>
      {children}
      <DialogActions>
        {loggedIn}
        <Button onClick={handleAgree} autoFocus style={{ marginLeft: 'auto' }}>
          Book Now
        </Button>
      </DialogActions>
    </>
  );
}

BookingDialogTitle.propTypes = {
  children: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

BookingDialogContent.propTypes = {
  children: PropTypes.object,
  handleAgree: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  selection: selectionPropType,
};
