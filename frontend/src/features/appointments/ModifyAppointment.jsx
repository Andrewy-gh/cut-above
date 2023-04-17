import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import date from '../date/date';
import ButtonDialog from '../../components/ButtonDialog';
import { selectEmployeeById } from '../employees/employeeSlice';
import { beginRescheduling } from './appointmentSlice';

const ModifyAppointment = ({ appt }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const employee = useSelector((state) =>
    selectEmployeeById(state, appt.employee)
  );

  const handleModify = () => {
    dispatch(beginRescheduling(appt.id));
    navigate('/reserve');
  };

  const dialog = (appt) => {
    return {
      button: 'Modify',
      title: `Would you like to modify this appointment?`,
      content: `With ${employee.firstName} on ${appt.date} at ${appt.time}?`,
    };
  };

  return (
    <ButtonDialog
      dialog={dialog(appt)}
      agreeHandler={() => handleModify(appt.id)}
      closeHandler={() => void 0}
    />
  );
};

export default ModifyAppointment;
