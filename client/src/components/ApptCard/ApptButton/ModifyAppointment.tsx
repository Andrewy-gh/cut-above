import ButtonDialog from '../../ButtonDialog';
import CustomDialogContent from '../../CustomDialogContent';
import { useAppointment } from '@/hooks/useAppointment';
import { useDialog } from '@/hooks/useDialog';
import { Appointment } from '@/types';

const dialog = (appointment: Appointment) => {
  const getName = () => {
    if (appointment.employee && typeof appointment.employee === 'object') {
      return appointment.employee.firstName;
    }
    if (appointment.client && typeof appointment.client === 'object') {
      return appointment.client.firstName;
    }
    return '';
  };

  return {
    button: 'Modify',
    title: `Are you sure you want to modify your ${appointment.service}?`,
    content: `With ${getName()} on ${appointment.date} at ${appointment.start}?`,
  };
};

interface ModifyAppointmentProps {
  appointment: Appointment;
}

export default function ModifyAppointment({
  appointment,
}: ModifyAppointmentProps) {
  const { open, handleOpen, handleClose } = useDialog();
  const { handleBeginRescheduling } = useAppointment();

  const dialogProps = dialog(appointment);

  return (
    <ButtonDialog
      buttonText={dialogProps.button}
      open={open}
      handleOpen={handleOpen}
      handleClose={handleClose}
    >
      <CustomDialogContent
        dialog={dialogProps}
        handleAgree={() => handleBeginRescheduling(appointment.id)}
        handleClose={handleClose}
      />
    </ButtonDialog>
  );
}
