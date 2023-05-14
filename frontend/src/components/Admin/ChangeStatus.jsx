import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserById } from '../../features/user/userSlice';
import ButtonDialog from '../ButtonDialog';
import CircleProgress from '../Loading/CircleProgress';
import { useUpdateAppointmentMutation } from '../../features/appointments/apptApiSlice';

const ChangeStatus = ({ appointment, newStatus }) => {
  const [updateAppointment] = useUpdateAppointmentMutation();
  const client = useSelector((state) =>
    selectUserById(state, appointment.client)
  );
  const employee = useSelector((state) =>
    selectUserById(state, appointment.employee)
  );
  if (!client) {
    // return <CircleProgress />;
    return <p>Removed User</p>;
  }

  if (!employee) {
    return <CircleProgress />;
  }

  const dialog = (appointment, newStatus) => {
    let content;

    if (newStatus === 'checked-in') {
      content = 'Would you like to check-in this appointment?';
    } else if (newStatus === 'completed') {
      content = 'Would you like to mark this appointment as completed?';
    } else if (newStatus === 'scheduled') {
      content =
        'This appointment has been completed. Would you like to return it back to a scheduled appointment?';
    } else {
      content = 'Unknown status';
    }
    return {
      button: client ? client.email : 'Loading',
      title: employee
        ? `${appointment.service} with ${employee.email}`
        : 'Loading',
      content,
    };
  };

  const handleAgree = async (appointment, newStatus) => {
    const checkedInAppt = await updateAppointment({
      ...appointment,
      status: newStatus,
    });
    console.log(checkedInAppt);
  };

  return (
    <ButtonDialog
      dialog={dialog(appointment, newStatus)}
      agreeHandler={() => handleAgree(appointment, newStatus)}
      closeHandler={() => void 0}
    />
  );
};

export default ChangeStatus;
