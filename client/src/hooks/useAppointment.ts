import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useNavigate, useLocation } from 'react-router';
import {
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from '@/features/appointments/apptApiSlice';
import {
  endRescheduling,
  selectModifyingApptId,
  selectRescheduling,
} from '@/features/appointments/appointmentSlice';

import { useNotification } from '@/hooks/useNotification';
import type { Appointment } from '@/types';

export function useAppointment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const rescheduling = useAppSelector(selectRescheduling);
  const modifyingApptId = useAppSelector(selectModifyingApptId);
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [updateAppointmentStatus] = useUpdateAppointmentStatusMutation();
  const { handleSuccess, handleError } = useNotification();

  const handleCancel = async (id: string) => {
    try {
      const cancelledAppt = await cancelAppointment({
        id,
      });
      if (cancelledAppt.success) {
        handleSuccess(cancelledAppt.message);
        if (location.pathname.startsWith('/appointment/')) {
          navigate('/cancellation');
        }
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleBeginRescheduling = (id: string) => {
    navigate(`/account/appointments/${id}/reschedule`);
  };

  const handleEndRescheduling = () => dispatch(endRescheduling());

  const handleStatusUpdate = async (id: string, newStatus: Appointment['status']) => {
    try {
      const statusUpdate = await updateAppointmentStatus({
        id,
        status: newStatus,
      });
      if (statusUpdate.success) handleSuccess(statusUpdate.message);
    } catch (err) {
      handleError(err);
    }
  };

  return {
    rescheduling,
    modifyingApptId,
    handleCancel,
    handleBeginRescheduling,
    handleEndRescheduling,
    handleStatusUpdate,
  };
}
