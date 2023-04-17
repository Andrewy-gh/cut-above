import { useDispatch, useSelector } from 'react-redux';
import ButtonDialog from '../../components/ButtonDialog';
import { selectEmployeeById } from '../employees/employeeSlice';
import { useCancelAppointmentMutation } from './apptApiSlice';
import { setError, setSuccess } from '../notification/notificationSlice';

const CancelAppointment = ({ appt }) => {
  const dispatch = useDispatch();
  const employee = useSelector((state) =>
    selectEmployeeById(state, appt.employee)
  );
  const [cancelAppointment] = useCancelAppointmentMutation();

  const handleCancel = async (id) => {
    try {
      const cancelledAppt = await cancelAppointment({ id }).unwrap();
      dispatch(setSuccess(cancelledAppt.message));
    } catch (error) {
      dispatch(setError(`Error cancelling appointment: ${error}`));
    }
  };

  const dialog = (appt) => {
    return {
      button: 'Cancel',
      title: `Would you like to cancel this appointment?`,
      content: `With ${employee.firstName} on ${appt.date} at ${appt.time}?`,
    };
  };

  return (
    <ButtonDialog
      dialog={dialog(appt)}
      agreeHandler={() => handleCancel(appt.id)}
      closeHandler={() => void 0}
    />
  );
};

export default CancelAppointment;
