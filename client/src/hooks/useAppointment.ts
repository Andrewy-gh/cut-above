import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
// @ts-expect-error TS(2307): Cannot find module '@/features/appointments/apptAp... Remove this comment to see the full error message
} from '@/features/appointments/apptApiSlice';
import {
  endRescheduling,
  selectModifyingApptId,
  selectRescheduling,
// @ts-expect-error TS(2307): Cannot find module '@/features/appointments/appoin... Remove this comment to see the full error message
} from '@/features/appointments/appointmentSlice';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useNotification' or it... Remove this comment to see the full error message
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

  const handleCancel = async (id: any) => {
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

  const handleBeginRescheduling = (id: any) => {
    navigate(`/bookings/${id}`);
  };

  const handleEndRescheduling = () => dispatch(endRescheduling());

  const handleStatusUpdate = async (appointment: any, newStatus: any) => {
    try {
      const statusUpdate = await updateAppointmentStatus({
        id: appointment.id,
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
