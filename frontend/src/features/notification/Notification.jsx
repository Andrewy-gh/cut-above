import { Snackbar } from '@mui/material';
import { Alert as MuiAlert } from '@mui/material';
import { forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAlert,
  selectAlert,
  selectOpen,
  selectSeverity,
} from './notificationSlice';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Notification = () => {
  const dispatch = useDispatch();
  const open = useSelector(selectOpen);
  const alert = useSelector(selectAlert);
  const severity = useSelector(selectSeverity);
  const vertical = 'bottom';
  const horizontal = 'center';
  console.log('open: ', open, 'alert: ', alert, 'severity: ', severity);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(clearAlert());
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        sx={{ width: '100%' }}
      >
        <Alert severity={severity}>{alert}</Alert>
      </Snackbar>
    </>
  );
};

export default Notification;
