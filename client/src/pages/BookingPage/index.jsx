import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';
import { useScheduleQuery } from '@/hooks/useScheduleQuery';
import BookingForm from '@/components/bookingForm';
import BookingDialog from '@/components/bookingDialog';
import { useBooking } from '@/hooks/useBooking';
import { useFilter } from '@/hooks/useFilter';
import { useDialog } from '@/hooks/useDialog';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useValidateTokenQuery } from '@/features/userSlice';
import Error from './error';
import styles from './styles.module.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const { data: employees } = useEmployeesQuery();
  const { data: schedules } = useScheduleQuery();
  const { date, employee, selection, service, handleSelectionChange } =
    useFilter();
  const { open, handleClose, handleOpen } = useDialog();
  const { handleBooking } = useBooking();
  const { token } = useAuth();
  const { handleError } = useNotification();

  const { id } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  let emailToken = searchParams.get('token');

  const {
    data: tokenStatus,
    isLoading,
    isError,
  } = useValidateTokenQuery(
    { option: 'email', token: emailToken },
    { skip: !emailToken }
  );

  const [rescheduling, setRescheduling] = useState(null);
  useEffect(() => {
    if (id) {
      setRescheduling(true);
    }
  }, [id]);

  if (emailToken && tokenStatus && tokenStatus.error) {
    handleError('Token is not valid');
  }

  const handleSelectAndOpen = (data) => {
    handleSelectionChange(data);
    handleOpen();
  };

  let message = rescheduling
    ? 'Please book your new appointment'
    : 'Schedule your appointment';

  const handleAgree = () => {
    if (!token && !emailToken) {
      handleError('Please login to complete booking');
      navigate('/login');
      return;
    }
    handleBooking({
      id,
      date,
      start: selection.start,
      end: selection.end,
      service: service.name,
      employee,
      emailToken,
    });
    handleClose();
  };

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (emailToken && isError) {
    // emailToken present but it is not valid
    content = <Error />;
  } else {
    content = (
      <div className={styles.flex_container}>
        <h3 className={styles.header}>{message}</h3>
        <BookingForm handleOpen={handleSelectAndOpen} />
        <BookingDialog
          open={open}
          handleClose={handleClose}
          selection={selection}
          handleAgree={handleAgree}
          token={token}
        />
      </div>
    );
  }
  return <>{content}</>;
}
