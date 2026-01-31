import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectOpen);
  const message = useAppSelector(selectMessage);
  const severity = useAppSelector(selectSeverity);
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
