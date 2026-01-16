import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';

import { useScheduleQuery } from '@/hooks/useScheduleQuery';

import BookingForm from '@/routes/BookingPage/BookingForm';

import BookingDialog from '@/routes/BookingPage/BookingDialog';

import { useBooking } from '@/hooks/useBooking';

import { useFilter } from '@/hooks/useFilter';

import { useDialog } from '@/hooks/useDialog';

import { useAuth } from '@/hooks/useAuth';

import { useNotification } from '@/hooks/useNotification';

import { Slot } from '@/types';

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
  const [rescheduling, setRescheduling] = useState<boolean | null>(null);
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      setRescheduling(true);
    }
  }, [id]);
  const message = rescheduling
    ? 'Please book your new appointment'
    : 'Schedule your appointment';

  const handleSelectAndOpen = (data: typeof selection) => {
    handleSelectionChange(data as Parameters<typeof handleSelectionChange>[0]);
    handleOpen();
  };

  const handleAgree = () => {
    if (!user) {
      handleError('Please login to complete booking');
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }
    // Type guard to ensure selection is a Slot
    if ('start' in selection && 'end' in selection) {
      const employeeId = employee === 'any' ? 'any' : (employee?._id || '');
      handleBooking({
        id,
        date,
        start: (selection as Slot).start.toISOString(),
        end: (selection as Slot).end.toISOString(),
        service: service.name,
        employee: employeeId,
      });
    }
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
