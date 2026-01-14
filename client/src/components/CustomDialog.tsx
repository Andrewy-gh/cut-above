import { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import { theme } from '../styles/styles';

interface CustomDialogProps {
  children?: ReactNode;
  open: boolean;
  handleClose?: () => void;
}

export default function CustomDialog({
  children,
  open,
  handleClose,
}: CustomDialogProps) {
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
      maxWidth="lg"
    >
      {children}
    </Dialog>
  );
}
