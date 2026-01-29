import { useDispatch, useSelector } from 'react-redux';
import {
  selectOpen,
  selectMessage,
  selectSeverity,
  setSuccess,
  setError,
  clearMessage,
} from '@/features/notificationSlice';
import { getErrorMessage } from '@/utils/apiError';

export function useNotification() {
  const dispatch = useDispatch();
  const open = useSelector(selectOpen);
  const message = useSelector(selectMessage);
  const severity = useSelector(selectSeverity);
  const handleSuccess = (msg: string) => dispatch(setSuccess(msg));
  const handleError = (err: unknown, extraErr?: unknown) => {
    const errorMessage = getErrorMessage(err);
    const extraMessage = extraErr == null ? '' : getErrorMessage(extraErr);
    const finalMessage = extraMessage ? `${errorMessage} ${extraMessage}` : errorMessage;
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
