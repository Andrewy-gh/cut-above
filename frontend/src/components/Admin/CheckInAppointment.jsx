import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserById } from '../../features/user/userSlice';
import ButtonDialog from '../ButtonDialog';
import CircleProgress from '../Loading/CircleProgress';

const CheckInAppointment = ({ appointment }) => {
  const client = useSelector((state) =>
    selectUserById(state, appointment.client)
  );
  const employee = useSelector((state) =>
    selectUserById(state, appointment.employee)
  );
  console.log('appointment', appointment, client, employee);

  if (!client) {
    return <CircleProgress />;
  }

  if (!employee) {
    return <CircleProgress />;
  }

  const dialog = (appointment) => {
    return {
      button: client ? client.email : 'Loading',
      title: appointment.service,
      content: employee ? employee.email : 'Loading',
    };
  };

  return <ButtonDialog dialog={dialog(appointment)} />;
};

export default CheckInAppointment;
