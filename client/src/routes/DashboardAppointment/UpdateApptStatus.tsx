
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

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

const dialog = (newStatus: any) => {
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
    title: 'Update Status',
    content,
  };
};

export default function UpdateApptStatus({
  appointment,
  newStatus
}: any) {
  const { open, handleOpen, handleClose } = useDialog();
  const { handleStatusUpdate } = useAppointment();

  const dialogProps = dialog(newStatus);
  const handleAgree = (appointment: any, newStatus: any) => {
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

UpdateApptStatus.propTypes = {
  appointment: appointmentPropType,
  newStatus: PropTypes.string.isRequired,
};
