
// @ts-expect-error TS(2307): Cannot find module '@/components/ButtonDialog' or ... Remove this comment to see the full error message
import ButtonDialog from '@/components/ButtonDialog';

// @ts-expect-error TS(2307): Cannot find module '@/components/CustomDialogConte... Remove this comment to see the full error message
import CustomDialogContent from '@/components/CustomDialogContent';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useDialog' or its corr... Remove this comment to see the full error message
import { useDialog } from '@/hooks/useDialog';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAuth' or its corres... Remove this comment to see the full error message
import { useAuth } from '@/hooks/useAuth';

const dialog = {
  button: 'Delete Account',
  title: 'Are you sure you want to delete your accout?',
  content: 'Once you agree, this action cannot be reversed.',
};

export default function DeleteAccount() {
  const { open, handleOpen, handleClose } = useDialog();
  const { handleUserDelete } = useAuth();

  return (
    <ButtonDialog
      buttonText={dialog.button}
      fullWidth={true}
      open={open}
      handleOpen={handleOpen}
      handleClose={handleClose}
    >
      <CustomDialogContent
        dialog={dialog}
        handleAgree={handleUserDelete}
        handleClose={handleClose}
      />
    </ButtonDialog>
  );
}
