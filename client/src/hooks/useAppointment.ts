import { useDispatch, useSelector } from 'react-redux';
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

export function useAppointment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const rescheduling = useSelector(selectRescheduling);
  const modifyingApptId = useSelector(selectModifyingApptId);
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [updateAppointmentStatus] = useUpdateAppointmentStatusMutation();
  const { handleSuccess, handleError } = useNotification();

  const handleCancel = async (id: string) => {
    try {
      const cancelledAppt = await cancelAppointment({
        id,
      }).unwrap();
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
    navigate(`/bookings/${id}`);
  };

  const handleEndRescheduling = () => dispatch(endRescheduling());

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const statusUpdate = await updateAppointmentStatus({
        id,
        status: newStatus,
      }).unwrap();
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
