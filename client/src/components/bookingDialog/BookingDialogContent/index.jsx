import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CloseIcon from '@mui/icons-material/Close';
import { formatDateFull, formatTime } from '@/utils/date';
import { useFilter } from '@/hooks/useFilter';
import { theme } from '@/styles/styles';
import styles from './styles.module.css';

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

function BookingDialogContent({
  children,
  handleAgree,
  handleClose,
  selection,
  token,
}) {
  const { date, service } = useFilter();

  let loggedIn;
  if (!token) {
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

export default BookingDialogContent;
