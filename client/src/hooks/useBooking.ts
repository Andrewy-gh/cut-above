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

interface BookingResult {
  success: boolean;
  message: string;
}

interface BookingDependencies {
  addAppointment: (params: BookingParams) => Promise<BookingResult>;
  modifyAppointment: (params: BookingParams & { id: string }) => Promise<BookingResult>;
  modifyManagedAppointment: (
    params: BookingParams & { token: string }
  ) => Promise<BookingResult>;
  handleEndRescheduling: () => void;
  handleFilterReset: () => void;
  handleSuccess: (message: string) => void;
  handleError: (error: unknown) => void;
}

type BookingRequest = BookingParams & { token?: string | null };

export const createBookingOrchestrator = (deps: BookingDependencies) => {
  const handleBooking = async ({
    id,
    token,
    start,
    end,
    service,
    employee,
  }: BookingRequest) => {
    try {
      let result: BookingResult | null = null;

      if (id) {
        result = await deps.modifyAppointment({
          id,
          start,
          end,
          service,
          employee,
        });
        if (result.success) {
          deps.handleEndRescheduling();
        }
      } else if (token) {
        result = await deps.modifyManagedAppointment({
          token,
          start,
          end,
          service,
          employee,
        });
        if (result.success) {
          deps.handleEndRescheduling();
        }
      } else {
        result = await deps.addAppointment({
          start,
          end,
          service,
          employee,
        });
        if (result.success) {
          deps.handleFilterReset();
        }
      }

      if (result?.success) {
        deps.handleSuccess(result.message);
      }
    } catch (err) {
      deps.handleError(err);
    }
  };

  return {
    handleBooking,
  };
};

export function useBooking() {
  const [addAppointment] = useAddAppointmentMutation();
  const [modifyAppointment] = useModifyAppointmentMutation();
  const [modifyManagedAppointment] = useModifyManagedAppointmentMutation();
  const { handleEndRescheduling } = useAppointment();
  const { handleFilterReset } = useFilter();
  const { handleSuccess, handleError } = useNotification();

  return createBookingOrchestrator({
    addAppointment,
    modifyAppointment,
    modifyManagedAppointment,
    handleEndRescheduling,
    handleFilterReset,
    handleSuccess,
    handleError,
  });
}
