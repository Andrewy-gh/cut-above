import { useDispatch, useSelector } from 'react-redux';
import {
  selectOpen,
  selectMessage,
  selectSeverity,
  setSuccess,
  setError,
  clearMessage,
} from '@/features/notificationSlice';
import { ApiError } from '@/types';

export function useNotification() {
  const dispatch = useDispatch();
  const open = useSelector(selectOpen);
  const message = useSelector(selectMessage);
  const severity = useSelector(selectSeverity);
  const handleSuccess = (msg: string) => dispatch(setSuccess(msg));
  const handleError = (err: ApiError | string, extraErr?: ApiError | string) => {
    const errorMessage =
      typeof err === 'string'
        ? err
        : err?.data?.error || err?.message || String(err);
    const extraMessage =
      extraErr == null
        ? ''
        : typeof extraErr === 'string'
          ? extraErr
          : extraErr?.message || String(extraErr);
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
