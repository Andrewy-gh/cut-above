
// @ts-expect-error TS(2307): Cannot find module '@/components/ButtonDialog' or ... Remove this comment to see the full error message
import ButtonDialog from '@/components/ButtonDialog';

// @ts-expect-error TS(2307): Cannot find module '@/components/CustomDialogConte... Remove this comment to see the full error message
import CustomDialogContent from '@/components/CustomDialogContent';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAppointment' or its... Remove this comment to see the full error message
import { useAppointment } from '@/hooks/useAppointment';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useDialog' or its corr... Remove this comment to see the full error message
import { useDialog } from '@/hooks/useDialog';

// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { appointmentPropType } from '@/utils/propTypes';

const dialog = (appointment: any) => {
  return {
    button: 'Cancel',
    title: `Are you sure you want to cancel your ${appointment.service}?`,
    content: `With ${
      appointment?.employee?.firstName || appointment?.client?.firstName
    } on ${appointment.date} at ${appointment.start}?`,
  };
};

export default function CancelAppointment({
  appointment
}: any) {
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
