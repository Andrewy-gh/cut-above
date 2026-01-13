import { forwardRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNotification } from '../hooks/useNotification';

const Alert = forwardRef<HTMLDivElement, any>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Notification() {
  const { open, message, severity, handleClearMessage } = useNotification();
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClearMessage}>
      <Alert
        onClose={handleClearMessage}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
