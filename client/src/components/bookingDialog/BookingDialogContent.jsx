import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CloseIcon from '@mui/icons-material/Close';
import { formatDateFull, formatTime } from '../../utils/date';
import { useFilter } from '../../hooks/useFilter';
import { theme } from '../../styles/styles';

const flex = {
  display: 'flex',
  alignItems: 'center',
  gap: '.5rem',
  marginBottom: '1rem',
};

const BookingDialogTitle = ({ children, onClose }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <DialogTitle>{children}</DialogTitle>
      <div style={{ padding: '.25rem' }}>
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
      <Button style={{ color: '#E0A00D' }}>
        <Link to="/login">Login</Link>
      </Button>
    );
  }
  return (
    <>
      <BookingDialogTitle onClose={handleClose}>
        Complete your Booking
      </BookingDialogTitle>
      <DialogContent style={{ flexGrow: '0' }}>
        <div style={flex}>
          <ContentCutIcon />
          <div>{service.name}</div>
          <div>{service.duration} minutes</div>
        </div>
        <div style={flex}>
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
