import { Link } from 'react-router';
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
import { Slot } from '@/types';
import styles from './styles.module.css';

interface BookingDialogTitleProps {
  children: React.ReactNode;
  onClose: () => void;
}

const BookingDialogTitle = ({ children, onClose }: BookingDialogTitleProps) => {
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

interface BookingDialogContentProps {
  children?: React.ReactNode;
  handleAgree: () => void;
  handleClose: () => void;
  selection: Slot | Record<string, never>;
}

export default function BookingDialogContent({
  children,
  handleAgree,
  handleClose,
  selection,
}: BookingDialogContentProps) {
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

  const startTime = 'start' in selection ? formatTime(selection.start) : '';

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
          <div>{startTime}</div>
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
