import ButtonDialog from '@/components/ButtonDialog';
import CustomDialogContent from '@/components/CustomDialogContent';
import { useAppointment } from '@/hooks/useAppointment';
import { useDialog } from '@/hooks/useDialog';

const dialog = (newStatus) => {
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
    // button: client ? client.email : 'Loading',
    button: 'update status',
    // title: employee
    //   ? `${appointment.service} with ${employee.email}`
    //   : 'Loading',
    title: 'title text',
    content,
  };
};

export default function UpdateApptStatus({ appointment, newStatus }) {
  const { open, handleOpen, handleClose } = useDialog();
  const { handleStatusUpdate } = useAppointment();

  const dialogProps = dialog(newStatus);
  const handleAgree = (appointment, newStatus) => {
    handleStatusUpdate(appointment, newStatus);
    handleClose();
  };

  return (
    <ButtonDialog
      buttonText={dialogProps.button}
      open={open}
      handleOpen={handleOpen}
      handleClose={handleClose}
    >
      <CustomDialogContent
        dialog={dialogProps}
        handleAgree={() => handleAgree(appointment, newStatus)}
        handleClose={handleClose}
      />
    </ButtonDialog>
  );
}
