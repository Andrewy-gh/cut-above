import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from '../features/appointments/apptApiSlice';
import {
  endRescheduling,
  selectModifyingApptId,
  selectRescheduling,
} from '../features/appointments/appointmentSlice';
import { useNotification } from '../hooks/useNotification';

export function useAppointment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rescheduling = useSelector(selectRescheduling);
  const modifyingApptId = useSelector(selectModifyingApptId);
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [updateAppointmentStatus] = useUpdateAppointmentStatusMutation();
  const { handleSuccess, handleError } = useNotification();

  const handleCancel = async (id, emailToken) => {
    try {
      const cancelledAppt = await cancelAppointment({
        id,
        emailToken,
      }).unwrap();
      if (cancelledAppt.success) {
        handleSuccess(cancelledAppt.message);
        navigate('/');
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleBeginRescheduling = (id, token) => {
    if (token) {
      navigate(`/bookings/${id}/?token=${token}`);
    } else {
      navigate(`/bookings/${id}`);
    }
  };

  const handleEndRescheduling = () => dispatch(endRescheduling());

  const handleStatusUpdate = async (appointment, newStatus) => {
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
