import {
  useAddAppointmentMutation,
  useModifyAppointmentMutation,
  useModifyManagedAppointmentMutation,
} from '@/features/appointments/apptApiSlice';
import { useAppointment } from './useAppointment';
import { useFilter } from './useFilter';
import { useNotification } from './useNotification';

interface BookingParams {
  id?: string;
  start: string;
  end: string;
  service: string;
  employee: {
    id: string;
    firstName: string;
  };
}

export function useBooking() {
  const [addAppointment] = useAddAppointmentMutation();
  const [modifyAppointment] = useModifyAppointmentMutation();
  const [modifyManagedAppointment] = useModifyManagedAppointmentMutation();
  const { handleEndRescheduling } = useAppointment();
  const { handleFilterReset } = useFilter();
  const { handleSuccess, handleError } = useNotification();

  const handleBooking = async ({
    id,
    token,
    start,
    end,
    service,
    employee
  }: BookingParams & { token?: string | null }) => {
    try {
      if (id) {
        const modifiedAppt = await modifyAppointment({
          id,
          start,
          end,
          service,
          employee,
        });
        if (modifiedAppt.success) {
          handleSuccess(modifiedAppt.message);
          handleEndRescheduling();
        }
      } else if (token) {
        const modifiedAppt = await modifyManagedAppointment({
          token,
          start,
          end,
          service,
          employee,
        });
        if (modifiedAppt.success) {
          handleSuccess(modifiedAppt.message);
          handleEndRescheduling();
        }
      } else {
        const newAppt = await addAppointment({
          start,
          end,
          service,
          employee,
        });
        if (newAppt.success) {
          handleSuccess(newAppt.message);
          handleFilterReset();
        }
      }
    } catch (err) {
      handleError(err);
    }
  };

  return {
    handleBooking,
  };
}
