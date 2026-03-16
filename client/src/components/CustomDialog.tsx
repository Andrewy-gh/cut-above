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
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #181818 0%, #1f1f1f 100%)',
          border: '1px solid #2a2a2a',
          borderRadius: '1rem',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        },
      }}
    >
      {children}
    </Dialog>
  );
}
