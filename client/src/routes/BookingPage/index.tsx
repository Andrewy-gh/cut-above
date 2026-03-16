
import { useNavigate, useParams, useLocation } from 'react-router';

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
import { api } from '../../../../convex/_generated/api';
import { useQuery } from '@/convex/client';
import AccessDenied from '@/routes/RequireAuth/AccessDenied';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  useEmployeesQuery();
  useScheduleQuery();
  const { employee, selection, service, handleSelectionChange } = useFilter();
  const { open, handleClose, handleOpen } = useDialog();
  const { handleBooking } = useBooking();
  const { user, role } = useAuth();
  const { handleError } = useNotification();

  const { id } = useParams();
  const rescheduling = Boolean(id);

  // If we're rescheduling, validate that the appointment exists and is accessible.
  // If not, Convex will throw and react-router will render the nearest errorElement.
  useQuery(
    api.appointments.getAppointmentById,
    id && role !== 'admin' ? { id } : 'skip'
  );

  // Option 1 from discussion: admins should not book appointments (hide entry points + block route).
  if (role === 'admin') {
    return <AccessDenied requiredRole="client" />;
  }

  const handleSelectAndOpen = (data: typeof selection) => {
    handleSelectionChange(data as Parameters<typeof handleSelectionChange>[0]);
    handleOpen();
  };

  const handleAgree = () => {
    if (!user) {
      handleError('Please login to complete booking');
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
        state: { from: returnTo },
        replace: true,
      });
      return;
    }
    // Type guard to ensure selection is a Slot
    if ('start' in selection && 'end' in selection) {
      handleBooking({
        id,
        start: (selection as Slot).start.toISOString(),
        end: (selection as Slot).end.toISOString(),
        service: service.name,
        employee: {
          id: employee?.id || '',
          firstName: employee?.firstName || '',
        },
      });
    }
    handleClose();
  };

  return (
    <>
      <div className={styles.flex_container}>
        <h3 className={styles.header}>
          {rescheduling ? 'Reschedule Appointment' : 'Book Your Appointment'}
        </h3>
        {rescheduling && (
          <div className={styles.reschedule_badge}>
            Rescheduling — select your new date &amp; time
          </div>
        )}
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
