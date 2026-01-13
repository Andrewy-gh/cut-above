import {
  useAddAppointmentMutation,
  useModifyAppointmentMutation,
} from '@/features/appointments/apptApiSlice';
import { useAppointment } from './useAppointment';
import { useFilter } from './useFilter';
import { useNotification } from './useNotification';

export function useBooking() {
  const [addAppointment] = useAddAppointmentMutation();
  const [modifyAppointment] = useModifyAppointmentMutation();
  const { handleEndRescheduling } = useAppointment();
  const { handleFilterReset } = useFilter();
  const { handleSuccess, handleError } = useNotification();

  const handleBooking = async ({
    id,
    date,
    start,
    end,
    service,
    employee,
    // emailToken,
  }) => {
    try {
      if (id) {
        const modifiedAppt = await modifyAppointment({
          id,
          date,
          start,
          end,
          service,
          employee,
          // emailToken,
        }).unwrap();
        if (modifiedAppt.success) {
          handleSuccess(modifiedAppt.message);
          handleEndRescheduling();
        }
      } else {
        const newAppt = await addAppointment({
          date,
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
