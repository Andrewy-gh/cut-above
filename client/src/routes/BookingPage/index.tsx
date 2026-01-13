import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useEmployeesQuery' or ... Remove this comment to see the full error message
import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useScheduleQuery' or i... Remove this comment to see the full error message
import { useScheduleQuery } from '@/hooks/useScheduleQuery';

// @ts-expect-error TS(2307): Cannot find module '@/routes/BookingPage/BookingFo... Remove this comment to see the full error message
import BookingForm from '@/routes/BookingPage/BookingForm';

// @ts-expect-error TS(2307): Cannot find module '@/routes/BookingPage/BookingDi... Remove this comment to see the full error message
import BookingDialog from '@/routes/BookingPage/BookingDialog';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useBooking' or its cor... Remove this comment to see the full error message
import { useBooking } from '@/hooks/useBooking';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useFilter' or its corr... Remove this comment to see the full error message
import { useFilter } from '@/hooks/useFilter';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useDialog' or its corr... Remove this comment to see the full error message
import { useDialog } from '@/hooks/useDialog';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAuth' or its corres... Remove this comment to see the full error message
import { useAuth } from '@/hooks/useAuth';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useNotification' or it... Remove this comment to see the full error message
import { useNotification } from '@/hooks/useNotification';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  useEmployeesQuery();
  useScheduleQuery();
  const { date, employee, selection, service, handleSelectionChange } =
    useFilter();
  const { open, handleClose, handleOpen } = useDialog();
  const { handleBooking } = useBooking();
  const { user } = useAuth();
  const { handleError } = useNotification();

  // handles modifying an appointment
  const [rescheduling, setRescheduling] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    if (id) {

      // @ts-expect-error TS(2345): Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
      setRescheduling(true);
    }
  }, [id]);
  let message = rescheduling
    ? 'Please book your new appointment'
    : 'Schedule your appointment';

  const handleSelectAndOpen = (data: any) => {
    handleSelectionChange(data);
    handleOpen();
  };

  const handleAgree = () => {
    if (!user) {
      handleError('Please login to complete booking');
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }
    handleBooking({
      id,
      date,
      start: selection.start,
      end: selection.end,
      service: service.name,
      employee,
    });
    handleClose();
  };

  return (
    <>
      <div className={styles.flex_container}>
        <h3 className={styles.header}>{message}</h3>
        <BookingForm handleOpen={handleSelectAndOpen} employee={employee} />
        <BookingDialog
          open={open}
          handleClose={handleClose}
          selection={selection}
          handleAgree={handleAgree}
        />
      </div>
    </>
  );
}
