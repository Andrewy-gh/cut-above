import ButtonDialog from '@/components/ButtonDialog';
import CustomDialogContent from '@/components/CustomDialogContent';
import { useAppointment } from '@/hooks/useAppointment';
import { useDialog } from '@/hooks/useDialog';
import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';
import { theme } from '@/styles/styles';

const dialog = (appointment, employee) => {
  return {
    button: 'Cancel',
    title: `Are you sure you want to cancel your ${appointment.service}?`,
    content: `With ${employee.firstName} on ${appointment.date} at ${appointment.start}?`,
  };
};

const buttonStyle = {
  color: theme.palette.secondary.dark,
};

export default function CancelAppointment({ appointment, token }) {
  const { open, handleOpen, handleClose } = useDialog();
  const { employee } = useEmployeesQuery(appointment.employee);
  const { handleCancel } = useAppointment();

  if (!employee) return <div>Loading...</div>;

  const dialogProps = dialog(appointment, employee);

  return (
    <ButtonDialog
      buttonText={dialogProps.button}
      open={open}
      handleOpen={handleOpen}
      handleClose={handleClose}
      color={'error'}
      buttonStyle={buttonStyle}
    >
      <CustomDialogContent
        dialog={dialogProps}
        handleAgree={() => handleCancel(appointment.id, token)}
        handleClose={handleClose}
      />
    </ButtonDialog>
  );
}
