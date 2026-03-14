import { useNavigate, useParams, useLocation } from 'react-router';

import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';
import { useBooking } from '@/hooks/useBooking';
import { useFilter } from '@/hooks/useFilter';
import { useDialog } from '@/hooks/useDialog';
import { useAuth } from '@/hooks/useAuth';
import { useAppointmentAccessToken } from '@/hooks/useAppointmentAccessToken';
import { useBookingScheduleQuery } from '@/hooks/useBookingScheduleQuery';
import { useNotification } from '@/hooks/useNotification';
import BookingForm from '@/routes/BookingPage/BookingForm';
import BookingDialog from '@/routes/BookingPage/BookingDialog';
import AccessDenied from '@/routes/RequireAuth/AccessDenied';
import { useQuery } from '@/convex/client';
import { Slot } from '@/types';

import { api } from '../../../../convex/_generated/api';
import styles from './styles.module.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  useEmployeesQuery();
  const { date, employee, selection, service, handleSelectionChange } =
    useFilter();
  useBookingScheduleQuery(date);
  const { open, handleClose, handleOpen } = useDialog();
  const { handleBooking } = useBooking();
  const { user, role } = useAuth();
  const { handleError } = useNotification();
  const accessToken = useAppointmentAccessToken();

  const { id } = useParams();
  const rescheduling = Boolean(id || accessToken);

  // If we're rescheduling, validate that the appointment exists and is accessible.
  // If not, Convex will throw and react-router will render the nearest errorElement.
  useQuery(
    api.appointments.getAppointmentById,
    id && !accessToken && role !== 'admin' ? { id } : 'skip'
  );
  useQuery(
    api.appointments.getManagedAppointmentByToken,
    !id && accessToken ? { token: accessToken } : 'skip'
  );

  if (role === 'admin' && !accessToken) {
    return <AccessDenied requiredRole="client" />;
  }

  const handleSelectAndOpen = (data: typeof selection) => {
    handleSelectionChange(data as Parameters<typeof handleSelectionChange>[0]);
    handleOpen();
  };

  const handleAgree = () => {
    if (!user && !accessToken) {
      handleError('Please login to complete booking');
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
        state: { from: returnTo },
        replace: true,
      });
      return;
    }

    if ('start' in selection && 'end' in selection) {
      handleBooking({
        id,
        token: accessToken,
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
            Rescheduling - select your new date &amp; time
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
