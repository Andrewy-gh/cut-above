import { Link } from 'react-router';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CloseIcon from '@mui/icons-material/Close';

import { useAuth } from '@/hooks/useAuth';
import { useFilter } from '@/hooks/useFilter';
import { formatDateFull, formatTime } from '@/utils/date';
import { Slot } from '@/types';
import styles from './styles.module.css';

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

  const startTime = 'start' in selection ? formatTime(selection.start) : '';

  return (
    <>
      {/* Header */}
      <div className={styles.dialog_header}>
        <h3 className={styles.dialog_title}>Complete your Booking</h3>
        <div className={styles.close_btn_wrap}>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ color: '#629aa4', '&:hover': { color: '#26C4E0' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {/* Booking details */}
      <DialogContent sx={{ pt: 1.5, pb: 0.5 }}>
        <div className={styles.detail_row}>
          <span className={styles.detail_icon}><ContentCutIcon fontSize="small" /></span>
          <span className={styles.detail_text}>{service.name}</span>
          <span className={styles.detail_sub}>{service.duration} min</span>
        </div>
        <div className={styles.detail_row}>
          <span className={styles.detail_icon}><CalendarMonthIcon fontSize="small" /></span>
          <span className={styles.detail_text}>{formatDateFull(date)}</span>
          <span className={styles.detail_sub}>{startTime}</span>
        </div>
      </DialogContent>

      {/* Employee selection slot */}
      {children}

      {/* Actions */}
      <DialogActions sx={{ px: 2, pb: 2, pt: 1, borderTop: '1px solid #2a2a2a' }}>
        {!user && (
          <Link to="/login">
            <Button sx={{ color: '#E0A00D', fontFamily: 'Nobile, sans-serif' }}>
              Login to book
            </Button>
          </Link>
        )}
        <Button
          onClick={handleAgree}
          autoFocus
          variant="contained"
          sx={{
            ml: 'auto',
            background: 'linear-gradient(135deg, #037E94, #26C4E0)',
            color: '#fff',
            fontFamily: 'Corben, sans-serif',
            fontWeight: 700,
            borderRadius: '0.5rem',
            px: 2.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #026272, #1aa8c0)',
            },
          }}
        >
          Book Now
        </Button>
      </DialogActions>
    </>
  );
}
