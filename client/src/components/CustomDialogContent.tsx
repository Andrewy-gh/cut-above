import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface CustomDialogContentProps {
  dialog: {
    button: string;
    title: string;
    content: string;
  };
  handleAgree: () => void;
  handleClose: () => void;
}

export default function CustomDialogContent({
  dialog,
  handleClose,
  handleAgree,
}: CustomDialogContentProps) {
  return (
    <>
      <DialogTitle>{dialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialog.content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAgree} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </>
  );
}
