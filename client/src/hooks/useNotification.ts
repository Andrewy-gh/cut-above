import { useDispatch, useSelector } from 'react-redux';
import {
  selectOpen,
  selectMessage,
  selectSeverity,
  setSuccess,
  setError,
  clearMessage,
// @ts-expect-error TS(2307): Cannot find module '@/features/notificationSlice' ... Remove this comment to see the full error message
} from '@/features/notificationSlice';

export function useNotification() {
  const dispatch = useDispatch();
  const open = useSelector(selectOpen);
  const message = useSelector(selectMessage);
  const severity = useSelector(selectSeverity);
  const handleSuccess = (message: any) => dispatch(setSuccess(message));
  const handleError = (err: any) => {
    // redux returns data
    const errorMessage = err?.data?.error || err?.message || err;
    dispatch(setError(`Error: ${errorMessage}`));
  };
  const handleClearMessage = () => dispatch(clearMessage());
  return {
    open,
    message,
    severity,
    handleSuccess,
    handleError,
    handleClearMessage,
  };
}
