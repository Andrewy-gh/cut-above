import { useDispatch, useSelector } from 'react-redux';
import {
  selectOpen,
  selectMessage,
  selectSeverity,
  setSuccess,
  setError,
  clearMessage,
} from '@/features/notificationSlice';

export function useNotification() {
  const dispatch = useDispatch();
  const open = useSelector(selectOpen);
  const message = useSelector(selectMessage);
  const severity = useSelector(selectSeverity);
  const handleSuccess = (message: any) => dispatch(setSuccess(message));
  const handleError = (err: any, extraErr?: any) => {
    // redux returns data
    const errorMessage = err?.data?.error || err?.message || err;
    const finalMessage = extraErr ? `${errorMessage} ${extraErr?.message || extraErr}` : errorMessage;
    dispatch(setError(`Error: ${finalMessage}`));
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
