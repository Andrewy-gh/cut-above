import {
  useAddAppointmentMutation,
  useModifyAppointmentMutation,
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
  const { handleEndRescheduling } = useAppointment();
  const { handleFilterReset } = useFilter();
  const { handleSuccess, handleError } = useNotification();

  const handleBooking = async ({
    id,
    start,
    end,
    service,
    employee
  }: BookingParams) => {
    try {
      if (id) {
        const modifiedAppt = await modifyAppointment({
          id,
          start,
          end,
          service,
          employee,
        }).unwrap();
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
        }).unwrap();
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
