import ButtonDialog from '../../ButtonDialog';
import CustomDialogContent from '../../CustomDialogContent';
import { useAppointment } from '@/hooks/useAppointment';
import { useDialog } from '@/hooks/useDialog';
import { Appointment } from '@/types';

const dialog = (appointment: Appointment) => {
  return {
    button: 'Modify',
    title: `Are you sure you want to modify your ${appointment.service}?`,
    content: `With ${
      appointment?.employee?.firstName || appointment?.client?.firstName
    } on ${appointment.date} at ${appointment.start}?`,
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
