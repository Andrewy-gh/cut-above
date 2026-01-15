import ButtonDialog from '@/components/ButtonDialog';
import CustomDialogContent from '@/components/CustomDialogContent';
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
    button: 'Cancel',
    title: `Are you sure you want to cancel your ${appointment.service}?`,
    content: `With ${getName()} on ${appointment.date} at ${appointment.start}?`,
  };
};

interface CancelAppointmentProps {
  appointment: Appointment;
}

export default function CancelAppointment({
  appointment,
}: CancelAppointmentProps) {
  const { open, handleOpen, handleClose } = useDialog();
  const { handleCancel } = useAppointment();

  const dialogProps = dialog(appointment);

  return (
    <ButtonDialog
      buttonText={dialogProps.button}
      open={open}
      handleOpen={handleOpen}
      handleClose={handleClose}
      color={'error'}
    >
      <CustomDialogContent
        dialog={dialogProps}
        handleAgree={() => handleCancel(appointment.id)}
        handleClose={handleClose}
      />
    </ButtonDialog>
  );
}
