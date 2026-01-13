import Button from '@mui/material/Button';
import CustomDialog from './CustomDialog';

// @ts-expect-error TS(2307): Cannot find module '@/styles/styles' or its corres... Remove this comment to see the full error message
import { theme } from '@/styles/styles';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

const buttonStyle = {
  color: theme.palette.secondary.dark,
};

export default function ButtonDialog(props: any) {
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

ButtonDialog.propTypes = {
  children: PropTypes.object,
  buttonText: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleOpen: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  variant: PropTypes.string,
};
