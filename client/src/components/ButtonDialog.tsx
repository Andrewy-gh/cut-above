import Button from '@mui/material/Button';
import CustomDialog from './CustomDialog';
import { theme } from '@/styles/styles';
import PropTypes from 'prop-types';

const buttonStyle = {
  color: theme.palette.secondary.dark,
};

export default function ButtonDialog(props) {
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
