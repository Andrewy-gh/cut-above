import ButtonDialog from '@/components/ButtonDialog';
import CustomDialogContent from '@/components/CustomDialogContent';
import { useAppointment } from '@/hooks/useAppointment';
import { useDialog } from '@/hooks/useDialog';
import { Appointment } from '@/types';

const dialog = (newStatus: string) => {
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
    button: 'update status',
    title: 'Update Status',
    content,
  };
};

interface UpdateApptStatusProps {
  appointment: Appointment;
  newStatus: string;
}

export default function UpdateApptStatus({
  appointment,
  newStatus,
}: UpdateApptStatusProps) {
  const { open, handleOpen, handleClose } = useDialog();
  const { handleStatusUpdate } = useAppointment();

  const dialogProps = dialog(newStatus);
  const handleAgree = (id: string, newStatus: string) => {
    handleStatusUpdate(id, newStatus);
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
        handleAgree={() => handleAgree(appointment.id, newStatus)}
        handleClose={handleClose}
      />
    </ButtonDialog>
  );
}
