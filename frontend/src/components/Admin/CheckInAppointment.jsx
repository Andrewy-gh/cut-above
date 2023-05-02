import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserById } from '../../features/user/userSlice';
import ButtonDialog from '../ButtonDialog';
import CircleProgress from '../Loading/CircleProgress';
import { useUpdateAppointmentMutation } from '../../features/appointments/apptApiSlice';

const CheckInAppointment = ({ appointment }) => {
  const [updateAppointment] = useUpdateAppointmentMutation();
  const client = useSelector((state) =>
    selectUserById(state, appointment.client)
  );
  const employee = useSelector((state) =>
    selectUserById(state, appointment.employee)
  );
  if (!client) {
    return <CircleProgress />;
  }

  if (!employee) {
    return <CircleProgress />;
  }

  const dialog = (appointment) => {
    return {
      button: client ? client.email : 'Loading',
      title: employee
        ? `${appointment.service} with ${employee.email}`
        : 'Loading',
      content: 'Would you like to check-in?',
    };
  };

  const handleCheckIn = async (appointment) => {
    const checkedInAppt = await updateAppointment({
      ...appointment,
      status: 'checked-in',
    });
    console.log('checkedIn', checkedInAppt);
  };

  return (
    <ButtonDialog
      dialog={dialog(appointment)}
      agreeHandler={() => handleCheckIn(appointment)}
    />
  );
};

export default CheckInAppointment;
