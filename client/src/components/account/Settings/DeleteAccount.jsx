import ButtonDialog from '../../ButtonDialog';
import CustomDialogContent from '../../CustomDialogContent';
import { useDialog } from '../../../hooks/useDialog';
import { useAccount } from '../../../hooks/useAccount';

const dialog = {
  button: 'Delete Account',
  title: 'Are you sure you want to delete your accout?',
  content: 'Once you agree, this action cannot be reversed.',
};

export default function DeleteAccount() {
  const { open, handleOpen, handleClose } = useDialog();
  const { handleUserDelete } = useAccount();

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
