import { ReactNode } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CustomDialog from './CustomDialog';
import { theme } from '@/styles/styles';

const buttonStyle = {
  color: theme.palette.secondary.dark,
};

interface ButtonDialogProps extends Omit<ButtonProps, 'onClick'> {
  children?: ReactNode;
  buttonText: string;
  open: boolean;
  handleOpen: () => void;
  handleClose: () => void;
}

export default function ButtonDialog(props: ButtonDialogProps) {
  const {
    children,
    buttonText,
    open,
    handleOpen,
    handleClose,
    variant = 'contained',
    ...buttonProps
  } = props;
  return (
    <>
      <Button
        variant={variant}
        sx={buttonStyle}
        onClick={handleOpen}
        {...buttonProps}
      >
        {buttonText}
      </Button>
      <CustomDialog open={open} handleClose={handleClose}>
        {children}
      </CustomDialog>
    </>
  );
}
