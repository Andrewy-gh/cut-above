import ButtonDialog from '../../ButtonDialog';
import CustomDialogContent from '../../CustomDialogContent';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAppointment' or its... Remove this comment to see the full error message
import { useAppointment } from '@/hooks/useAppointment';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useDialog' or its corr... Remove this comment to see the full error message
import { useDialog } from '@/hooks/useDialog';

// @ts-expect-error TS(2307): Cannot find module '@/utils/propTypes' or its corr... Remove this comment to see the full error message
import { appointmentPropType } from '@/utils/propTypes';

const dialog = (appointment: any) => {
  return {
    button: 'Modify',
    title: `Are you sure you want to modify your ${appointment.service}?`,
    content: `With ${
      appointment?.employee?.firstName || appointment?.client?.firstName
    } on ${appointment.date} at ${appointment.start}?`,
  };
};

export default function ModifyAppointment({
  appointment
}: any) {
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

ModifyAppointment.propTypes = {
  appointment: appointmentPropType,
};
