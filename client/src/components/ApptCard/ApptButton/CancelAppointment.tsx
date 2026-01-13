import ButtonDialog from '@/components/ButtonDialog';
import CustomDialogContent from '@/components/CustomDialogContent';
import { useAppointment } from '@/hooks/useAppointment';
import { useDialog } from '@/hooks/useDialog';
import { appointmentPropType } from '@/utils/propTypes';

const dialog = (appointment) => {
  return {
    button: 'Cancel',
    title: `Are you sure you want to cancel your ${appointment.service}?`,
    content: `With ${
      appointment?.employee?.firstName || appointment?.client?.firstName
    } on ${appointment.date} at ${appointment.start}?`,
  };
};

export default function CancelAppointment({ appointment }) {
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

CancelAppointment.propTypes = {
  appointment: appointmentPropType,
};
