import { useSelector } from 'react-redux';
import date from '../date/date';
import ButtonDialog from '../../components/ButtonDialog';
import { selectEmployeeById } from '../employees/employeeSlice';

const CancelAppointment = ({ appt }) => {
  const employee = useSelector((state) =>
    selectEmployeeById(state, appt.employee)
  );
  console.log(appt);

  const dialog = (appt) => {
    return {
      button: 'Cancel',
      title: `Would you like to cancel this appointment?`,
      content: `With ${employee.firstName} on ${appt.date} at ${appt.time}?`,
    };
  };

  return <ButtonDialog dialog={dialog(appt)} />;
};

export default CancelAppointment;
